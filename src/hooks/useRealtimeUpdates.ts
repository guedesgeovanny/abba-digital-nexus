import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Channel for contacts updates
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Contact change detected:', payload)
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['contacts'] })
          queryClient.invalidateQueries({ queryKey: ['contact-details'] })
          queryClient.invalidateQueries({ queryKey: ['crm-conversations'] })
        }
      )
      .subscribe()

    // Channel for conversations updates
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Conversation change detected:', payload)
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['crm-conversations'] })
          queryClient.invalidateQueries({ queryKey: ['contacts'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [user, queryClient])
}