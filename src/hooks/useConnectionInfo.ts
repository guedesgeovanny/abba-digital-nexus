import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ConnectionInfo {
  name: string | null
  whatsapp_contact: string | null
}

export const useConnectionInfo = (account: string | null) => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!account) {
      setConnectionInfo(null)
      return
    }

    const fetchConnectionInfo = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('conexoes')
          .select('name, whatsapp_contact')
          .eq('whatsapp_contact', account)
          .maybeSingle()
        
        if (error) {
          console.error('Erro ao buscar informações da conexão:', error)
          setConnectionInfo(null)
          return
        }
        
        setConnectionInfo(data)
      } catch (error) {
        console.error('Erro ao carregar informações da conexão:', error)
        setConnectionInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnectionInfo()
  }, [account])

  return {
    connectionInfo,
    isLoading
  }
}