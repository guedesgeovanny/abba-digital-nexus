import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
}

// Cache em memória para usuários
const userCache = new Map<string, { data: User[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useOptimizedUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { userProfile: currentUserProfile } = useAuth()
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const isAdmin = currentUserProfile?.role === 'admin'
  const cacheKey = isAdmin ? 'all_users' : `user_${currentUserProfile?.id}`

  // Verificar cache antes de fazer fetch
  const getCachedUsers = () => {
    const cached = userCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('useOptimizedUsers: Using cached data')
      return cached.data
    }
    return null
  }

  // Salvar no cache
  const setCachedUsers = (userData: User[]) => {
    userCache.set(cacheKey, {
      data: userData,
      timestamp: Date.now()
    })
  }

  const fetchUsers = async (useCache = true) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Verificar cache primeiro
    if (useCache) {
      const cached = getCachedUsers()
      if (cached) {
        setUsers(cached)
        setLoading(false)
        setError(null)
        return
      }
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      setLoading(true)
      setError(null)

      // Timeout local de 5 segundos
      const timeoutPromise = new Promise((_, reject) => {
        fetchTimeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'))
        }, 5000)
      })

      let query
      if (isAdmin) {
        // Admin: buscar todos os usuários com campos otimizados
        query = supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, role, status, created_at, updated_at')
          .not('email', 'is', null)
          .order('created_at', { ascending: false })
      } else {
        // Usuário comum: apenas seu próprio perfil
        if (!currentUserProfile?.id) {
          setUsers([])
          setLoading(false)
          return
        }
        
        query = supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, role, status, created_at, updated_at')
          .eq('id', currentUserProfile.id)
          .limit(1)
      }

      // Executar query com timeout
      const { data: profiles, error } = await Promise.race([
        query.abortSignal(signal),
        timeoutPromise
      ]) as any

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }

      if (signal.aborted) return

      if (error) {
        throw error
      }

      // Processar dados
      const validUsers = (profiles || [])
        .filter((profile: any) => profile.email && profile.id)
        .map((profile: any) => ({
          ...profile,
          role: profile.role || 'viewer',
          status: profile.status || 'pending',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || null
        })) as User[]

      setUsers(validUsers)
      setCachedUsers(validUsers)
      console.log('useOptimizedUsers: Loaded users:', validUsers.length)

    } catch (error: any) {
      if (signal.aborted) return
      
      console.error('useOptimizedUsers: Error fetching users:', error)
      
      // Tratamento específico de erros
      if (error.message?.includes('timeout') || error.code === '57014') {
        setError('Timeout - dados podem estar desatualizados')
        // Tentar usar cache expirado como fallback
        const cached = userCache.get(cacheKey)
        if (cached) {
          setUsers(cached.data)
          console.log('useOptimizedUsers: Using expired cache as fallback')
        }
      } else {
        setError('Erro ao carregar usuários')
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários',
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }

  // Invalidar cache
  const invalidateCache = () => {
    userCache.delete(cacheKey)
    if (isAdmin) {
      // Se for admin, limpar todos os caches relacionados
      userCache.clear()
    }
  }

  // Hook de efeito otimizado
  useEffect(() => {
    if (currentUserProfile) {
      fetchUsers()
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [currentUserProfile?.id, isAdmin])

  // Funções CRUD otimizadas
  const createUser = async (userData: {
    email: string
    password: string
    full_name: string
    role?: 'admin' | 'editor' | 'viewer'
    avatar_url?: string
  }) => {
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem criar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      setLoading(true)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { full_name: userData.full_name }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Usuário não criado')

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'viewer',
          status: 'pending',
          avatar_url: userData.avatar_url || null,
        })

      if (profileError) throw profileError

      toast({
        title: 'Sucesso',
        description: `Usuário ${userData.full_name} criado com sucesso!`
      })

      invalidateCache()
      await fetchUsers(false) // Forçar nova busca
      return true

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o usuário',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, userData: Partial<User>) => {
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem editar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso'
      })

      invalidateCache()
      await fetchUsers(false)
      return true
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o usuário',
        variant: 'destructive'
      })
      return false
    }
  }

  const deleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem deletar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso'
      })

      invalidateCache()
      await fetchUsers(false)
      return true
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o usuário',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetUserPassword = async (userId: string, newPassword: string) => {
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem redefinir senhas',
        variant: 'destructive'
      })
      return false
    }

    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId, newPassword }
      })

      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao redefinir senha')
      }

      toast({
        title: 'Sucesso',
        description: 'Senha redefinida com sucesso'
      })

      return true
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível redefinir a senha',
        variant: 'destructive'
      })
      return false
    }
  }

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    refetch: () => fetchUsers(false),
    invalidateCache,
    isAdmin
  }
}