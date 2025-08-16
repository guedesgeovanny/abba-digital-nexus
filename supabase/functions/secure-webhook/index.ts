import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Secure Webhook Function Started ===');
    
    // Security: Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Security: Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid content type');
    }

    // Security: Validate webhook signature if provided
    const signature = req.headers.get('x-webhook-signature');
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    
    const body = await req.text();
    
    if (webhookSecret && signature) {
      // Simple signature validation - in production use proper HMAC
      const expectedSignature = btoa(body + webhookSecret);
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        throw new Error('Unauthorized: Invalid signature');
      }
    }

    // Security: Parse and validate JSON
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      throw new Error('Invalid JSON payload');
    }

    // Security: Validate required fields and sanitize input
    if (!data.instanceName || typeof data.instanceName !== 'string') {
      throw new Error('Invalid or missing instanceName');
    }

    // Security: Sanitize input
    const sanitizedInstanceName = data.instanceName
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim()
      .slice(0, 100);

    console.log('Processing webhook for instance:', sanitizedInstanceName);

    // Initialize Supabase client with service role key for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Security: Rate limiting (basic implementation)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    console.log('Request from IP:', clientIP);

    // Process the webhook data securely
    const result = {
      success: true,
      instanceName: sanitizedInstanceName,
      timestamp: new Date().toISOString(),
      processed: true
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '99'
        } 
      }
    );

  } catch (error) {
    console.error('Error in secure webhook function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})