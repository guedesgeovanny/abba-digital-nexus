
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface Conversation {
  id: string
  user_id: string
  agent_id: string | null
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
  const queryClient = useQueryClient()

  const {
    data: conversations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar conversas:', error)
        throw error
      }

      return data as Conversation[]
    },
    enabled: !!user
  })

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Erro ao excluir conversa:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })

  const updateConversationStatusMutation = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string, status: 'aberta' | 'fechada' }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Erro ao atualizar status da conversa:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })

  return {
    conversations,
    isLoading,
    error,
    deleteConversation: deleteConversationMutation.mutate,
    updateConversationStatus: updateConversationStatusMutation.mutate,
    isDeleting: deleteConversationMutation.isPending
  }
}
