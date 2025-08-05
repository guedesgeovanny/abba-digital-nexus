import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== WhatsApp Connect Function Started ===');
    
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { instanceName } = await req.json();
    console.log('Instance name received:', instanceName);

    if (!instanceName) {
      throw new Error('Instance name is required');
    }

    // Fazer a requisição GET com o body para o webhook externo
    console.log('Making request to external webhook...');
    const response = await fetch('https://webhook.abbadigital.com.br/webhook/conecta-mp-brasil', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: instanceName
      })
    });

    console.log('External webhook response status:', response.status);
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('External webhook response data:', responseData);
    } catch (error) {
      console.log('Failed to parse JSON response:', error);
      responseData = { status: 'success', message: 'Request sent successfully' };
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in whatsapp-connect function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})