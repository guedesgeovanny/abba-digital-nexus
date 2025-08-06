import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAgents } from './useAgents'
import { checkConnectionStatus } from '@/services/webhookService'

export const useWhatsAppStatusCheck = () => {
  const { agents, isLoading, disconnectAgentWhatsApp } = useAgents()
  const { toast } = useToast()

  const checkAgentStatus = useCallback(async (agentId: string, instanceName: string) => {
    try {
      console.log(`🔍 Verificando status do agente ${agentId} (${instanceName})`)
      
      const result = await checkConnectionStatus(instanceName)
      
      if (!result.connected) {
        console.log(`❌ Agente ${agentId} desconectado, removendo dados WhatsApp`)
        
        await disconnectAgentWhatsApp(agentId)
        
        toast({
          title: "WhatsApp Desconectado",
          description: `O agente foi desconectado automaticamente.`,
          variant: "destructive"
        })
        
        return false
      }
      
      console.log(`✅ Agente ${agentId} ainda conectado`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao verificar status do agente ${agentId}:`, error)
      return false
    }
  }, [disconnectAgentWhatsApp, toast])

  const checkAllConnectedAgents = useCallback(async () => {
    if (!agents || isLoading) return
    
    const connectedAgents = agents.filter(agent => 
      agent.whatsapp_contact || agent.whatsapp_profile_name
    )
    
    if (connectedAgents.length === 0) {
      console.log('📱 Nenhum agente conectado para verificar')
      return
    }
    
    console.log(`🔍 Verificando status de ${connectedAgents.length} agentes conectados`)
    
    for (const agent of connectedAgents) {
      const config = agent.configuration as any
      const instanceName = config?.evolution_instance_name || agent.name
      if (instanceName) {
        await checkAgentStatus(agent.id, instanceName)
      }
    }
  }, [agents, isLoading, checkAgentStatus])

  const manualCheck = useCallback(async (agentId: string, instanceName: string) => {
    return await checkAgentStatus(agentId, instanceName)
  }, [checkAgentStatus])

  // Verificação automática a cada 30 minutos
  useEffect(() => {
    // Verificação inicial após 1 minuto
    const initialTimeout = setTimeout(() => {
      checkAllConnectedAgents()
    }, 60000)

    // Verificação periódica a cada 30 minutos
    const interval = setInterval(() => {
      checkAllConnectedAgents()
    }, 30 * 60 * 1000) // 30 minutos

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [checkAllConnectedAgents])

  return {
    manualCheck,
    checkAllConnectedAgents
  }
}