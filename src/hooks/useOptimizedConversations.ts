import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface OptimizedConversation {
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
  assigned_to: string | null
  crm_stage: string | null
  created_at: string
  updated_at: string
}

export const useOptimizedConversations = () => {
  const { user, userProfile } = useAuth()
  const [conversations, setConversations] = useState<OptimizedConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isAdmin = userProfile?.role === 'admin'

  // Fetch conversations with optimized single query
  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('🚀 Fetching conversations with optimized query...')

      // Single optimized query with all necessary data
      const { data, error: queryError } = await supabase.rpc('get_optimized_conversations', {
        user_id_param: user.id,
        is_admin_param: isAdmin
      })

      if (queryError) {
        console.error('❌ Query error:', queryError)
        throw queryError
      }

      console.log('✅ Conversations loaded:', data?.length || 0)
      
      // Transform data to match interface
      const transformedConversations = (data || []).map((conv: any) => ({
        ...conv,
        status: conv.status === 'fechada' ? 'fechada' : 'aberta',
        unread_count: conv.unread_count || 0
      })) as OptimizedConversation[]

      setConversations(transformedConversations)
    } catch (error) {
      console.error('❌ Error fetching conversations:', error)
      setError(error as Error)
      toast({
        title: "Erro",
        description: "Falha ao carregar conversas. Tentando novamente...",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, isAdmin])

  // Optimistic update for conversation status
  const updateConversationStatus = useCallback(async (conversationId: string, status: 'aberta' | 'fechada') => {
    try {
      // Optimistic update
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, status } : conv
        )
      )

      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)

      if (error) {
        // Revert optimistic update
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? { ...conv, status: status === 'aberta' ? 'fechada' : 'aberta' } : conv
          )
        )
        throw error
      }

      console.log(`✅ Conversation ${conversationId} status updated to ${status}`)
    } catch (error) {
      console.error('❌ Error updating conversation status:', error)
      throw error
    }
  }, [])

  // Mark conversation as read with optimistic update
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      // Optimistic update
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      )

      // Upsert read status
      const { error } = await supabase
        .from('conversation_read_status')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,conversation_id'
        })

      if (error) {
        console.error('❌ Error marking as read:', error)
        // Don't revert this one, it's not critical
      }
    } catch (error) {
      console.error('❌ Error in markConversationAsRead:', error)
    }
  }, [user])

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return

    const conversationChannel = supabase
      .channel('optimized-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('🔄 Conversation updated via realtime:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as OptimizedConversation
            // Only add if user can see it based on policies
            if (isAdmin || newConv.user_id === user.id || newConv.assigned_to === user.id || !newConv.assigned_to) {
              setConversations(prev => [newConv, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedConv = payload.new as OptimizedConversation
            setConversations(prev => 
              prev.map(conv => 
                conv.id === updatedConv.id ? { ...conv, ...updatedConv } : conv
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setConversations(prev => prev.filter(conv => conv.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Message updates for unread counts
    const messageChannel = supabase
      .channel('optimized-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const message = payload.new
          if (message.direcao === 'received') {
            setConversations(prev => 
              prev.map(conv => {
                if (conv.id === message.conversa_id) {
                  return {
                    ...conv,
                    last_message: message.mensagem,
                    last_message_at: message.data_hora || message.created_at,
                    unread_count: conv.unread_count + 1,
                    status: 'aberta' // Reopen if closed
                  }
                }
                return conv
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [user, isAdmin])

  // Initial load
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    isLoading,
    error,
    updateConversationStatus,
    markConversationAsRead,
    refetch: fetchConversations
  }
}