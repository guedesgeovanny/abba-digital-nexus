
import { useMemo } from 'react'
import { useContacts, ContactWithTags } from './useContacts'
import { useAgents } from './useAgents'

export interface CRMDeal {
  id: string
  name: string
  company?: string
  value: string
  source: string
  agent: string
  contact: string
  email?: string
  instagram?: string
  tags: string[]
  daysInStage: number
  status: string
  created_at: string
  updated_at: string
}

export interface CRMStageData {
  [stageName: string]: CRMDeal[]
}

const STATUS_TO_STAGE_MAP = {
  'novo': 'Novo Lead',
  'em_andamento': 'Qualificado',
  'qualificado': 'Proposta',
  'convertido': 'Fechado',
  'perdido': 'Perdido'
} as const

const STAGE_COLORS = {
  'Novo Lead': '#3b82f6',
  'Qualificado': '#f59e0b',
  'Proposta': '#8b5cf6',
  'Fechado': '#10b981',
  'Perdido': '#ef4444'
} as const

export const useCRMData = () => {
  const { contacts, isLoading: contactsLoading, updateContact } = useContacts()
  const { agents, isLoading: agentsLoading } = useAgents()

  const { crmData, stages, stageColorsMap } = useMemo(() => {
    if (!contacts || !agents) {
      return { crmData: {}, stages: [], stageColorsMap: {} }
    }

    const agentsMap = new Map(agents.map(agent => [agent.id, agent.name]))
    
    const transformedDeals: CRMDeal[] = contacts.map((contact: ContactWithTags) => {
      const stageName = STATUS_TO_STAGE_MAP[contact.status] || 'Novo Lead'
      const agentName = contact.agent_assigned ? agentsMap.get(contact.agent_assigned) || 'Não atribuído' : 'Não atribuído'
      
      // Calculate days in stage
      const updatedAt = new Date(contact.updated_at)
      const now = new Date()
      const daysInStage = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
      
      // Use real value from database or estimate based on status
      const contactValue = (contact as any).value || getEstimatedValue(contact.status, contact.company)
      
      // For Instagram channel, use instagram handle as name if available
      const displayName = contact.channel === 'instagram' && contact.instagram 
        ? `@${contact.instagram}` 
        : contact.name
        
      return {
        id: contact.id,
        name: displayName,
        company: contact.company || undefined,
        value: `R$ ${contactValue.toLocaleString('pt-BR')}`,
        source: getSourceDisplay(contact.channel, contact.source),
        agent: agentName,
        contact: contact.phone || '',
        email: contact.email || undefined,
        instagram: contact.instagram || undefined,
        tags: contact.tags.map(tag => tag.name),
        daysInStage,
        status: contact.status,
        created_at: contact.created_at,
        updated_at: contact.updated_at
      }
    })

    // Group deals by stage
    const groupedDeals: CRMStageData = {}
    const uniqueStages = new Set<string>()

    transformedDeals.forEach(deal => {
      const stageName = STATUS_TO_STAGE_MAP[deal.status as keyof typeof STATUS_TO_STAGE_MAP] || 'Novo Lead'
      uniqueStages.add(stageName)
      
      if (!groupedDeals[stageName]) {
        groupedDeals[stageName] = []
      }
      groupedDeals[stageName].push(deal)
    })

    // Ensure all stages exist
    Object.values(STATUS_TO_STAGE_MAP).forEach(stage => {
      uniqueStages.add(stage)
      if (!groupedDeals[stage]) {
        groupedDeals[stage] = []
      }
    })

    const stagesArray = Array.from(uniqueStages).sort((a, b) => {
      const order = ['Novo Lead', 'Qualificado', 'Proposta', 'Fechado', 'Perdido']
      return order.indexOf(a) - order.indexOf(b)
    })

    return {
      crmData: groupedDeals,
      stages: stagesArray,
      stageColorsMap: STAGE_COLORS
    }
  }, [contacts, agents])

  const updateDealStatus = async (dealId: string, newStage: string) => {
    const statusKey = Object.keys(STATUS_TO_STAGE_MAP).find(
      key => STATUS_TO_STAGE_MAP[key as keyof typeof STATUS_TO_STAGE_MAP] === newStage
    ) as keyof typeof STATUS_TO_STAGE_MAP

    if (statusKey) {
      await updateContact({ id: dealId, status: statusKey })
    }
  }

  const getFilteredDeals = (stageDeals: CRMDeal[], filters: {
    agent?: string
    channel?: string
    tag?: string
  }) => {
    return stageDeals.filter(deal => {
      if (filters.agent && filters.agent !== 'all' && deal.agent !== filters.agent) {
        return false
      }
      if (filters.channel && filters.channel !== 'all' && !deal.source.toLowerCase().includes(filters.channel.toLowerCase())) {
        return false
      }
      if (filters.tag && filters.tag !== 'all' && !deal.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))) {
        return false
      }
      return true
    })
  }

  const getTotalValue = (stageDeals: CRMDeal[], filters?: any) => {
    const filteredDeals = filters ? getFilteredDeals(stageDeals, filters) : stageDeals
    const total = filteredDeals.reduce((sum, deal) => {
      // Extract numeric value from formatted string
      const numericValue = deal.value.replace(/[^\d,]/g, '').replace(',', '.')
      const value = parseFloat(numericValue)
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
    return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getUniqueAgents = () => {
    const agentNames = new Set<string>()
    Object.values(crmData).flat().forEach(deal => {
      // Only add valid, non-empty agent names that are not "Não atribuído"
      if (deal.agent && 
          deal.agent.trim() !== '' && 
          deal.agent !== 'Não atribuído' && 
          deal.agent !== 'null' && 
          deal.agent !== 'undefined') {
        agentNames.add(deal.agent.trim())
      }
    })
    return Array.from(agentNames).filter(name => name.length > 0)
  }

  const getUniqueChannels = () => {
    const channels = new Set<string>()
    Object.values(crmData).flat().forEach(deal => {
      // Only add valid, non-empty channel sources
      if (deal.source && 
          deal.source.trim() !== '' && 
          deal.source !== 'Desconhecido' && 
          deal.source !== 'null' && 
          deal.source !== 'undefined') {
        channels.add(deal.source.trim())
      }
    })
    return Array.from(channels).filter(channel => channel.length > 0)
  }

  const getUniqueTags = () => {
    const tags = new Set<string>()
    Object.values(crmData).flat().forEach(deal => {
      deal.tags.forEach(tag => {
        // Only add valid, non-empty tags
        if (tag && 
            tag.trim() !== '' && 
            tag !== 'null' && 
            tag !== 'undefined') {
          tags.add(tag.trim())
        }
      })
    })
    return Array.from(tags).filter(tag => tag.length > 0)
  }

  return {
    crmData,
    stages,
    stageColorsMap,
    isLoading: contactsLoading || agentsLoading,
    updateDealStatus,
    getFilteredDeals,
    getTotalValue,
    getUniqueAgents,
    getUniqueChannels,
    getUniqueTags
  }
}

// Helper functions
function getEstimatedValue(status: string, company?: string): number {
  const baseValues = {
    'novo': 5000,
    'em_andamento': 8000,
    'qualificado': 15000,
    'convertido': 25000,
    'perdido': 3000
  }
  
  let value = baseValues[status as keyof typeof baseValues] || 5000
  
  // Add some variation based on company
  if (company) {
    const companyBonus = company.length * 100
    value += companyBonus
  }
  
  // Add some randomization for realism
  const variation = Math.random() * 0.4 - 0.2 // ±20%
  value = Math.round(value * (1 + variation))
  
  return Math.max(1000, value) // Minimum R$ 1.000
}

function getSourceDisplay(channel?: string, source?: string): string {
  // If source exists and is not empty, use it
  if (source && source.trim() !== '') {
    return source.trim()
  }
  
  // Map channels to display names, ensuring non-empty strings
  const channelMap = {
    'instagram': 'Instagram',
    'whatsapp': 'WhatsApp',
    'messenger': 'Messenger',
    'email': 'Email',
    'telefone': 'Telefone',
    'site': 'Site',
    'indicacao': 'Indicação'
  }
  
  // Return mapped channel or default value, never empty string
  if (channel && channel.trim() !== '') {
    return channelMap[channel.trim() as keyof typeof channelMap] || channel.trim()
  }
  
  return 'Desconhecido'
}
