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

    // Add visibility change listener to prevent unnecessary refetches when tab is not active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastUpdate = Date.now() - lastUpdateRef.current
        // Only refresh if user was away for more than 5 minutes
        if (timeSinceLastUpdate > 300000) {
          console.log('⚡ [VISIBILITY] User returned after long absence, refreshing data')
          queryClient.refetchQueries({ 
            queryKey: ['crm-conversations'],
            type: 'active'
          })
          lastUpdateRef.current = Date.now()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Reduced polling - only check every 60 seconds and only refresh if 10 minutes have passed
    const pollInterval = setInterval(() => {
      // Only poll if the tab is visible
      if (document.visibilityState !== 'visible') return
      
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current
      
      // If no realtime update in last 10 minutes, force refresh
      if (timeSinceLastUpdate > 600000) {
        console.log('⚡ [POLLING] No realtime updates in 10 minutes, forcing refresh')
        queryClient.refetchQueries({ 
          queryKey: ['crm-conversations'],
          type: 'active'
        })
        lastUpdateRef.current = Date.now()
      }
    }, 60000) // Every 60 seconds

    console.log('✅ [REALTIME] Enhanced channels subscribed with aggressive caching')

    return () => {
      console.log('🔌 [REALTIME] Cleaning up enhanced channels')
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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