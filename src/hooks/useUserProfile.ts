
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  created_at: string
  updated_at: string
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('No user ID found')
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      console.log('Fetching profile for user:', user.id)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        setProfile(null)
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data as UserProfile)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  return {
    profile,
    loading,
    refetch: fetchProfile
  }
}
