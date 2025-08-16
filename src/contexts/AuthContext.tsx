
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  status: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  isLoadingProfile: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const { toast } = useToast()
  const isMountedRef = useRef(true)
  const fetchingProfileRef = useRef<string | null>(null)

  // Função para buscar perfil do usuário com proteção contra loops
  const fetchUserProfile = async (userId: string) => {
    // Evitar múltiplas chamadas simultâneas para o mesmo usuário
    if (fetchingProfileRef.current === userId || isLoadingProfile) {
      console.log('AuthContext: Profile fetch already in progress for user:', userId)
      return null
    }

    console.log('AuthContext: Fetching profile for user:', userId)
    fetchingProfileRef.current = userId
    setIsLoadingProfile(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!isMountedRef.current) return null

      if (error) {
        console.error('AuthContext: Erro ao buscar perfil:', error)
        setUserProfile(null)
        return null
      }

      console.log('AuthContext: Profile fetched:', data)
      const profile = data as UserProfile
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
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
  }

  useEffect(() => {
    console.log('AuthContext: Setting up auth listener')
    isMountedRef.current = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.id)
        
        if (!isMountedRef.current) return

        setSession(session)
        setUser(session?.user ?? null)

        // Gerenciar perfil baseado no evento de auth
        if (session?.user && event !== 'SIGNED_OUT') {
          // Usar setTimeout para evitar deadlock no onAuthStateChange
          setTimeout(async () => {
            if (isMountedRef.current) {
              await fetchUserProfile(session.user.id)
            }
          }, 0)
        } else {
          setUserProfile(null)
          setIsLoadingProfile(false)
          fetchingProfileRef.current = null
        }

        // Definir loading como false apenas após processar o estado
        setTimeout(() => {
          if (isMountedRef.current) {
            setLoading(false)
          }
        }, 100)
      }
    )

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Checking initial session')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          return
        }

        if (!isMountedRef.current) return

        console.log('AuthContext: Initial session check:', !!session)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('AuthContext: Error in initialization:', error)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      console.log('AuthContext: Cleaning up')
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('AuthContext: Attempting signup for:', email)
      
      // Security Fix: Add emailRedirectTo for proper authentication flow
      const redirectUrl = `${window.location.origin}/`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          }
        }
      })

      if (error) {
        console.error('AuthContext: Signup error:', error)
        return { error }
      }

      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName || '',
              role: 'viewer',
              status: 'pending'
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
          }
        } catch (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }
      
      return { error: null }
    } catch (error) {
      console.error('AuthContext: Signup exception:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting signin for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('AuthContext: Signin error:', error)
      } else {
        console.log('AuthContext: Signin successful')
      }
      
      return { error }
    } catch (error) {
      console.error('AuthContext: Signin exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out')
      await supabase.auth.signOut()
      setUserProfile(null)
      setIsLoadingProfile(false)
      fetchingProfileRef.current = null
    } catch (error) {
      console.error('AuthContext: Signout error:', error)
    }
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    isLoadingProfile,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
