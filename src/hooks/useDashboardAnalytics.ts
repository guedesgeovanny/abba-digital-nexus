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

    try {
      // Fetch all conversations data in one optimized query
      const conversationsQuery = supabase
        .from('conversations')
        .select('id, status, created_at, unread_count')
        .eq('user_id', user.id)

      // Apply filters
      if (filters.status) conversationsQuery.eq('status', filters.status as any)
      if (filters.channel) conversationsQuery.eq('channel', filters.channel as any)
      if (filters.agent) conversationsQuery.eq('assigned_to', filters.agent)
      if (filters.dateFrom) conversationsQuery.gte('created_at', filters.dateFrom.toISOString())
      if (filters.dateTo) conversationsQuery.lte('created_at', filters.dateTo.toISOString())

      const { data: conversations } = await conversationsQuery

      if (!conversations) return

      // Calculate KPIs from fetched data
      const totalConversations = conversations.length
      const openConversations = conversations.filter(c => c.status === 'aberta').length
      const closedConversations = conversations.filter(c => c.status === 'fechada').length
      const unreadConversations = conversations.filter(c => c.unread_count > 0).length

      // Messages today - optimized query
      const today = new Date().toISOString().split('T')[0]
      const conversationIds = conversations.map(c => c.id)
      
      let messagesToday = 0
      if (conversationIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversa_id', conversationIds)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)

        messagesToday = count || 0
      }

      setKpis({
        totalConversations,
        openConversations,
        closedConversations,
        messagesToday,
        conversationsWithoutResponse: 0, // Will implement if needed
        unreadConversations,
      })
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    }
  }

  const fetchMessagesByDate = async () => {
    if (!user) return

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // 4.3. Messages by period - optimized with join
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          created_at,
          conversations!inner(user_id)
        `)
        .eq('conversations.user_id', user.id)
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
    } catch (error) {
      console.error('Error fetching messages by date:', error)
    }
  }

  const fetchConversationsByStatus = async () => {
    if (!user) return

    try {
      // 3.2. Conversations by status
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
    } catch (error) {
      console.error('Error fetching conversations by status:', error)
    }
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

    try {
      // 1.1. Total connections
      const { count: totalConnections } = await supabase
        .from('conexoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // 1.2. Connections by status
      const { data: connectionsByStatus } = await supabase
        .from('conexoes')
        .select('status')
        .eq('user_id', user.id)

      const statusCounts = connectionsByStatus?.reduce((acc, conn) => {
        acc[conn.status] = (acc[conn.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 1.3. Connections by user
      const { data: connectionsByUser } = await supabase
        .from('conexoes')
        .select('user_id, profiles!inner(full_name)')
        .eq('user_id', user.id)

      const userCounts = connectionsByUser?.reduce((acc, conn: any) => {
        const userName = conn.profiles?.full_name || 'Usuário desconhecido'
        acc[userName] = (acc[userName] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setConnectionsKPIs({
        totalConnections: totalConnections || 0,
        activeConnections: statusCounts['connected'] || 0,
        disconnectedConnections: statusCounts['disconnected'] || 0,
        connectingConnections: statusCounts['connecting'] || 0,
        connectionsByUser: Object.entries(userCounts).map(([user_name, count]) => ({ user_name, count })),
        connectionsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
      })
    } catch (error) {
      console.error('Error fetching connections KPIs:', error)
    }
  }

  const fetchContactsKPIs = async () => {
    if (!user) return

    try {
      // 2.1. Total contacts
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // 2.2. Contacts by status
      const { data: contactsStatus } = await supabase
        .from('contacts')
        .select('status')
        .eq('user_id', user.id)

      const statusCounts = contactsStatus?.reduce((acc, contact) => {
        acc[contact.status] = (acc[contact.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 2.3. Contacts by source
      const { data: contactsSource } = await supabase
        .from('contacts')
        .select('source')
        .eq('user_id', user.id)
        .not('source', 'is', null)

      const sourceCounts = contactsSource?.reduce((acc, contact) => {
        acc[contact.source] = (acc[contact.source] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 2.4. Contacts by agent
      const { data: contactsAgent } = await supabase
        .from('contacts')
        .select('agent_assigned, profiles!contacts_agent_assigned_fkey(full_name)')
        .eq('user_id', user.id)
        .not('agent_assigned', 'is', null)

      const agentCounts = contactsAgent?.reduce((acc, contact: any) => {
        const agentName = contact.profiles?.full_name || 'Sem agente'
        acc[agentName] = (acc[agentName] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 2.5. Contacts by date (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: recentContacts } = await supabase
        .from('contacts')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const dateCounts = recentContacts?.reduce((acc, contact) => {
        const date = new Date(contact.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 5.1. Contacts by tags
      const { data: tagRelations } = await supabase
        .from('contact_tag_relations')
        .select(`
          contact_tags(name),
          contacts!inner(user_id)
        `)
        .eq('contacts.user_id', user.id)

      const tagCounts = tagRelations?.reduce((acc, relation: any) => {
        const tagName = relation.contact_tags?.name
        if (tagName) {
          acc[tagName] = (acc[tagName] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      setContactsKPIs({
        totalContacts: totalContacts || 0,
        contactsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        contactsBySource: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })),
        contactsByAgent: Object.entries(agentCounts).map(([agent_name, count]) => ({ agent_name, count })),
        contactsByDate: Object.entries(dateCounts).map(([date, count]) => ({ date, count })),
        contactsByTag: Object.entries(tagCounts).map(([tag_name, count]) => ({ tag_name, count }))
      })
    } catch (error) {
      console.error('Error fetching contacts KPIs:', error)
    }
  }

  const fetchProfilesKPIs = async () => {
    try {
      // 6.1. Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 6.2. Users by role
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role')

      const roleCounts = profiles?.reduce((acc, profile) => {
        acc[profile.role] = (acc[profile.role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setProfilesKPIs({
        totalUsers: totalUsers || 0,
        adminUsers: roleCounts['admin'] || 0,
        editorUsers: roleCounts['editor'] || 0,
        viewerUsers: roleCounts['viewer'] || 0,
        usersByRole: Object.entries(roleCounts).map(([role, count]) => ({ role, count }))
      })
    } catch (error) {
      console.error('Error fetching profiles KPIs:', error)
    }
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