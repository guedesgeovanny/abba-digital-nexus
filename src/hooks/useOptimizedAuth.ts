import { useState, useEffect, useRef, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  status: string
}

// Cache para perfis de usuário
const profileCache = new Map<string, { data: UserProfile, timestamp: number }>()
const PROFILE_CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

export const useOptimizedAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  const isMountedRef = useRef(true)
  const fetchingProfileRef = useRef<string | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)

  // Função otimizada para buscar perfil com cache e retry
  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    // Verificar cache primeiro
    const cached = profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_DURATION) {
      console.log('useOptimizedAuth: Using cached profile')
      setUserProfile(cached.data)
      return cached.data
    }

    // Evitar múltiplas chamadas simultâneas
    if (fetchingProfileRef.current === userId) {
      console.log('useOptimizedAuth: Profile fetch already in progress')
      return null
    }

    fetchingProfileRef.current = userId
    setIsLoadingProfile(true)

    try {
      // Timeout otimizado para 3 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      })

      // Tentar função otimizada primeiro
      let data: UserProfile | null = null
      let error: any = null

      try {
        const result = await Promise.race([
          supabase.rpc('get_user_profile_fast', { user_id_param: userId }),
          timeoutPromise
        ]) as any

        if (result.data && result.data.length > 0) {
          data = result.data[0]
        } else {
          throw new Error('Profile not found in RPC')
        }
      } catch (rpcError) {
        console.warn('useOptimizedAuth: RPC failed, using fallback:', rpcError)
        
        // Fallback para query simples com timeout menor
        const fallbackPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Fallback timeout')), 2000)
        })

        const result = await Promise.race([
          supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, role, status')
            .eq('id', userId)
            .maybeSingle(),
          fallbackPromise
        ]) as any
        
        data = result.data
        error = result.error
      }

      if (!isMountedRef.current) return null

      if (error || !data) {
        throw new Error(error?.message || 'Profile not found')
      }

      // Salvar no cache
      profileCache.set(userId, {
        data: data,
        timestamp: Date.now()
      })

      console.log('useOptimizedAuth: Profile fetched successfully')
      setUserProfile(data)
      retryCountRef.current = 0
      return data

    } catch (error: any) {
      console.error('useOptimizedAuth: Profile fetch error:', error)
      
      // Implementar retry inteligente
      if (retryCount < 2 && !error.message?.includes('timeout')) {
        console.log(`useOptimizedAuth: Retrying profile fetch (${retryCount + 1}/2)`)
        
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchUserProfile(userId, retryCount + 1)
          }
        }, 1000 * (retryCount + 1)) // Backoff exponencial
        
        return null
      }

      // Após falhas, tentar usar cache expirado
      const expiredCache = profileCache.get(userId)
      if (expiredCache) {
        console.log('useOptimizedAuth: Using expired cache as fallback')
        setUserProfile(expiredCache.data)
        return expiredCache.data
      }

      if (isMountedRef.current) {
        setUserProfile(null)
      }
      return null
    } finally {
      if (isMountedRef.current) {
        setIsLoadingProfile(false)
        fetchingProfileRef.current = null
      }
    }
  }, [])

  // Função para invalidar cache do perfil
  const invalidateProfileCache = useCallback((userId?: string) => {
    if (userId) {
      profileCache.delete(userId)
    } else {
      profileCache.clear()
    }
  }, [])

  // Setup inicial otimizado
  useEffect(() => {
    console.log('useOptimizedAuth: Initializing')
    isMountedRef.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useOptimizedAuth: Auth state changed:', event)
        
        if (!isMountedRef.current) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user && event !== 'SIGNED_OUT') {
          // Delay mínimo para evitar race conditions
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchUserProfile(session.user.id)
            }
          }, 50)
        } else {
          setUserProfile(null)
          setIsLoadingProfile(false)
          fetchingProfileRef.current = null
          retryCountRef.current = 0
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
          }
        }

        // Loading state management otimizado
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          setTimeout(() => {
            if (isMountedRef.current) {
              setLoading(false)
            }
          }, session?.user ? 100 : 0)
        }
      }
    )

    // Verificação inicial da sessão
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('useOptimizedAuth: Error getting session:', error)
          return
        }

        if (!isMountedRef.current) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('useOptimizedAuth: Initialization error:', error)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      console.log('useOptimizedAuth: Cleaning up')
      isMountedRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  // Função para recarregar perfil
  const refetchProfile = useCallback(() => {
    if (user?.id) {
      invalidateProfileCache(user.id)
      fetchUserProfile(user.id)
    }
  }, [user?.id, fetchUserProfile, invalidateProfileCache])

  return {
    user,
    session,
    userProfile,
    loading,
    isLoadingProfile,
    refetchProfile,
    invalidateProfileCache
  }
}