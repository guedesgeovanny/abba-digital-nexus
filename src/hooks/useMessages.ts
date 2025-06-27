
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Message {
  numero: number
  conversa_id: string
  mensagem: string
  direcao: 'sent' | 'received'
  nome_contato: string | null
  data_hora: string | null
  created_at: string
  updated_at: string | null
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
      
      // Buscar mensagens usando os novos nomes das colunas
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversa_id', conversationId)
        .order('data_hora', { ascending: true })
      
      if (error) {
        console.error('Erro na query de mensagens:', error)
        throw error
      }
      
      console.log('Mensagens retornadas:', data)
      
      // Garantir que os tipos sejam corretos
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        direcao: msg.direcao as 'sent' | 'received'
      }))
      
      setMessages(typedMessages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async ({ content }: { content: string }) => {
    if (!conversationId || !user) {
      console.error('Conversa ou usuário não disponível')
      return
    }

    try {
      setIsSending(true)
      console.log('Enviando mensagem:', { content, conversationId })
      
      // Inserir a nova mensagem usando os novos nomes das colunas
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversa_id: conversationId,
          mensagem: content,
          direcao: 'sent' as const,
          nome_contato: 'Você',
          data_hora: new Date().toISOString()
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
        direcao: newMessage.direcao as 'sent' | 'received'
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
