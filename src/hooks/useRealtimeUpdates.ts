import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    if (!user) return

    console.log('🔄 [REALTIME] Setting up enhanced realtime updates for user:', user.id)

    // Enhanced contacts channel with aggressive invalidation
    const contactsChannel = supabase
      .channel('contacts-changes-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          const now = Date.now()
          console.log('📞 [REALTIME] Contact change detected:', {
            event: payload.eventType,
            table: payload.table,
            record: payload.new || payload.old,
            timestamp: new Date().toISOString()
          })
          
          // Aggressive cache invalidation
          queryClient.removeQueries({ queryKey: ['contacts'] })
          queryClient.removeQueries({ queryKey: ['crm-conversations'] })
          queryClient.removeQueries({ queryKey: ['contact-details'] })
          
          // Force immediate refetch with stale time override
          queryClient.refetchQueries({ 
            queryKey: ['crm-conversations'],
            type: 'active'
          })
          queryClient.refetchQueries({ 
            queryKey: ['contacts'],
            type: 'active'
          })
          
          lastUpdateRef.current = now
          console.log('📞 [REALTIME] Contact data invalidated and refetched')
        }
      )
      .subscribe()

    // Enhanced conversations channel
    const conversationsChannel = supabase
      .channel('conversations-changes-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          const now = Date.now()
          console.log('💬 [REALTIME] Conversation change detected:', {
            event: payload.eventType,
            table: payload.table,
            record: payload.new || payload.old,
            timestamp: new Date().toISOString()
          })
          
          // Aggressive cache invalidation
          queryClient.removeQueries({ queryKey: ['crm-conversations'] })
          queryClient.removeQueries({ queryKey: ['contacts'] })
          
          // Force immediate refetch
          queryClient.refetchQueries({ 
            queryKey: ['crm-conversations'],
            type: 'active'
          })
          queryClient.refetchQueries({ 
            queryKey: ['contacts'],
            type: 'active'
          })
          
          lastUpdateRef.current = now
          console.log('💬 [REALTIME] Conversation data invalidated and refetched')
        }
      )
      .subscribe()

    // Enhanced custom stages channel
    const stagesChannel = supabase
      .channel('stages-changes-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_stages'
        },
        (payload) => {
          const now = Date.now()
          console.log('🎯 [REALTIME] Custom stage change detected:', {
            event: payload.eventType,
            table: payload.table,
            record: payload.new || payload.old,
            timestamp: new Date().toISOString()
          })
          
          // Aggressive cache invalidation for stages
          queryClient.removeQueries({ queryKey: ['crm-conversations'] })
          queryClient.refetchQueries({ 
            queryKey: ['crm-conversations'],
            type: 'active'
          })
          
          lastUpdateRef.current = now
          console.log('🎯 [REALTIME] Custom stage data invalidated and refetched')
        }
      )
      .subscribe()

    // Aggressive polling fallback every 10 seconds
    const pollInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current
      
      // If no realtime update in last 30 seconds, force refresh
      if (timeSinceLastUpdate > 30000) {
        console.log('⚡ [POLLING] No realtime updates recently, forcing refresh')
        queryClient.removeQueries({ queryKey: ['crm-conversations'] })
        queryClient.removeQueries({ queryKey: ['contacts'] })
        queryClient.refetchQueries({ 
          queryKey: ['crm-conversations'],
          type: 'active'
        })
        lastUpdateRef.current = Date.now()
      }
    }, 10000) // Every 10 seconds

    console.log('✅ [REALTIME] Enhanced channels subscribed with aggressive caching')

    return () => {
      console.log('🔌 [REALTIME] Cleaning up enhanced channels')
      clearInterval(pollInterval)
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(stagesChannel)
    }
  }, [user, queryClient])

  // Return debug info
  return {
    lastUpdate: lastUpdateRef.current
  }
}