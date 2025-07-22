import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Buscando usuários da tabela profiles...')
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        throw error
      }

      console.log('Profiles encontrados:', profiles)
      setUsers(profiles as User[])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: {
    email: string
    password: string
    full_name: string
    role?: 'admin' | 'editor' | 'viewer'
    avatar_url?: string
  }) => {
    try {
      console.log('Criando usuário:', userData)
      
      // Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário no auth:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      console.log('Usuário criado no auth:', authData.user)

      // Criar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'viewer',
          status: 'active',
          avatar_url: userData.avatar_url || null
        })
        .select()
        .single()

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        throw profileError
      }

      console.log('Usuário e perfil criados:', { authData, profileData })

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso'
      })

      await fetchUsers()
      return true
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      
      // Tratamento específico para erros comuns
      if (error.message?.includes('duplicate key')) {
        toast({
          title: 'Erro',
          description: 'Este email já está em uso',
          variant: 'destructive'
        })
      } else if (error.message?.includes('admin')) {
        toast({
          title: 'Erro',
          description: 'Você precisa de privilégios de administrador para criar usuários',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Erro',
          description: error.message || 'Não foi possível criar o usuário',
          variant: 'destructive'
        })
      }
      return false
    }
  }

  const updateUser = async (userId: string, userData: {
    full_name?: string
    role?: 'admin' | 'editor' | 'viewer'
    status?: 'active' | 'pending' | 'inactive'
    avatar_url?: string
  }) => {
    try {
      console.log('Atualizando usuário:', userId, userData)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Erro ao atualizar:', error)
        throw error
      }

      console.log('Usuário atualizado:', data)

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso'
      })

      await fetchUsers()
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
    try {
      console.log('Deletando usuário:', userId)
      
      // Primeiro deletar da tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError)
        throw profileError
      }

      // Tentar deletar do auth (admin function)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) {
          console.warn('Aviso ao deletar do auth:', authError)
        }
      } catch (authError) {
        console.warn('Não foi possível deletar do auth (requer privilégios admin):', authError)
      }

      console.log('Usuário deletado com sucesso')

      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso'
      })

      await fetchUsers()
      return true
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o usuário',
        variant: 'destructive'
      })
      return false
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  }
}
