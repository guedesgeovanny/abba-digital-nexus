import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export const useAccountFilter = () => {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUniqueAccounts()
    }
  }, [user])

  const fetchUniqueAccounts = async () => {
    try {
      setIsLoading(true)
      
      // Usando dados fictícios até a migração ser aplicada
      const sampleAccounts = [
        'WhatsApp Business',
        'Instagram', 
        'Facebook Messenger',
        'Principal'
      ]
      
      setAccounts(sampleAccounts)
      
      // Código para quando a migração estiver aplicada:
      /*
      const { data, error } = await supabase
        .from('conversations')
        .select('account')
        .eq('user_id', user?.id)
        .not('account', 'is', null)
      
      if (error) {
        console.error('Erro ao buscar accounts únicos:', error)
        return
      }
      
      // Extrair valores únicos
      const uniqueAccounts = Array.from(new Set(
        data.map(item => item.account).filter(Boolean)
      )) as string[]
      
      setAccounts(uniqueAccounts)
      */
    } catch (error) {
      console.error('Erro ao carregar accounts:', error)
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