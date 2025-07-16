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
  // Preparado para futuras implementações de permissões
  role?: 'admin' | 'editor' | 'viewer'
  status?: 'active' | 'pending' | 'inactive'
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Buscar usuários da tabela profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Mapear dados garantindo que role e status tenham valores padrão
      const usersWithDefaults = profiles?.map(profile => ({
        ...profile,
        role: ((profile as any).role as 'admin' | 'editor' | 'viewer') || 'viewer',
        status: ((profile as any).status as 'active' | 'pending' | 'inactive') || 'active'
      })) || []

      setUsers(usersWithDefaults)
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
  }) => {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) {
        throw authError
      }

      // Criar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role || 'viewer',
            status: 'active'
          }
        ])
        .select()
        .single()

      if (profileError) {
        throw profileError
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso',
      })

      await fetchUsers() // Atualizar lista
      return true
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o usuário',
        variant: 'destructive'
      })
      return false
    }
  }

  const updateUser = async (userId: string, userData: {
    full_name?: string
    role?: 'admin' | 'editor' | 'viewer'
    status?: 'active' | 'pending' | 'inactive'
  }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          status: userData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      })

      await fetchUsers() // Atualizar lista
      return true
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário',
        variant: 'destructive'
      })
      return false
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

      // Deletar usuário do Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        throw authError
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      })

      await fetchUsers() // Atualizar lista
      return true
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o usuário',
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