
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ProfileData {
  profilePictureUrl: string
  owner: string
  profileName: string
}

interface UseConnectionStatusProps {
  instanceName: string | null
  isActive: boolean
  onConnected?: (profileData: ProfileData) => void
}

export const useConnectionStatus = ({ 
  instanceName, 
  isActive, 
  onConnected 
}: UseConnectionStatusProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected')
  const [isChecking, setIsChecking] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const { toast } = useToast()

  const fetchProfileData = useCallback(async (instanceName: string) => {
    try {
      const response = await fetch(
        `https://api.abbadigital.com.br/instance/fetchInstances?instanceName=${instanceName}`,
        {
          headers: {
            'apikey': '673dc3960df85e704b3db2f1362f0e99'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data response:', data)
        
        // Limpar o número removendo o @s.whatsapp.net
        const cleanNumber = data.owner ? data.owner.replace('@s.whatsapp.net', '') : ''
        
        const profile: ProfileData = {
          profilePictureUrl: data.profilePictureUrl || '',
          owner: cleanNumber,
          profileName: data.profileName || ''
        }
        
        setProfileData(profile)
        return profile
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error)
    }
    return null
  }, [])

  const checkConnectionStatus = useCallback(async () => {
    if (!instanceName || !isActive) {
      return
    }

    try {
      setIsChecking(true)
      const response = await fetch(
        `https://api.abbadigital.com.br/instance/connectionState/${instanceName}`,
        {
          headers: {
            'apikey': '673dc3960df85e704b3db2f1362f0e99'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log('Connection status response:', data)
        
        // Verificar se está conectado (ajustar conforme a resposta real da API)
        if (data.state === 'open' || data.connected === true || data.status === 'connected') {
          setConnectionStatus('connected')
          
          // Buscar dados do perfil
          const profile = await fetchProfileData(instanceName)
          if (profile) {
            onConnected?.(profile)
            toast({
              title: "WhatsApp Conectado!",
              description: `Conectado como ${profile.profileName || profile.owner}`,
            })
          }
        } else {
          setConnectionStatus('disconnected')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error)
      setConnectionStatus('disconnected')
    } finally {
      setIsChecking(false)
    }
  }, [instanceName, isActive, onConnected, toast, fetchProfileData])

  useEffect(() => {
    if (!isActive || connectionStatus === 'connected') {
      return
    }

    // Verificação inicial
    checkConnectionStatus()

    // Polling a cada 3 segundos
    const interval = setInterval(checkConnectionStatus, 3000)

    return () => clearInterval(interval)
  }, [isActive, connectionStatus, checkConnectionStatus])

  const resetStatus = useCallback(() => {
    setConnectionStatus('disconnected')
    setProfileData(null)
  }, [])

  return {
    connectionStatus,
    isChecking,
    profileData,
    resetStatus
  }
}
