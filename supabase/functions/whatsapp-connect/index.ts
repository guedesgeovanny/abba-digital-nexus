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

    // Fazer a requisição GET para o webhook externo
    console.log('Making GET request to external webhook...');
    const url = new URL('https://webhook.abbadigital.com.br/webhook/conecta-mp-brasil');
    url.searchParams.append('instanceName', instanceName);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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

    // Iniciar polling em background para verificar o status da conexão
    const pollForConnection = async () => {
      console.log('Starting background polling for connection status...');
      const maxAttempts = 60; // 60 tentativas = 5 minutos
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for instance: ${instanceName}`);
          
          const pollResponse = await fetch('https://webhook.abbadigital.com.br/webhook/verifica-status-mp-brasil', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instanceName: instanceName
            })
          });
          
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            console.log('Polling response:', pollData);
            
            // Verificar se a conexão foi estabelecida (pode ajustar a condição conforme a resposta do webhook)
            if (pollData && (pollData.connected || pollData.status === 'connected' || pollData.state === 'connected')) {
              console.log('Connection established successfully!');
              break;
            }
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5 segundos entre tentativas
          
        } catch (error) {
          console.error(`Polling error on attempt ${attempts + 1}:`, error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      if (attempts >= maxAttempts) {
        console.log('Polling timeout reached - connection status unknown');
      }
    };

    // Executar polling em background
    EdgeRuntime.waitUntil(pollForConnection());

    return new Response(
      JSON.stringify({ 
        ...responseData, 
        polling: true,
        message: 'Connection request sent, polling for status...' 
      }),
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