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

interface ConnectionsKPIs {
  totalConnections: number
  activeConnections: number
  disconnectedConnections: number
  connectingConnections: number
  connectionsByUser: Array<{ user_name: string; count: number }>
  connectionsByStatus: Array<{ status: string; count: number }>
}

interface ContactsKPIs {
  totalContacts: number
  contactsByStatus: Array<{ status: string; count: number }>
  contactsBySource: Array<{ source: string; count: number }>
  contactsByAgent: Array<{ agent_name: string; count: number }>
  contactsByDate: Array<{ date: string; count: number }>
  contactsByTag: Array<{ tag_name: string; count: number }>
}

interface ProfilesKPIs {
  totalUsers: number
  adminUsers: number
  editorUsers: number
  viewerUsers: number
  usersByRole: Array<{ role: string; count: number }>
}

export const useDashboardAnalytics = (filters: {
  status?: string
  channel?: string
  agent?: string
  dateFrom?: Date
  dateTo?: Date
} = {}) => {
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
  const [connectionsKPIs, setConnectionsKPIs] = useState<ConnectionsKPIs>({
    totalConnections: 0,
    activeConnections: 0,
    disconnectedConnections: 0,
    connectingConnections: 0,
    connectionsByUser: [],
    connectionsByStatus: []
  })
  const [contactsKPIs, setContactsKPIs] = useState<ContactsKPIs>({
    totalContacts: 0,
    contactsByStatus: [],
    contactsBySource: [],
    contactsByAgent: [],
    contactsByDate: [],
    contactsByTag: []
  })
  const [profilesKPIs, setProfilesKPIs] = useState<ProfilesKPIs>({
    totalUsers: 0,
    adminUsers: 0,
    editorUsers: 0,
    viewerUsers: 0,
    usersByRole: []
  })
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
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom.toISOString())
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo.toISOString())

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

  const fetchConnectionsKPIs = async () => {
    if (!user) return

    const { data: connections } = await supabase
      .from('conexoes')
      .select('*, profiles!inner(full_name)')
      .eq('user_id', user.id)

    const total = connections?.length || 0
    const active = connections?.filter(c => c.status === 'connected').length || 0
    const disconnected = connections?.filter(c => c.status === 'disconnected').length || 0
    const connecting = connections?.filter(c => c.status === 'connecting').length || 0

    // Group by user
    const byUser = connections?.reduce((acc, conn: any) => {
      const userName = conn.profiles?.full_name || 'Usuário desconhecido'
      acc[userName] = (acc[userName] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by status
    const byStatus = connections?.reduce((acc, conn) => {
      acc[conn.status] = (acc[conn.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    setConnectionsKPIs({
      totalConnections: total,
      activeConnections: active,
      disconnectedConnections: disconnected,
      connectingConnections: connecting,
      connectionsByUser: Object.entries(byUser).map(([user_name, count]) => ({ user_name, count })),
      connectionsByStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count }))
    })
  }

  const fetchContactsKPIs = async () => {
    if (!user) return

    const { data: contacts } = await supabase
      .from('contacts')
      .select(`
        *,
        profiles!contacts_agent_assigned_fkey(full_name),
        contact_tag_relations!inner(
          contact_tags(name)
        )
      `)
      .eq('user_id', user.id)

    const total = contacts?.length || 0

    // Group by status
    const byStatus = contacts?.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by source
    const bySource = contacts?.filter(c => c.source).reduce((acc, contact) => {
      acc[contact.source] = (acc[contact.source] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by agent
    const byAgent = contacts?.filter(c => c.agent_assigned).reduce((acc, contact: any) => {
      const agentName = contact.profiles?.full_name || 'Sem agente'
      acc[agentName] = (acc[agentName] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentContacts = contacts?.filter(c => new Date(c.created_at) >= thirtyDaysAgo) || []
    const byDate = recentContacts.reduce((acc, contact) => {
      const date = new Date(contact.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by tags
    const { data: tagRelations } = await supabase
      .from('contact_tag_relations')
      .select(`
        contact_tags(name),
        contacts!inner(user_id)
      `)
      .eq('contacts.user_id', user.id)

    const byTag = tagRelations?.reduce((acc, relation: any) => {
      const tagName = relation.contact_tags?.name
      if (tagName) {
        acc[tagName] = (acc[tagName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    setContactsKPIs({
      totalContacts: total,
      contactsByStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      contactsBySource: Object.entries(bySource).map(([source, count]) => ({ source, count })),
      contactsByAgent: Object.entries(byAgent).map(([agent_name, count]) => ({ agent_name, count })),
      contactsByDate: Object.entries(byDate).map(([date, count]) => ({ date, count })),
      contactsByTag: Object.entries(byTag).map(([tag_name, count]) => ({ tag_name, count }))
    })
  }

  const fetchProfilesKPIs = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('role')

    const total = profiles?.length || 0
    const admin = profiles?.filter(p => p.role === 'admin').length || 0
    const editor = profiles?.filter(p => p.role === 'editor').length || 0
    const viewer = profiles?.filter(p => p.role === 'viewer').length || 0

    // Group by role
    const byRole = profiles?.reduce((acc, profile) => {
      acc[profile.role] = (acc[profile.role] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    setProfilesKPIs({
      totalUsers: total,
      adminUsers: admin,
      editorUsers: editor,
      viewerUsers: viewer,
      usersByRole: Object.entries(byRole).map(([role, count]) => ({ role, count }))
    })
  }

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchKPIs(),
        fetchMessagesByDate(),
        fetchConversationsByStatus(),
        fetchHeatmapData(),
        fetchConnectionsKPIs(),
        fetchContactsKPIs(),
        fetchProfilesKPIs(),
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
    connectionsKPIs,
    contactsKPIs,
    profilesKPIs,
    isLoading,
    refetch: () => {
      if (user) {
        fetchKPIs()
        fetchMessagesByDate()
        fetchConversationsByStatus()
        fetchHeatmapData()
        fetchConnectionsKPIs()
        fetchContactsKPIs()
        fetchProfilesKPIs()
      }
    }
  }
}