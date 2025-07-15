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
      
      // Buscar dados da coluna account (mesmo que não apareça nos tipos ainda)
      const { data, error } = await supabase
        .from('conversations')
        .select('account')
        .eq('user_id', user?.id)
        .not('account', 'is', null)
      
      if (error) {
        console.error('Erro ao buscar accounts únicos:', error)
        setAccounts([])
        return
      }
      
      // Extrair valores únicos da coluna account
      const uniqueAccounts = Array.from(new Set(
        data.map((item: any) => item.account).filter(Boolean)
      )) as string[]
      
      setAccounts(uniqueAccounts)
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