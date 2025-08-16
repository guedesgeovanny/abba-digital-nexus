import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface AccountOption {
  value: string
  label: string
}

export const useAccountFilter = () => {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUniqueAccounts()
    }
  }, [user])

  const fetchUniqueAccounts = async () => {
    try {
      setIsLoading(true)
      
      console.log('Buscando conexões WhatsApp ativas...')
      
      // Buscar conexões WhatsApp ativas do usuário
      const { data, error } = await supabase
        .from('conexoes')
        .select('whatsapp_contact, name')
        .eq('user_id', user?.id)
        .eq('type', 'whatsapp')
        .eq('status', 'connected')
        .not('whatsapp_contact', 'is', null)
      
      console.log('Conexões retornadas:', data)
      
      if (error) {
        console.error('Erro ao buscar conexões WhatsApp:', error)
        setAccounts([])
        return
      }
      
      // Criar array com formato "nome (número)" para exibição
      const connectionAccounts = data.map((connection: any) => ({
        value: connection.whatsapp_contact,
        label: `${connection.name} (${connection.whatsapp_contact})`
      }))
      
      console.log('Contas formatadas:', connectionAccounts)
      
      setAccounts(connectionAccounts)
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    accounts,
    isLoading,
    refetch: fetchUniqueAccounts
  }
}