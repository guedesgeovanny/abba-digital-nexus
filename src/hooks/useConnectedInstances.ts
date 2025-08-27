import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ConnectedInstance {
  id: string
  name: string
  whatsapp_contact: string
}

export const useConnectedInstances = () => {
  const [connectedInstances, setConnectedInstances] = useState<ConnectedInstance[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchConnectedInstances = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('conexoes')
          .select('id, name, whatsapp_contact')
          .eq('status', 'connected')
          .not('whatsapp_contact', 'is', null)
        
        if (error) {
          console.error('Erro ao buscar instâncias conectadas:', error)
          return
        }
        
        setConnectedInstances(data || [])
      } catch (error) {
        console.error('Erro ao carregar instâncias conectadas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnectedInstances()

    // Escutar mudanças em tempo real na tabela conexoes
    const channel = supabase
      .channel('conexoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conexoes'
        },
        () => {
          fetchConnectedInstances()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Função para verificar se um número pertence a uma instância conectada
  const isConnectedInstanceNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return false
    
    return connectedInstances.some(instance => 
      instance.whatsapp_contact === phoneNumber
    )
  }

  // Lista dos números das instâncias conectadas
  const connectedNumbers = connectedInstances.map(instance => instance.whatsapp_contact)

  return {
    connectedInstances,
    connectedNumbers,
    isConnectedInstanceNumber,
    isLoading
  }
}