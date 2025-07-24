import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

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

const STATUS_TO_STAGE_MAP = {
  'aberta': 'Novo Lead',
  'fechada': 'Fechado'
} as const

const STAGE_COLORS = {
  'Novo Lead': '#3b82f6',
  'Fechado': '#10b981'
} as const

export const useCRMConversations = () => {
  const [conversations, setConversations] = useState<CRMConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
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
    } finally {
      setIsLoading(false)
    }
  }

  const updateConversationStatus = async (conversationId: string, newStage: string) => {
    const statusKey = Object.keys(STATUS_TO_STAGE_MAP).find(
      key => STATUS_TO_STAGE_MAP[key as keyof typeof STATUS_TO_STAGE_MAP] === newStage
    ) as keyof typeof STATUS_TO_STAGE_MAP

    if (statusKey) {
      const { error } = await supabase
        .from('conversations')
        .update({ status: statusKey })
        .eq('id', conversationId)

      if (!error) {
        // Update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, status: statusKey }
              : conv
          )
        )
      }
    }
  }

  // Group conversations by stage
  const crmData: CRMStageData = {}
  const stages = ['Novo Lead', 'Fechado']

  // Initialize all stages
  stages.forEach(stage => {
    crmData[stage] = []
  })

  // Group conversations by their mapped stage
  conversations.forEach(conversation => {
    const stageName = STATUS_TO_STAGE_MAP[conversation.status as keyof typeof STATUS_TO_STAGE_MAP] || 'Novo Lead'
    crmData[stageName].push(conversation)
  })

  return {
    crmData,
    stages,
    stageColorsMap: STAGE_COLORS,
    isLoading,
    updateConversationStatus
  }
}