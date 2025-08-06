import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAgents } from './useAgents'
import { checkConnectionStatus, getInstanceProfile } from '@/services/webhookService'

export const useWhatsAppStatusCheck = () => {
  const { agents, isLoading, disconnectAgentWhatsApp, updateAgentWhatsAppProfile } = useAgents()
  const { toast } = useToast()

  const checkAgentStatus = useCallback(async (agentId: string, connectionName: string) => {
    try {
      console.log(`🔍 Verificando status do agente ${agentId} (conexão: ${connectionName})`)
      console.log(`📡 Enviando instanceName para webhook: "${connectionName}"`)
      
      const profileData = await getInstanceProfile(connectionName)
      
      if (!profileData || !profileData.status) {
        console.log(`❌ Agente ${agentId} desconectado, removendo dados WhatsApp`)
        
        await disconnectAgentWhatsApp(agentId)
        
        toast({
          title: "WhatsApp Desconectado",
          description: `O agente foi desconectado automaticamente.`,
          variant: "destructive"
        })
        
        return false
      }
      
      // Se status for "close" ou "connecting", excluir dados
      if (profileData.status === 'close' || profileData.status === 'connecting') {
        console.log(`❌ Status ${profileData.status}, removendo dados WhatsApp`)
        await disconnectAgentWhatsApp(agentId)
        
        toast({
          title: "WhatsApp Desconectado",
          description: `O agente foi desconectado automaticamente.`,
          variant: "destructive"
        })
        
        return false
      }
      
      // Se status for "open", atualizar dados usando profilename do retorno (como na verificação manual)
      if (profileData.status === 'open') {
        console.log('✅ Atualizando perfil do agente com dados válidos:', profileData)
        await updateAgentWhatsAppProfile({
          agentId,
          profileName: profileData.profilename, // Usar profilename original do webhook
          contact: profileData.contato,
          profilePictureUrl: profileData.fotodoperfil
        })
        return true
      }
      
      // Para outros status, apenas informar
      console.log(`⚠️ Status ${profileData.status}, sem ação necessária`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao verificar status do agente ${agentId}:`, error)
      return false
    }
  }, [disconnectAgentWhatsApp, updateAgentWhatsAppProfile, toast])

  const checkAllConnectedAgents = useCallback(async () => {
    console.log('🔍 Verificando status de todos os agentes conectados...')
    
    if (!agents?.length) {
      console.log('📱 Nenhum agente encontrado')
      return
    }
    
    const connectedAgents = agents.filter(agent => 
      agent.whatsapp_connected_at && agent.whatsapp_contact
    )
    
    if (connectedAgents.length === 0) {
      console.log('📱 Nenhum agente conectado para verificar')
      return
    }
    
    console.log(`📱 Verificando ${connectedAgents.length} agente(s) conectado(s)`)
    
    for (const agent of connectedAgents) {
      const config = agent.configuration as any
      const connectionName = config?.evolution_instance_name || 
        (agent.name.includes('IA') ? 'Agente-de-IA' : 'Atendimento-Humano')
      
      console.log(`🔍 Verificando agente: ${agent.name} com conexão: ${connectionName}`)
      console.log(`📡 instanceName que será enviado para o webhook: "${connectionName}"`)
      await checkAgentStatus(agent.id, connectionName)
    }
  }, [agents, isLoading, checkAgentStatus])

  const manualCheck = useCallback(async (agentId: string, connectionName: string) => {
    try {
      console.log(`🔍 Verificação manual do agente ${agentId} (conexão: ${connectionName})`)
      console.log(`📡 Enviando instanceName para webhook (manual): "${connectionName}"`)
      
      // Buscar dados completos do perfil
      const profileData = await getInstanceProfile(connectionName)
      
      if (!profileData) {
        console.log(`⚠️ Não foi possível obter dados do perfil`)
        return false
      }
      
      const { status } = profileData
      console.log(`📊 Status obtido: ${status}`)
      
      // Se status for "close" ou "connecting", excluir dados
      if (status === 'close' || status === 'connecting') {
        console.log(`❌ Status ${status}, removendo dados WhatsApp`)
        await disconnectAgentWhatsApp(agentId)
        return false
      }
      
      // Se status for "open", atualizar dados usando profilename do retorno
      if (status === 'open') {
        if (profileData) {
          console.log('✅ Atualizando perfil do agente com dados válidos:', profileData)
          await updateAgentWhatsAppProfile({
            agentId,
            profileName: profileData.profilename, // Usar profilename original do webhook
            contact: profileData.contato,
            profilePictureUrl: profileData.fotodoperfil
          })
          return true
        }
      }
      
      // Para outros status, apenas informar
      console.log(`⚠️ Status ${status}, sem ação necessária`)
      return true
      
    } catch (error) {
      console.error(`❌ Erro na verificação manual do agente ${agentId}:`, error)
      return false
    }
  }, [disconnectAgentWhatsApp, updateAgentWhatsAppProfile])

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