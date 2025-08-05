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

    // Buscar o QR code uma única vez no endpoint correto
    console.log('Fetching QR code from conecta-mp-brasil...');
    const qrUrl = new URL('https://webhook.abbadigital.com.br/webhook/conecta-mp-brasil');
    qrUrl.searchParams.append('instanceName', instanceName);
    
    const qrResponse = await fetch(qrUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    let qrData = null;
    if (qrResponse.ok) {
      qrData = await qrResponse.json();
      console.log('QR Code data received:', qrData);
    }

    // Iniciar polling para verificar o status da conexão
    const pollForConnection = async () => {
      console.log('Starting background polling for connection status...');
      const maxAttempts = 60; // 60 tentativas = 5 minutos
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for instance: ${instanceName}`);
          
          const statusUrl = new URL('https://webhook.abbadigital.com.br/webhook/verifica-status-mp-brasil');
          statusUrl.searchParams.append('instanceName', instanceName);
          
          const pollResponse = await fetch(statusUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            console.log('Status polling response:', pollData);
            
            // Verificar se a conexão foi estabelecida (status = "open")
            if (pollData && pollData.status === 'open') {
              console.log('Connection established successfully!');
              console.log('Profile data:', {
                profileName: pollData.profilename,
                contact: pollData.contato,
                profilePictureUrl: pollData.fotodoperfil
              });
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
        ...qrData,
        polling: true,
        message: 'QR code fetched and polling for connection status...' 
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