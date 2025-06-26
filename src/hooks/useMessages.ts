
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
      fetchMessages()
    } else {
      setMessages([])
      setIsLoading(false)
    }
  }, [conversationId, user])

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
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
    if (!conversationId || !user) return

    try {
      setIsSending(true)
      
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
      
      if (messageError) throw messageError
      
      // Atualizar a última mensagem da conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)
      
      if (conversationError) throw conversationError
      
      // Garantir tipagem correta ao adicionar mensagem
      const typedMessage: Message = {
        ...newMessage,
        message_type: messageType
      }
      
      setMessages(prev => [...prev, typedMessage])
      
      console.log('Mensagem enviada:', content)
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
