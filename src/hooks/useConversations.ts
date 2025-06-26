
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface Conversation {
  id: string
  user_id: string
  agent_id: string | null
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
      fetchConversations()
    } else {
      setConversations([])
      setIsLoading(false)
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })
      
      if (error) throw error
      
      setConversations(data || [])
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
      
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (error) throw error
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      console.log(`Conversa ${conversationId} excluída`)
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
      
      if (error) throw error
      
      setConversations(prev => [data, ...prev])
      console.log('Nova conversa criada:', data.id)
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
