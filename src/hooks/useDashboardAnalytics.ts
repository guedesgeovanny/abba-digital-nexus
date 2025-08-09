import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardKPIs {
  totalConversations: number
  openConversations: number
  closedConversations: number
  messagesToday: number
  conversationsWithoutResponse: number
  unreadConversations: number
}

interface MessagesByDate {
  date: string
  count: number
}

interface ConversationsByStatus {
  status: string
  count: number
}


interface HeatmapData {
  hour: number
  day: number
  count: number
}

export const useDashboardAnalytics = (filters: {
  status?: string
  channel?: string
  agent?: string
  dateFrom?: string
  dateTo?: string
}) => {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalConversations: 0,
    openConversations: 0,
    closedConversations: 0,
    messagesToday: 0,
    conversationsWithoutResponse: 0,
    unreadConversations: 0,
  })
  const [messagesByDate, setMessagesByDate] = useState<MessagesByDate[]>([])
  const [conversationsByStatus, setConversationsByStatus] = useState<ConversationsByStatus[]>([])
  
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchKPIs = async () => {
    if (!user) return

    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status as any)
    if (filters.channel) query = query.eq('channel', filters.channel as any)
    if (filters.agent) query = query.eq('assigned_to', filters.agent)
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

    const { count: totalConversations } = await query

    // Get conversations by status
    const { data: openConv } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'aberta')

    const { data: closedConv } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'fechada')

    // Messages today
    const today = new Date().toISOString().split('T')[0]
    const { data: messagesData } = await supabase
      .from('messages')
      .select('conversa_id')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)

    // Get unique conversation IDs and filter by user
    const conversationIds = [...new Set(messagesData?.map(m => m.conversa_id) || [])]
    let messagesToday = 0
    if (conversationIds.length > 0) {
      const { data: userConversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .in('id', conversationIds)
      
      messagesToday = userConversations?.length || 0
    }


    // Unread conversations
    const { data: unreadConv } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('unread_count', 0)

    setKpis({
      totalConversations: totalConversations || 0,
      openConversations: openConv?.length || 0,
      closedConversations: closedConv?.length || 0,
      messagesToday,
      conversationsWithoutResponse: 0, // Will calculate separately
      unreadConversations: unreadConv?.length || 0,
    })
  }

  const fetchMessagesByDate = async () => {
    if (!user) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get messages from user's conversations
    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)

    if (!userConversations?.length) return

    const conversationIds = userConversations.map(c => c.id)

    const { data: messages } = await supabase
      .from('messages')
      .select('created_at')
      .in('conversa_id', conversationIds)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group by date
    const grouped = messages?.reduce((acc, message) => {
      const date = new Date(message.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const result = Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }))

    setMessagesByDate(result)
  }

  const fetchConversationsByStatus = async () => {
    if (!user) return

    const { data: conversations } = await supabase
      .from('conversations')
      .select('status')
      .eq('user_id', user.id)

    const grouped = conversations?.reduce((acc, conv) => {
      acc[conv.status] = (acc[conv.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const result = Object.entries(grouped).map(([status, count]) => ({
      status,
      count
    }))

    setConversationsByStatus(result)
  }


  const fetchHeatmapData = async () => {
    if (!user) return

    // Get messages from user's conversations
    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)

    if (!userConversations?.length) return

    const conversationIds = userConversations.map(c => c.id)

    const { data: messages } = await supabase
      .from('messages')
      .select('created_at')
      .in('conversa_id', conversationIds)

    const heatmap: Record<string, number> = {}
    messages?.forEach(message => {
      const date = new Date(message.created_at)
      const hour = date.getHours()
      const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      const key = `${day}-${hour}`
      heatmap[key] = (heatmap[key] || 0) + 1
    })

    const result: HeatmapData[] = []
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`
        result.push({
          day,
          hour,
          count: heatmap[key] || 0
        })
      }
    }

    setHeatmapData(result)
  }

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchKPIs(),
        fetchMessagesByDate(),
        fetchConversationsByStatus(),
        fetchHeatmapData(),
      ])
      setIsLoading(false)
    }

    if (user) {
      fetchAll()
    }
  }, [user, filters])

  return {
    kpis,
    messagesByDate,
    conversationsByStatus,
    heatmapData,
    isLoading,
    refetch: () => {
      if (user) {
        fetchKPIs()
        fetchMessagesByDate()
        fetchConversationsByStatus()
        fetchHeatmapData()
      }
    }
  }
}