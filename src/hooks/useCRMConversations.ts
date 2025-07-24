import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Force cache invalidation - removed STAGE_COLORS constant

export interface CRMConversation {
  id: string
  contact_name: string
  status: string
  created_at: string
  updated_at: string
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
  const [conversations, setConversations] = useState<CRMConversation[]>([])
  const [customStages, setCustomStages] = useState<CustomStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchConversations(), fetchCustomStages()])
  }, [])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, contact_name, status, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
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
    } finally {
      setIsLoading(false)
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

  const updateConversationStatus = async (conversationId: string, newStage: string) => {
    // Optimistic update
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, status: getStatusForStage(newStage) }
          : conv
      )
    )

    try {
      // Check if it's a basic stage first
      const statusKey = getStatusForStage(newStage)
      
      const { error } = await supabase
        .from('conversations')
        .update({ status: statusKey })
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

  // Helper function to get status for stage
  const getStatusForStage = (stageName: string): string => {
    const statusKey = Object.keys(STATUS_TO_STAGE_MAP).find(
      key => STATUS_TO_STAGE_MAP[key as keyof typeof STATUS_TO_STAGE_MAP] === stageName
    )
    return statusKey || 'aberta' // fallback to 'aberta' if stage not found
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

  // Group conversations by stage
  const crmData: CRMStageData = {}
  
  // Initialize all stages (basic + custom)
  stages.forEach(stage => {
    crmData[stage] = []
  })

  // Group conversations by their mapped stage (only basic stages for now)
  conversations.forEach(conversation => {
    const stageName = STATUS_TO_STAGE_MAP[conversation.status as keyof typeof STATUS_TO_STAGE_MAP] || 'Novo Lead'
    crmData[stageName].push(conversation)
  })

  return {
    crmData,
    stages,
    stageColorsMap,
    isLoading,
    updateConversationStatus,
    addCustomStage,
    customStages,
    basicStages: BASIC_STAGES.map(s => s.name)
  }
}