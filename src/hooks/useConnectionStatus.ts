
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface UseConnectionStatusProps {
  instanceName: string | null
  isActive: boolean
  onConnected?: () => void
}

export const useConnectionStatus = ({ 
  instanceName, 
  isActive, 
  onConnected 
}: UseConnectionStatusProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected')
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const checkConnectionStatus = useCallback(async () => {
    if (!instanceName || !isActive) {
      return
    }

    try {
      setIsChecking(true)
      const response = await fetch(
        `https://api.abbadigital.com.br/instance/connectionState/${instanceName}`
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log('Connection status response:', data)
        
        // Assumindo que a API retorna um status que indica conexão estabelecida
        // Ajustar conforme a estrutura real da resposta da API
        if (data.state === 'open' || data.connected === true || data.status === 'connected') {
          setConnectionStatus('connected')
          onConnected?.()
          toast({
            title: "WhatsApp Conectado!",
            description: "Sua conexão foi estabelecida com sucesso.",
          })
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
  }, [])

  return {
    connectionStatus,
    isChecking,
    resetStatus
  }
}
