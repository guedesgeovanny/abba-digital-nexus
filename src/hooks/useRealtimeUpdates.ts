import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    console.log('🔄 Setting up realtime updates for user:', user.id)

    // Channel for contacts updates - Listen to ALL changes (removed user filter)
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('📞 Contact change detected:', payload)
          // Force refresh of all related data
          queryClient.invalidateQueries({ queryKey: ['contacts'] })
          queryClient.invalidateQueries({ queryKey: ['contact-details'] })
          queryClient.invalidateQueries({ queryKey: ['crm-conversations'] })
          
          // Force refetch immediately
          queryClient.refetchQueries({ queryKey: ['contacts'] })
          queryClient.refetchQueries({ queryKey: ['crm-conversations'] })
        }
      )
      .subscribe()

    // Channel for conversations updates - Listen to ALL changes (removed user filter)
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('💬 Conversation change detected:', payload)
          // Force refresh of all related data
          queryClient.invalidateQueries({ queryKey: ['crm-conversations'] })
          queryClient.invalidateQueries({ queryKey: ['contacts'] })
          
          // Force refetch immediately
          queryClient.refetchQueries({ queryKey: ['crm-conversations'] })
          queryClient.refetchQueries({ queryKey: ['contacts'] })
        }
      )
      .subscribe()

    // Channel for custom stages updates
    const stagesChannel = supabase
      .channel('stages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_stages'
        },
        (payload) => {
          console.log('🎯 Custom stage change detected:', payload)
          queryClient.invalidateQueries({ queryKey: ['crm-conversations'] })
          queryClient.refetchQueries({ queryKey: ['crm-conversations'] })
        }
      )
      .subscribe()

    console.log('✅ Realtime channels subscribed')

    return () => {
      console.log('🔌 Cleaning up realtime channels')
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(stagesChannel)
    }
  }, [user, queryClient])
}