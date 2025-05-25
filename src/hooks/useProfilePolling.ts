
import { useState, useEffect, useCallback } from 'react'
import { getInstanceProfile, downloadProfileImage, saveProfileToDatabase } from '@/services/webhookService'
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
      
      if (profileData) {
        console.log('✅ Dados do perfil recebidos via polling!')
        
        // Baixar a imagem do perfil
        const profilePictureData = await downloadProfileImage(profileData.fotodoperfil)
        
        if (!profilePictureData) {
          console.error('❌ Falha ao baixar imagem do perfil')
          return
        }
        
        const formattedProfileData: ProfileData = {
          profileName: profileData.profilename,
          contact: profileData.contato,
          profilePictureUrl: profilePictureData // Usar a imagem baixada em base64
        }
        
        // Salvar no banco se temos o agentId
        if (agentId) {
          console.log('💾 Salvando dados do perfil no banco...')
          
          // Usar a nova função do hook useAgents para salvar no banco
          updateAgentWhatsAppProfile({
            agentId,
            profileName: profileData.profilename,
            contact: profileData.contato,
            profilePictureUrl: profileData.fotodoperfil,
            profilePictureData: profilePictureData
          })

          console.log('✅ Dados do perfil salvos no banco com sucesso')
        }
        
        setIsPolling(false)
        onProfileReceived(formattedProfileData)
      } else {
        console.log('⏳ Dados ainda não disponíveis, continuando polling...')
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

    // Fazer primeira chamada imediatamente
    pollProfile()

    // Configurar interval para chamadas subsequentes a cada 3 segundos
    const interval = setInterval(pollProfile, 3000)

    return () => {
      console.log('⏹️ Parando polling do perfil')
      setIsPolling(false)
      clearInterval(interval)
    }
  }, [isActive, instanceName, pollProfile])

  return {
    isPolling
  }
}
