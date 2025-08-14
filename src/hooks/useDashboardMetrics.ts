import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DashboardMetrics {
  totalConversations: number
  openConversations: number
  closedConversations: number
  messagesToday: number
  unreadConversations: number
  activeConnections: number
  totalContacts: number
  totalUsers: number
  messagesByDate: Array<{ date: string; count: number }>
  conversationsByStatus: Array<{ name: string; count: number }>
}

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMetrics = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Build date filters
      let conversationsQuery = supabase
        .from('conversations')
        .select('id, status, created_at, unread_count')
        .eq('user_id', user.id)

      if (dateRange?.from) {
        conversationsQuery = conversationsQuery.gte('created_at', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        conversationsQuery = conversationsQuery.lte('created_at', toDate.toISOString())
      }

      const { data: conversations } = await conversationsQuery

      // Fetch messages for the selected period
      const today = new Date().toISOString().split('T')[0]
      const conversationIds = conversations?.map(c => c.id) || []
      
      let messagesToday = 0
      if (conversationIds.length > 0) {
        let messagesQuery = supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversa_id', conversationIds)

        // If no date range is specified, default to today
        if (!dateRange?.from && !dateRange?.to) {
          messagesQuery = messagesQuery
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)
        } else {
          if (dateRange?.from) {
            messagesQuery = messagesQuery.gte('created_at', dateRange.from.toISOString())
          }
          if (dateRange?.to) {
            const toDate = new Date(dateRange.to)
            toDate.setHours(23, 59, 59, 999)
            messagesQuery = messagesQuery.lte('created_at', toDate.toISOString())
          }
        }
        
        const { count } = await messagesQuery
        messagesToday = count || 0
      }

      // Fetch connections
      const { count: activeConnections } = await supabase
        .from('conexoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'connected')

      // Fetch contacts
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch total users (admin only)
      let totalUsers = 0
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        totalUsers = count || 0
      }

      // Messages by date (use date range or default to last 7 days)
      let startDate = new Date()
      if (dateRange?.from) {
        startDate = dateRange.from
      } else {
        startDate.setDate(startDate.getDate() - 7)
      }

      let endDate = dateRange?.to || new Date()

      let messagesQuery = supabase
        .from('messages')
        .select(`
          created_at,
          conversations!inner(user_id)
        `)
        .eq('conversations.user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (dateRange?.to) {
        const toDate = new Date(endDate)
        toDate.setHours(23, 59, 59, 999)
        messagesQuery = messagesQuery.lte('created_at', toDate.toISOString())
      }

      const { data: messages } = await messagesQuery

      // Group messages by date
      const messagesByDate = messages?.reduce((acc, message) => {
        const date = new Date(message.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const messagesByDateArray = Object.entries(messagesByDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count
      }))

      // Conversations by status
      const statusCounts = conversations?.reduce((acc, conv) => {
        const statusName = conv.status === 'aberta' ? 'Abertas' : 
                          conv.status === 'fechada' ? 'Fechadas' : 
                          conv.status
        acc[statusName] = (acc[statusName] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const conversationsByStatus = Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count
      }))

      setMetrics({
        totalConversations: conversations?.length || 0,
        openConversations: conversations?.filter(c => c.status === 'aberta').length || 0,
        closedConversations: conversations?.filter(c => c.status === 'fechada').length || 0,
        messagesToday,
        unreadConversations: conversations?.filter(c => c.unread_count > 0).length || 0,
        activeConnections: activeConnections || 0,
        totalContacts: totalContacts || 0,
        totalUsers,
        messagesByDate: messagesByDateArray,
        conversationsByStatus
      })
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMetrics()
    }
  }, [user, dateRange])

  return {
    metrics,
    isLoading,
    refetch: fetchMetrics
  }
}