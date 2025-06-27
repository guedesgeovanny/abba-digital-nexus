
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Conversation {
  id: string
  user_id: string
  contact_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_username: string | null
  contact_avatar: string | null
  status: 'aberta' | 'fechada'
  channel: 'whatsapp' | 'instagram' | 'messenger' | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('Usuário logado, carregando conversas...')
      fetchConversations()
    } else {
      console.log('Usuário não logado')
      setConversations([])
      setIsLoading(false)
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fazendo query no Supabase para conversas...')
      
      // Buscar todas as conversas do usuário
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (conversationsError) {
        console.error('Erro na query de conversas:', conversationsError)
        throw conversationsError
      }
      
      console.log('Conversas retornadas:', conversationsData)
      
      if (!conversationsData || conversationsData.length === 0) {
        setConversations([])
        return
      }

      // Para cada conversa, buscar a mensagem mais recente e contar não lidas
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            // Buscar a mensagem mais recente desta conversa usando os novos nomes das colunas
            const { data: lastMessage, error: messageError } = await supabase
              .from('messages')
              .select('mensagem, data_hora, direcao')
              .eq('conversa_id', conversation.id)
              .order('data_hora', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (messageError) {
              console.error('Erro ao buscar última mensagem:', messageError)
            }

            // Contar mensagens não lidas (recebidas)
            const { count: unreadCount, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversa_id', conversation.id)
              .eq('direcao', 'received')

            if (countError) {
              console.error('Erro ao contar mensagens não lidas:', countError)
            }

            return {
              ...conversation,
              last_message: lastMessage?.mensagem || conversation.last_message,
              last_message_at: lastMessage?.data_hora || conversation.last_message_at,
              unread_count: unreadCount || 0
            }
          } catch (error) {
            console.error('Erro ao processar conversa:', error)
            return {
              ...conversation,
              last_message: conversation.last_message,
              last_message_at: conversation.last_message_at,
              unread_count: 0
            }
          }
        })
      )

      // Ordenar por última mensagem (mais recente primeiro)
      const sortedConversations = conversationsWithMessages.sort((a, b) => {
        const dateA = new Date(a.last_message_at || a.updated_at)
        const dateB = new Date(b.last_message_at || b.updated_at)
        return dateB.getTime() - dateA.getTime()
      })

      setConversations(sortedConversations)
      console.log('Conversas processadas com mensagens:', sortedConversations)
      
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      setIsDeleting(true)

      // Deletar todas as mensagens da conversa primeiro usando o novo nome da coluna
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversa_id', conversationId)
      
      if (messagesError) {
        console.error('Erro ao deletar mensagens:', messagesError)
        throw messagesError
      }

      // Depois deletar a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('Erro ao deletar conversa:', conversationError)
        throw conversationError
      }
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      console.log(`Conversa ${conversationId} e suas mensagens excluídas`)
    } catch (error) {
      console.error('Erro ao excluir conversa:', error)
      setError(error as Error)
    } finally {
      setIsDeleting(false)
    }
  }

  const updateConversationStatus = async (conversationId: string, status: 'aberta' | 'fechada') => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
      
      if (error) throw error
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, status } : conv
      ))
      console.log(`Status da conversa ${conversationId} alterado para ${status}`)
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error)
      setError(error as Error)
    }
  }

  const createConversation = async (conversationData: {
    contact_id?: string
    contact_name: string
    contact_phone?: string
    contact_username?: string
    contact_avatar?: string
    channel?: 'whatsapp' | 'instagram' | 'messenger'
    last_message?: string
  }) => {
    try {
      console.log('Criando nova conversa:', conversationData)
      console.log('User ID:', user?.id)
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          contact_id: conversationData.contact_id || null,
          contact_name: conversationData.contact_name,
          contact_phone: conversationData.contact_phone || null,
          contact_username: conversationData.contact_username || null,
          contact_avatar: conversationData.contact_avatar || null,
          channel: conversationData.channel || null,
          last_message: conversationData.last_message || null,
          last_message_at: new Date().toISOString(),
          status: 'aberta'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir conversa:', error)
        throw error
      }
      
      console.log('Conversa criada com sucesso:', data)
      setConversations(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      setError(error as Error)
      throw error
    }
  }

  return {
    conversations,
    isLoading,
    error,
    deleteConversation,
    updateConversationStatus,
    createConversation,
    isDeleting,
    refetch: fetchConversations
  }
}
