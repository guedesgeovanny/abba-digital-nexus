
import { useState, useEffect, useCallback } from 'react'
import { getInstanceProfile } from '@/services/webhookService'
import { ProfileData } from '@/utils/whatsappUtils'

interface UseProfilePollingProps {
  instanceName: string | null
  isActive: boolean
  onProfileReceived: (profileData: ProfileData) => void
}

export const useProfilePolling = ({ 
  instanceName, 
  isActive, 
  onProfileReceived 
}: UseProfilePollingProps) => {
  const [isPolling, setIsPolling] = useState(false)

  const pollProfile = useCallback(async () => {
    if (!instanceName || !isActive) return

    try {
      const profileData = await getInstanceProfile(instanceName)
      
      if (profileData) {
        console.log('✅ Dados do perfil recebidos via polling!')
        const formattedProfileData: ProfileData = {
          profileName: profileData.profilename,
          contact: profileData.contato,
          profilePictureUrl: profileData.fotodoperfil
        }
        
        setIsPolling(false)
        onProfileReceived(formattedProfileData)
      }
    } catch (error) {
      console.error('❌ Erro no polling do perfil:', error)
    }
  }, [instanceName, isActive, onProfileReceived])

  useEffect(() => {
    if (!isActive || !instanceName) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    console.log('🔄 Iniciando polling do perfil a cada 3 segundos...')

    // Fazer primeira chamada imediatamente
    pollProfile()

    // Configurar interval para chamadas subsequentes
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
