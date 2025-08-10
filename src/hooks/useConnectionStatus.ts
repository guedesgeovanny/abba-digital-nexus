
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getInstanceProfile } from '@/services/webhookService'

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

  const checkConnectionStatus = useCallback(async () => {
    if (!instanceName || !isActive) {
      return
    }

    try {
      setIsChecking(true)
      console.log(`🔍 Verificando status via webhook para: ${instanceName}`)
      
      const profileData = await getInstanceProfile(instanceName)
      
      if (profileData && profileData.status === 'open') {
        console.log('✅ Conexão confirmada via webhook:', profileData)
        setConnectionStatus('connected')
        
        const profile: ProfileData = {
          profilePictureUrl: profileData.fotodoperfil || '',
          owner: profileData.contato || '',
          profileName: profileData.profilename || ''
        }
        
        setProfileData(profile)
        onConnected?.(profile)
        
        toast({
          title: "WhatsApp Conectado!",
          description: `Conectado como ${profile.profileName || profile.owner}`,
        })
      } else {
        console.log('❌ Conexão não confirmada via webhook')
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status da conexão via webhook:', error)
      setConnectionStatus('disconnected')
    } finally {
      setIsChecking(false)
    }
  }, [instanceName, isActive, onConnected, toast])

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
