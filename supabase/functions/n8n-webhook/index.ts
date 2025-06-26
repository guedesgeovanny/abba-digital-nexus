
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookMessage {
  conversation_id: string  // UUID da conversa
  content: string
  direction: 'sent' | 'received'
  message_type?: 'text' | 'image' | 'audio' | 'document' | 'file'
  sender_name?: string
  contact_name?: string
  contact_phone?: string
  contact_username?: string
  contact_avatar?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Webhook do n8n recebido')
    
    // Criar cliente Supabase com service_role para contornar RLS
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const messageData: WebhookMessage = await req.json()
    console.log('📋 Dados recebidos:', messageData)

    // Validar dados obrigatórios
    if (!messageData.conversation_id || !messageData.content) {
      console.error('❌ Dados obrigatórios não fornecidos')
      return new Response(
        JSON.stringify({ error: 'conversation_id e content são obrigatórios' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Converter UUID da conversa para número usando a função do banco
    console.log('🔄 Convertendo UUID para número:', messageData.conversation_id)
    
    const { data: conversationNumber, error: numberError } = await supabaseServiceRole
      .rpc('get_conversation_number', { conversation_uuid: messageData.conversation_id })
    
    if (numberError) {
      console.error('❌ Erro ao converter UUID para número:', numberError)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar conversation_id' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Número da conversa:', conversationNumber)

    // Inserir mensagem na tabela messages
    const { data: newMessage, error: messageError } = await supabaseServiceRole
      .from('messages')
      .insert({
        conversation_id: conversationNumber,
        content: messageData.content,
        direction: messageData.direction || 'received',
        message_type: messageData.message_type || 'text',
        sender_name: messageData.sender_name || null
      })
      .select()
      .single()

    if (messageError) {
      console.error('❌ Erro ao inserir mensagem:', messageError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar mensagem', details: messageError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Mensagem inserida:', newMessage)

    // Atualizar a última mensagem da conversa
    const { error: conversationError } = await supabaseServiceRole
      .from('conversations')
      .update({
        last_message: messageData.content,
        last_message_at: new Date().toISOString(),
        // Atualizar dados do contato se fornecidos
        ...(messageData.contact_name && { contact_name: messageData.contact_name }),
        ...(messageData.contact_phone && { contact_phone: messageData.contact_phone }),
        ...(messageData.contact_username && { contact_username: messageData.contact_username }),
        ...(messageData.contact_avatar && { contact_avatar: messageData.contact_avatar })
      })
      .eq('id', messageData.conversation_id)

    if (conversationError) {
      console.error('⚠️ Erro ao atualizar conversa (não crítico):', conversationError)
      // Não retornar erro aqui pois a mensagem já foi salva
    } else {
      console.log('✅ Conversa atualizada')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem processada com sucesso',
        conversation_number: conversationNumber,
        message_id: newMessage.conversation_id + '_' + newMessage.created_at
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
