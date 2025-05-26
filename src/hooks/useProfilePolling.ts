
import { useState, useEffect, useCallback } from 'react'
import { getInstanceProfile, downloadProfileImage } from '@/services/webhookService'
import { ProfileData } from '@/utils/whatsappUtils'
import { useAgents } from '@/hooks/useAgents'

interface UseProfilePollingProps {
  instanceName: string | null
  agentId?: string | null
  isActive: boolean
  onProfileReceived: (profileData: ProfileData) => void
}

export const useProfilePolling = ({ 
  instanceName, 
  agentId,
  isActive, 
  onProfileReceived 
}: UseProfilePollingProps) => {
  const [isPolling, setIsPolling] = useState(false)
  const { updateAgentWhatsAppProfile } = useAgents()

  const pollProfile = useCallback(async () => {
    if (!instanceName || !isActive) return

    try {
      console.log(`🔄 Fazendo polling para instância: ${instanceName}`)
      const profileData = await getInstanceProfile(instanceName)
      
      console.log('📋 Dados recebidos do polling:', profileData)
      
      if (profileData && 
          profileData.profilename && 
          profileData.contato && 
          profileData.fotodoperfil &&
          profileData.profilename.trim() !== '' &&
          profileData.contato.trim() !== '' &&
          profileData.fotodoperfil.trim() !== '') {
        
        console.log('✅ Dados do perfil válidos recebidos via polling!')
        console.log('📋 Dados validados:', {
          profilename: profileData.profilename,
          contato: profileData.contato,
          fotodoperfil: profileData.fotodoperfil
        })
        
        // Baixar a imagem do perfil
        const profilePictureData = await downloadProfileImage(profileData.fotodoperfil)
        
        if (!profilePictureData) {
          console.error('❌ Falha ao baixar imagem do perfil')
          return
        }
        
        const formattedProfileData: ProfileData = {
          profileName: profileData.profilename,
          contact: profileData.contato,
          profilePictureUrl: profilePictureData
        }
        
        // Salvar no banco se temos o agentId real
        if (agentId && agentId.length > 10) { // ID real tem mais de 10 caracteres
          console.log('💾 Salvando dados do perfil no banco para agente:', agentId)
          console.log('💾 Dados a serem salvos:', {
            whatsapp_profile_name: profileData.profilename,
            whatsapp_contact: profileData.contato,
            whatsapp_profile_picture_url: profileData.fotodoperfil
          })
          
          try {
            await updateAgentWhatsAppProfile({
              agentId,
              profileName: profileData.profilename,
              contact: profileData.contato,
              profilePictureUrl: profileData.fotodoperfil,
              profilePictureData: profilePictureData
            })

            console.log('✅ Dados do perfil salvos no banco com sucesso')
          } catch (error) {
            console.error('❌ Erro ao salvar perfil no banco:', error)
          }
        } else {
          console.log('⚠️ AgentId não disponível ainda ou é temporário. AgentId:', agentId)
        }
        
        setIsPolling(false)
        onProfileReceived(formattedProfileData)
      } else {
        console.log('⏳ Dados ainda não disponíveis ou incompletos, continuando polling...')
        if (profileData) {
          console.log('📋 Dados parciais recebidos:', {
            profilename: profileData.profilename || 'não disponível',
            contato: profileData.contato || 'não disponível',
            fotodoperfil: profileData.fotodoperfil || 'não disponível'
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro no polling do perfil:', error)
    }
  }, [instanceName, agentId, isActive, onProfileReceived, updateAgentWhatsAppProfile])

  useEffect(() => {
    if (!isActive || !instanceName) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    console.log(`🔄 Iniciando polling do perfil a cada 3 segundos para: ${instanceName}`)
    console.log('🔍 AgentId para salvar no banco:', agentId)

    // Fazer primeira chamada imediatamente
    pollProfile()

    // Configurar interval para chamadas subsequentes a cada 3 segundos
    const interval = setInterval(pollProfile, 3000)

    return () => {
      console.log('⏹️ Parando polling do perfil')
      setIsPolling(false)
      clearInterval(interval)
    }
  }, [isActive, instanceName, agentId, pollProfile])

  return {
    isPolling
  }
}
