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
        role: (profile as any).role || 'viewer',
        status: (profile as any).status || 'active'
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
    avatar_url?: string
  }) => {
    try {
      // Registrar usuário usando signup normal (não admin)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role || 'viewer'
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário')
      }

      // Por enquanto, salvar avatar_url como está (sem upload para Storage)
      let avatarUrl = userData.avatar_url || null

      // Criar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role || 'viewer',
            status: 'active',
            avatar_url: avatarUrl
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
    avatar_url?: string
  }) => {
    try {
      // Por enquanto, salvar avatar_url como está (sem upload para Storage)
      let avatarUrl = userData.avatar_url

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (userData.full_name !== undefined) updateData.full_name = userData.full_name
      if (userData.role !== undefined) updateData.role = userData.role
      if (userData.status !== undefined) updateData.status = userData.status
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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

      // Nota: Não é possível deletar usuário do Auth sem permissões admin
      // Em produção, isso seria feito via função Edge ou RLS policy

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