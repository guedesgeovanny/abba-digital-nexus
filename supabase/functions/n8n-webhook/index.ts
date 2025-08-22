
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input sanitization function
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 1000) // Limit length
}

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
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
  connection_name?: string
  connection_account?: string
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

    // Enhanced input validation and sanitization
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

    // Validate UUID format
    if (!isValidUUID(messageData.conversation_id)) {
      console.error('❌ UUID inválido')
      return new Response(
        JSON.stringify({ error: 'conversation_id deve ser um UUID válido' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize all string inputs
    const sanitizedData = {
      ...messageData,
      content: sanitizeInput(messageData.content),
      sender_name: messageData.sender_name ? sanitizeInput(messageData.sender_name) : undefined,
      contact_name: messageData.contact_name ? sanitizeInput(messageData.contact_name) : undefined,
      contact_phone: messageData.contact_phone ? sanitizeInput(messageData.contact_phone) : undefined,
      contact_username: messageData.contact_username ? sanitizeInput(messageData.contact_username) : undefined,
      contact_avatar: messageData.contact_avatar ? sanitizeInput(messageData.contact_avatar) : undefined,
      connection_name: messageData.connection_name ? sanitizeInput(messageData.connection_name) : undefined,
      connection_account: messageData.connection_account ? sanitizeInput(messageData.connection_account) : undefined,
    }

    // Validate direction
    if (sanitizedData.direction && !['sent', 'received'].includes(sanitizedData.direction)) {
      console.error('❌ Direção inválida')
      return new Response(
        JSON.stringify({ error: 'direction deve ser "sent" ou "received"' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Converter UUID da conversa para número usando a função do banco
    console.log('🔄 Convertendo UUID para número:', sanitizedData.conversation_id)
    
    const { data: conversationNumber, error: numberError } = await supabaseServiceRole
      .rpc('get_conversation_number', { conversation_uuid: sanitizedData.conversation_id })
    
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
        conversa_id: sanitizedData.conversation_id,
        mensagem: sanitizedData.content,
        direcao: sanitizedData.direction || 'received',
        nome_contato: sanitizedData.sender_name || sanitizedData.contact_name || null,
        data_hora: new Date().toISOString(),
        connection_name: sanitizedData.connection_name || null,
        connection_account: sanitizedData.connection_account || null
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
        last_message: sanitizedData.content,
        last_message_at: new Date().toISOString(),
        // Atualizar dados do contato se fornecidos
        ...(sanitizedData.contact_name && { contact_name: sanitizedData.contact_name }),
        ...(sanitizedData.contact_phone && { contact_phone: sanitizedData.contact_phone }),
        ...(sanitizedData.contact_username && { contact_username: sanitizedData.contact_username }),
        ...(sanitizedData.contact_avatar && { contact_avatar: sanitizedData.contact_avatar })
      })
      .eq('id', sanitizedData.conversation_id)

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
