
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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
  const queryClient = useQueryClient()

  const {
    data: messages = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !user) return []
      
      // Verificar se a conversa pertence ao usuário
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!conversation) {
        throw new Error('Conversa não encontrada ou não autorizada')
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro ao buscar mensagens:', error)
        throw error
      }

      return data as Message[]
    },
    enabled: !!conversationId && !!user
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string, messageType?: Message['message_type'] }) => {
      if (!conversationId || !user) return

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          direction: 'sent',
          message_type: messageType,
          sender_name: user.user_metadata?.full_name || 'Você'
        })

      if (error) {
        console.error('Erro ao enviar mensagem:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending
  }
}
