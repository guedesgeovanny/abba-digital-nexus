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
      
      // Buscar dados baseados no channel existente
      // TODO: Após migração aplicada, trocar por: .select('account')
      const { data: channelData, error: channelError } = await supabase
        .from('conversations')
        .select('channel')
        .eq('user_id', user?.id)
      
      if (channelError) {
        console.error('Erro ao buscar channels:', channelError)
        setAccounts(['WhatsApp Business', 'Instagram', 'Facebook Messenger', 'Principal'])
        return
      }
      
      // Mapear channels para accounts (simulando dados da coluna account)
      const channelToAccount: Record<string, string> = {
        'whatsapp': 'WhatsApp Business',
        'instagram': 'Instagram',
        'messenger': 'Facebook Messenger'
      }
      
      const uniqueAccounts = Array.from(new Set(
        channelData?.map(item => channelToAccount[item.channel || ''] || 'Principal').filter(Boolean)
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