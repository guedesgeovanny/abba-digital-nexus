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
      
      // Buscar valores únicos da coluna 'account' das conversas
      const { data, error } = await supabase
        .from('conversations')
        .select('account')
        .not('account', 'is', null)
      
      if (error) {
        console.error('Erro ao buscar contas das conversas:', error)
        setAccounts([])
        return
      }
      
      // Criar array com valores únicos da coluna account
      const uniqueAccounts = [...new Set(data.map(conv => conv.account))]
        .filter(account => account && account.trim() !== '')
        .map(account => ({
          value: account,
          label: account
        }))
      
      setAccounts(uniqueAccounts)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
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