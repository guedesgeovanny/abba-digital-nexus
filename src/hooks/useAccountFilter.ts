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
      
      // Usando contact_phone como fonte para os números de telefone/accounts
      const { data, error } = await supabase
        .from('conversations')
        .select('contact_phone')
        .eq('user_id', user?.id)
        .not('contact_phone', 'is', null)
      
      if (error) {
        console.error('Erro ao buscar números únicos:', error)
        setAccounts([])
        return
      }
      
      // Extrair valores únicos da coluna contact_phone
      const uniqueAccounts = Array.from(new Set(
        data.map(item => item.contact_phone).filter(Boolean)
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