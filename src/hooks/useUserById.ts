import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export const useUserById = (userId: string | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setUserProfile(null)
      return
    }

    const fetchUser = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error)
          setUserProfile(null)
          return
        }

        setUserProfile(data)
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { userProfile, loading }
}