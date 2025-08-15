import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

// Force cache invalidation - removed STAGE_COLORS constant

export interface CRMConversation {
  id: string
  contact_name: string
  contact_id?: string
  status: string
  created_at: string
  updated_at: string
  user_id?: string
  assigned_to?: string
  phone?: string
  email?: string
  company?: string
  value?: number
  channel?: string
}

export interface CRMStageData {
  [stageName: string]: CRMConversation[]
}

export interface CustomStage {
  id: string
  name: string
  color: string
  position: number
}

// Map conversation status to basic CRM stages
const STATUS_TO_STAGE_MAP = {
  'novo': 'Novo Lead',
  'aberta': 'Em Andamento', 
  'qualificado': 'Qualificado',
  'convertido': 'Convertido',
  'fechada': 'Convertido',
  'perdido': 'Perdido'
} as const

// Basic CRM stages with colors
const BASIC_STAGES = [
  { name: 'Novo Lead', color: '#3b82f6' },
  { name: 'Em Andamento', color: '#f59e0b' },
  { name: 'Qualificado', color: '#10b981' },
  { name: 'Convertido', color: '#059669' },
  { name: 'Perdido', color: '#ef4444' }
] as const

export const useCRMConversations = () => {
  const { user, userProfile } = useAuth()
  const [conversations, setConversations] = useState<CRMConversation[]>([])
  const [customStages, setCustomStages] = useState<CustomStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<Array<{id: string, full_name: string, email: string}>>([])
  
  const isAdmin = userProfile?.role === 'admin'
  
  // Filter states
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterValueRange, setFilterValueRange] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')

  useEffect(() => {
    if (user) {
      const promises = [fetchConversations(), fetchCustomStages()]
      if (isAdmin) {
        promises.push(fetchAllUsers())
      }
      Promise.all(promises)
        .finally(() => setIsLoading(false))
    }
  }, [user, isAdmin])

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from('conversations')
        .select(`
          id, contact_name, contact_id, status, created_at, updated_at, user_id, assigned_to,
          contacts!conversations_contact_id_fkey (
            phone,
            email,
            company,
            value,
            channel
          )
        `)
        .order('created_at', { ascending: false })

      // Apply role-based filtering - same as Chat tab
      if (!isAdmin && user?.id) {
        query = query.or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      }

      const { data, error } = await query

      if (error) throw error
      
      const formattedData = data?.map(conv => ({
        id: conv.id,
        contact_name: conv.contact_name,
        contact_id: conv.contact_id,
        status: conv.status,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        user_id: conv.user_id,
        assigned_to: conv.assigned_to,
        phone: conv.contacts?.phone,
        email: conv.contacts?.email,
        company: conv.contacts?.company,
        value: conv.contacts?.value,
        channel: conv.contacts?.channel
      })) || []
      
      setConversations(formattedData)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchCustomStages = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_stages')
        .select('id, name, color, position')
        .order('position', { ascending: true })

      if (error) throw error
      setCustomStages(data || [])
    } catch (error) {
      console.error('Error fetching custom stages:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addCustomStage = async (stageName: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('User not authenticated')
      
      const maxPosition = Math.max(...customStages.map(s => s.position), -1)
      const { data, error } = await supabase
        .from('custom_stages')
        .insert({
          user_id: userData.user.id,
          name: stageName,
          position: maxPosition + 1,
          color: '#6366f1'
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setCustomStages(prev => [...prev, data])
      }
    } catch (error) {
      console.error('Error adding custom stage:', error)
    }
  }

  const updateStageOrder = async (newStages: CustomStage[]) => {
    // Only allow admins to reorder stages
    if (!isAdmin) {
      console.error('Only admins can reorder stages')
      return
    }

    try {
      // Update local state immediately for better UX
      setCustomStages(newStages)
      
      // Update positions in database
      const updates = newStages.map((stage, index) => 
        supabase
          .from('custom_stages')
          .update({ position: index })
          .eq('id', stage.id)
      )
      
      await Promise.all(updates)
    } catch (error) {
      console.error('Error updating stage order:', error)
      // Revert to original order on error
      await fetchCustomStages()
    }
  }

  const updateConversationStatus = async (conversationId: string, newStage: string) => {
    // Check if it's a custom stage
    const isCustomStage = customStages.some(stage => stage.name === newStage)
    
    if (isCustomStage) {
      // For custom stages, we'll use a special status format
      const customStatus = `custom:${newStage}`
      
      // Optimistic update
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, status: customStatus }
            : conv
        )
      )

      try {
        const { error } = await supabase
          .from('conversations')
          .update({ status: customStatus as any })
          .eq('id', conversationId)

        if (error) {
          console.error('Error updating conversation status:', error)
          // Revert optimistic update on error
          await fetchConversations()
        }
      } catch (error) {
        console.error('Error updating conversation status:', error)
        // Revert optimistic update on error
        await fetchConversations()
      }
    } else {
      // Handle basic stages as before
      const statusKey = getStatusForStage(newStage)
      
      // Optimistic update
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, status: statusKey }
            : conv
        )
      )

      try {
        const { error } = await supabase
          .from('conversations')
          .update({ status: statusKey as any })
          .eq('id', conversationId)

        if (error) {
          console.error('Error updating conversation status:', error)
          // Revert optimistic update on error
          await fetchConversations()
        }
      } catch (error) {
        console.error('Error updating conversation status:', error)
        // Revert optimistic update on error
        await fetchConversations()
      }
    }
  }

  // Helper function to get status for stage
  const getStatusForStage = (stageName: string): string => {
    const statusKey = Object.keys(STATUS_TO_STAGE_MAP).find(
      key => STATUS_TO_STAGE_MAP[key as keyof typeof STATUS_TO_STAGE_MAP] === stageName
    )
    return statusKey || 'novo' // fallback to 'novo' if stage not found
  }

  // Combine basic stages and custom stages
  const allStages = [
    ...BASIC_STAGES.map(stage => ({ ...stage, isCustom: false })),
    ...customStages.map(stage => ({ ...stage, isCustom: true }))
  ]

  const stages = allStages.map(stage => stage.name)
  
  // Create color map for all stages
  const stageColorsMap = allStages.reduce((acc, stage) => {
    acc[stage.name] = stage.color
    return acc
  }, {} as Record<string, string>)

  // Filter conversations based on active filters
  const filteredConversations = conversations.filter(conversation => {
    // User filter (only for admins)
    if (filterUser && filterUser !== 'all' && isAdmin) {
      if (conversation.user_id !== filterUser && conversation.assigned_to !== filterUser) {
        return false
      }
    }
    
    // Channel filter
    if (filterChannel && filterChannel !== 'all' && conversation.channel !== filterChannel) {
      return false
    }
    
    // Value range filter
    if (filterValueRange && filterValueRange !== 'all' && conversation.value !== null && conversation.value !== undefined) {
      const value = conversation.value
      switch (filterValueRange) {
        case 'até-5000':
          if (value > 5000) return false
          break
        case '5001-10000':
          if (value <= 5000 || value > 10000) return false
          break
        case '10001-20000':
          if (value <= 10000 || value > 20000) return false
          break
        case 'acima-20000':
          if (value <= 20000) return false
          break
      }
    }
    
    // Period filter
    if (filterPeriod && filterPeriod !== 'all') {
      const createdDate = new Date(conversation.created_at)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filterPeriod) {
        case '7-dias':
          if (daysDiff > 7) return false
          break
        case '30-dias':
          if (daysDiff > 30) return false
          break
        case '90-dias':
          if (daysDiff > 90) return false
          break
      }
    }
    
    // Status filter
    if (filterStatus && filterStatus !== 'all') {
      switch (filterStatus) {
        case 'aberta':
          if (!['novo', 'aberta', 'qualificado'].includes(conversation.status)) return false
          break
        case 'fechada':
          if (!['convertido', 'fechada', 'perdido'].includes(conversation.status)) return false
          break
      }
    }
    
    return true
  })

  // Group filtered conversations by stage
  const crmData: CRMStageData = {}
  
  // Initialize all stages (basic + custom)
  stages.forEach(stage => {
    crmData[stage] = []
  })

  // Group filtered conversations by their mapped stage (basic + custom stages)
  filteredConversations.forEach(conversation => {
    // Check if it's a custom stage status
    if (conversation.status.startsWith('custom:')) {
      const customStageName = conversation.status.replace('custom:', '')
      if (customStages.some(stage => stage.name === customStageName)) {
        crmData[customStageName].push(conversation)
        return
      }
    }
    
    // Handle basic stages
    const stageName = STATUS_TO_STAGE_MAP[conversation.status as keyof typeof STATUS_TO_STAGE_MAP] || 'Novo Lead'
    crmData[stageName].push(conversation)
  })

  // Get unique values for filter options
  const allChannels = [...new Set(conversations.map(c => c.channel).filter(Boolean))]
  const hasValueData = conversations.some(c => c.value !== null && c.value !== undefined)
  
  // Clear filters function
  const clearFilters = () => {
    setFilterChannel('all')
    setFilterValueRange('all')
    setFilterPeriod('all')
    setFilterStatus('all')
    setFilterUser('all')
  }

  return {
    crmData,
    stages,
    stageColorsMap,
    isLoading,
    updateConversationStatus,
    addCustomStage,
    updateStageOrder,
    customStages,
    basicStages: BASIC_STAGES.map(s => s.name),
    // Filter states and functions
    filterChannel,
    filterValueRange,
    filterPeriod,
    filterStatus,
    filterUser,
    setFilterChannel,
    setFilterValueRange,
    setFilterPeriod,
    setFilterStatus,
    setFilterUser,
    clearFilters,
    allChannels,
    hasValueData,
    allUsers,
    totalLeads: conversations.length,
    filteredLeadsCount: filteredConversations.length,
    // User role information  
    isAdmin,
    currentUserId: user?.id
  }
}