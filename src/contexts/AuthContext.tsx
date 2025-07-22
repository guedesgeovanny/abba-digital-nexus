
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  status: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
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
  const { toast } = useToast()

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    console.log('AuthContext: Fetching profile for user:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('AuthContext: Erro ao buscar perfil:', error)
        return null
      }

      console.log('AuthContext: Profile fetched:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)

        // Usar setTimeout para evitar deadlock no onAuthStateChange
        if (session?.user && event !== 'SIGNED_OUT') {
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id)
            setUserProfile(profile)

            // Verificar se o usuário está pendente de aprovação
            if (profile?.status === 'pending') {
              toast({
                title: 'Conta Pendente de Aprovação',
                description: 'Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador antes de acessar o sistema.',
                variant: 'destructive'
              })
              await supabase.auth.signOut()
              return
            }

            // Verificar se o usuário está inativo
            if (profile?.status === 'inactive') {
              toast({
                title: 'Conta Inativa',
                description: 'Sua conta foi desativada. Entre em contato com o administrador.',
                variant: 'destructive'
              })
              await supabase.auth.signOut()
              return
            }
          }, 0)
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Initial session check:', !!session)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)

        // Verificar status também na sessão inicial
        if (profile?.status === 'pending') {
          toast({
            title: 'Conta Pendente de Aprovação',
            description: 'Sua conta precisa ser aprovada por um administrador.',
            variant: 'destructive'
          })
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        if (profile?.status === 'inactive') {
          toast({
            title: 'Conta Inativa',
            description: 'Sua conta foi desativada.',
            variant: 'destructive'
          })
          await supabase.auth.signOut()
          setLoading(false)
          return
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    }).catch(error => {
      console.error('AuthContext: Error getting session:', error)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Criar usuário SEM confirmação de email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
          // Removido emailRedirectTo para não precisar de confirmação
        }
      })

      if (error) {
        return { error }
      }

      // Se o usuário foi criado, criar perfil com status pending
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName || '',
              role: 'viewer',
              status: 'pending' // Status pending para admin aprovar
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
            // Não retornar erro aqui para não bloquear o signup
          }
        } catch (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
