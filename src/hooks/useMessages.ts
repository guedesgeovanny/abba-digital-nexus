
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Message {
  id: string
  conversation_id: string
  content: string
  direction: 'sent' | 'received'
  message_type: 'text' | 'image' | 'audio' | 'document' | 'file'
  sender_name: string | null
  read_at: string | null
  created_at: string
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (conversationId && user) {
      console.log('Carregando mensagens para conversa:', conversationId)
      fetchMessages()
    } else {
      console.log('Sem conversa selecionada ou usuário não logado')
      setMessages([])
      setIsLoading(false)
    }
  }, [conversationId, user])

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fazendo query de mensagens...')
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Erro na query de mensagens:', error)
        throw error
      }
      
      console.log('Mensagens retornadas:', data)
      
      // Garantir que message_type seja do tipo correto
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type as Message['message_type']) || 'text'
      }))
      
      setMessages(typedMessages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async ({ content, messageType = 'text' }: { content: string, messageType?: Message['message_type'] }) => {
    if (!conversationId || !user) {
      console.error('Conversa ou usuário não disponível')
      return
    }

    try {
      setIsSending(true)
      console.log('Enviando mensagem:', { content, messageType, conversationId })
      
      // Inserir a nova mensagem
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          direction: 'sent' as const,
          message_type: messageType,
          sender_name: 'Você'
        })
        .select()
        .single()
      
      if (messageError) {
        console.error('Erro ao inserir mensagem:', messageError)
        throw messageError
      }
      
      console.log('Mensagem inserida:', newMessage)
      
      // Atualizar a última mensagem da conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('Erro ao atualizar conversa:', conversationError)
        throw conversationError
      }
      
      console.log('Conversa atualizada')
      
      // Garantir tipagem correta ao adicionar mensagem
      const typedMessage: Message = {
        ...newMessage,
        message_type: messageType
      }
      
      setMessages(prev => [...prev, typedMessage])
      
      console.log('Mensagem enviada com sucesso:', content)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setError(error as Error)
    } finally {
      setIsSending(false)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    refetch: fetchMessages
  }
}
