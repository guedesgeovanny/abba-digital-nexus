import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { useRealtimeUpdates } from './useRealtimeUpdates'

// CRM Conversation interface
interface CRMConversation {
  id: string
  contact_name: string
  contact_phone?: string
  contact_username?: string
  contact_avatar?: string
  channel?: string
  status: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  user_id?: string
  assigned_to?: string
  crm_stage?: string
  value?: number
  contact_id?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

// Stage customization interfaces
interface CRMStageData {
  [stageName: string]: CRMConversation[]
}

interface CustomStage {
  id: string
  user_id?: string | null
  name: string
  color: string
  position: number
  created_at: string
  updated_at: string
}

// Map conversation crm_stage to basic CRM stages
const STAGE_TO_CRM_STAGE_MAP = {
  'novo_lead': 'Etapa de Entrada'
} as const

// Fixed entry stage that cannot be customized
const ENTRY_STAGE = { name: 'Etapa de Entrada', color: '#3b82f6', key: 'novo_lead' } as const

// Default stages that will be converted to customizable stages
const DEFAULT_CUSTOMIZABLE_STAGES = [
  { name: 'Em Andamento', color: '#f59e0b' },
  { name: 'Qualificado', color: '#10b981' },
  { name: 'Convertido', color: '#059669' },
  { name: 'Perdido', color: '#ef4444' }
] as const

export const useCRMConversations = () => {
  const { user, userProfile } = useAuth()
  
  // Enable realtime updates
  useRealtimeUpdates()
  
  const [conversations, setConversations] = useState<CRMConversation[]>([])
  const [customStages, setCustomStages] = useState<CustomStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<Array<{id: string, full_name: string, email: string}>>([])
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered')
      Promise.all([fetchConversations(), fetchCustomStages()])
        .then(() => setLastRefresh(new Date()))
        .catch(error => console.error('Auto-refresh error:', error))
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ Window focus refresh triggered')
      Promise.all([fetchConversations(), fetchCustomStages()])
        .then(() => setLastRefresh(new Date()))
        .catch(error => console.error('Focus refresh error:', error))
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contacts (
            id,
            name,
            email,
            phone,
            value
          )
        `)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      const mappedConversations = data?.map(conv => ({
        ...conv,
        contact_name: conv.contacts?.name || conv.contact_name,
        value: conv.contacts?.value || 0
      })) || []

      setConversations(mappedConversations)
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      })
    }
  }

  const fetchCustomStages = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_stages')
        .select('*')
        .order('position')

      if (error) throw error
      setCustomStages(data || [])
    } catch (error) {
      console.error('Erro ao buscar etapas customizadas:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name')

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  // Custom stage management functions
  const addCustomStage = async (name: string, color: string) => {
    try {
      const nextPosition = Math.max(...customStages.map(s => s.position), -1) + 1
      
      const { data, error } = await supabase
        .from('custom_stages')
        .insert([
          {
            name,
            color,
            position: nextPosition
          }
        ])
        .select()
        .single()

      if (error) throw error

      setCustomStages(prev => [...prev, data].sort((a, b) => a.position - b.position))
      
      toast({
        title: "Sucesso",
        description: `Etapa "${name}" criada com sucesso`,
      })
      
      return data
    } catch (error) {
      console.error('Erro ao criar etapa:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa",
        variant: "destructive",
      })
    }
  }

  const deleteCustomStage = async (stageName: string) => {
    try {
      const stageToDelete = customStages.find(s => s.name === stageName)
      if (!stageToDelete) return

      // Move conversations from deleted stage to entry stage
      const conversationsToMove = conversations.filter(conv => conv.crm_stage === `custom:${stageName}`)
      
      if (conversationsToMove.length > 0) {
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ crm_stage: 'novo_lead' })
          .in('id', conversationsToMove.map(c => c.id))

        if (updateError) throw updateError

        // Also update contacts
        const contactIdsToUpdate = conversationsToMove
          .filter(c => c.contact_id)
          .map(c => c.contact_id)

        if (contactIdsToUpdate.length > 0) {
          const { error: contactUpdateError } = await supabase
            .from('contacts')
            .update({ crm_stage: 'novo_lead' })
            .in('id', contactIdsToUpdate)

          if (contactUpdateError) throw contactUpdateError
        }
      }

      // Delete the custom stage
      const { error } = await supabase
        .from('custom_stages')
        .delete()
        .eq('id', stageToDelete.id)

      if (error) throw error

      setCustomStages(prev => prev.filter(s => s.id !== stageToDelete.id))
      
      // Refresh conversations to reflect the changes
      await fetchConversations()
      
      toast({
        title: "Sucesso",
        description: `Etapa "${stageName}" excluída com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao excluir etapa:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa",
        variant: "destructive",
      })
    }
  }

  const updateCustomStage = async (stageId: string, newName: string, newColor: string) => {
    try {
      const stageToUpdate = customStages.find(s => s.id === stageId)
      if (!stageToUpdate) return

      const oldName = stageToUpdate.name

      // Update the custom stage
      const { error } = await supabase
        .from('custom_stages')
        .update({ 
          name: newName, 
          color: newColor 
        })
        .eq('id', stageId)

      if (error) throw error

      // Update conversations that reference this stage
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ crm_stage: `custom:${newName}` })
        .eq('crm_stage', `custom:${oldName}`)

      if (conversationError) throw conversationError

      // Update contacts that reference this stage
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ crm_stage: `custom:${newName}` })
        .eq('crm_stage', `custom:${oldName}`)

      if (contactError) throw contactError

      setCustomStages(prev => 
        prev.map(s => s.id === stageId ? { ...s, name: newName, color: newColor } : s)
      )
      
      // Refresh conversations to reflect the changes
      await fetchConversations()
      
      toast({
        title: "Sucesso",
        description: `Etapa atualizada com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa",
        variant: "destructive",
      })
    }
  }

  const updateStageOrder = async (stageNames: string[]) => {
    try {
      // Update the position of each custom stage based on the new order
      const updates = stageNames.map((stageName, index) => {
        const stage = customStages.find(s => s.name === stageName)
        return stage ? { id: stage.id, position: index } : null
      }).filter(Boolean)

      for (const update of updates) {
        if (update) {
          const { error } = await supabase
            .from('custom_stages')
            .update({ position: update.position })
            .eq('id', update.id)

          if (error) throw error
        }
      }

      await fetchCustomStages()
      
      toast({
        title: "Sucesso",
        description: "Ordem das etapas atualizada com sucesso",
      })
    } catch (error) {
      console.error('Erro ao atualizar ordem das etapas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível reordenar as etapas",
        variant: "destructive",
      })
    }
  }

  // Conversation status update with optimistic updates
  const updateConversationStatus = async (conversationId: string, newStage: string) => {
    console.log('🚀 INICIANDO updateConversationStatus:', {
      conversationId,
      newStage,
      user: user?.id,
      isAuthenticated: !!user
    })

    if (!user) {
      console.error('❌ Usuário não autenticado!')
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para mover conversas",
        variant: "destructive",
      })
      return
    }
    
    try {
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) {
        console.error('❌ Conversa não encontrada:', conversationId)
        return
      }

      // Determine the target stage name
      let targetStageName = newStage
      if (newStage !== 'novo_lead' && !newStage.startsWith('custom:')) {
        targetStageName = `custom:${newStage}`
      }

      console.log('🔄 Detalhes da atualização:', {
        conversationId,
        contactId: conversation.contact_id,
        fromStage: conversation.crm_stage,
        toStage: targetStageName,
        isAdmin,
        userId: user.id,
        userEmail: user.email
      })

      // OPTIMISTIC UPDATE: Update local state immediately
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, crm_stage: targetStageName }
            : c
        )
      )

      // Update conversation
      console.log('📝 Atualizando tabela conversations...')
      const { error: conversationError, data: conversationData } = await supabase
        .from('conversations')
        .update({ crm_stage: targetStageName })
        .eq('id', conversationId)
        .select()

      if (conversationError) {
        console.error('❌ Erro detalhado ao atualizar conversation:', {
          error: conversationError,
          code: conversationError.code,
          message: conversationError.message,
          details: conversationError.details,
          hint: conversationError.hint
        })
        // Revert optimistic update on error
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { ...c, crm_stage: conversation.crm_stage }
              : c
          )
        )
        throw conversationError
      }

      console.log('✅ Conversation atualizada com sucesso:', conversationData)

      // Update associated contact
      if (conversation.contact_id) {
        console.log('📝 Atualizando tabela contacts...')
        const { error: contactError, data: contactData } = await supabase
          .from('contacts')
          .update({ crm_stage: targetStageName })
          .eq('id', conversation.contact_id)
          .select()
        
        if (contactError) {
          console.error('❌ Erro detalhado ao atualizar contact:', {
            error: contactError,
            code: contactError.code,
            message: contactError.message,
            details: contactError.details,
            hint: contactError.hint,
            contactId: conversation.contact_id
          })
          // Não lança erro aqui para não reverter a conversa se ela foi atualizada com sucesso
        } else {
          console.log('✅ Contact atualizado com sucesso:', contactData)
        }
      } else {
        console.log('⚠️ Conversa não possui contact_id associado')
      }

      console.log('✅ CRM stage atualizado com sucesso completo')
      toast({
        title: "Sucesso",
        description: `Conversa movida para "${newStage}"`,
      })
    } catch (error) {
      console.error('❌ Erro geral ao atualizar CRM stage:', {
        error,
        type: typeof error,
        message: error instanceof Error ? error.message : String(error)
      })
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da conversa",
        variant: "destructive",
      })
    }
  }

  // Combine entry stage (fixed) and custom stages
  const allStages = [
    // Fixed entry stage that cannot be customized
    { 
      name: ENTRY_STAGE.name, 
      color: ENTRY_STAGE.color, 
      isCustom: false,
      isEntryStage: true,
      stageKey: ENTRY_STAGE.key
    },
    // All other stages are now customizable
    ...customStages.map(stage => ({ ...stage, isCustom: true, isEntryStage: false, stageKey: '' }))
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
    if (filterPeriod && filterPeriod !== 'all' && conversation.last_message_at) {
      const messageDate = new Date(conversation.last_message_at)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 3600 * 24))
      
      switch (filterPeriod) {
        case 'hoje':
          if (daysDiff > 0) return false
          break
        case '7-dias':
          if (daysDiff > 7) return false
          break
        case '30-dias':
          if (daysDiff > 30) return false
          break
      }
    }
    
    // Status filter
    if (filterStatus && filterStatus !== 'all' && conversation.status !== filterStatus) {
      return false
    }
    
    return true
  })

  // Group filtered conversations by CRM stage
  const crmData: CRMStageData = {}
  
  // Initialize all stages in crmData
  allStages.forEach(stage => {
    crmData[stage.name] = []
  })
  
  // Group conversations by stage
  filteredConversations.forEach(conversation => {
    let targetStageName: string = ENTRY_STAGE.name // default fallback
    
    if (conversation.crm_stage) {
      if (conversation.crm_stage === 'novo_lead') {
        targetStageName = ENTRY_STAGE.name
      } else if (conversation.crm_stage.startsWith('custom:')) {
        const stageName = conversation.crm_stage.replace('custom:', '')
        const customStage = customStages.find(s => s.name === stageName)
        if (customStage) {
          targetStageName = customStage.name
        }
      }
    }
    
    // Ensure the target stage exists in crmData, if not use first available stage
    if (crmData[targetStageName]) {
      crmData[targetStageName].push(conversation)
    } else if (Object.keys(crmData).length > 0) {
      const firstStage = Object.keys(crmData)[0]
      crmData[firstStage].push(conversation)
    }
  })

  // Get unique channels for filtering
  const allChannels = Array.from(new Set(conversations.map(c => c.channel).filter(Boolean)))

  // Utility function to clear all filters
  const clearFilters = () => {
    setFilterChannel('all')
    setFilterValueRange('all')
    setFilterPeriod('all')
    setFilterStatus('all')
    setFilterUser('all')
  }

  // Manual refresh function
  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    setIsLoading(true)
    try {
      await Promise.all([fetchConversations(), fetchCustomStages()])
      setLastRefresh(new Date())
      toast({
        title: "Dados Atualizados",
        description: "Informações sincronizadas com o banco de dados",
      })
    } catch (error) {
      console.error('Error during manual refresh:', error)
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível sincronizar os dados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasValueData = conversations.some(c => c.value && c.value > 0)
  const filteredLeadsCount = filteredConversations.length
  const totalLeads = conversations.length

  return {
    // Data
    crmData,
    stages,
    stageColorsMap,
    conversations: filteredConversations,
    customStages,
    allChannels,
    allUsers,
    
    // Loading state
    isLoading,
    
    // Filter states
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
    
    // Statistics
    hasValueData,
    filteredLeadsCount,
    totalLeads,
    
    // Admin status
    isAdmin,
    
    // Management functions
    addCustomStage,
    deleteCustomStage,
    updateCustomStage,
    updateStageOrder,
    updateConversationStatus,
    
    // Refresh functions
    refetch: fetchConversations,
    manualRefresh,
    lastRefresh,
    
    // For backwards compatibility and CRM page compatibility
    basicStages: [ENTRY_STAGE.name],
    currentUser: user,
    currentUserId: user?.id,
    allStages,
    updateBasicStageOrder: updateStageOrder,
    updateBasicStage: () => Promise.resolve() // No longer needed but kept for compatibility
  }
}

export type { CRMConversation, CustomStage, CRMStageData }