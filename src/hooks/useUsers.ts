
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
      console.log('Buscando usuários...')
      
      // Buscar usuários da tabela profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        throw error
      }

      console.log('Profiles encontrados:', profiles)

      // Mapear dados com type assertion para role e status
      const usersWithDefaults = profiles?.map(profile => ({
        ...profile,
        role: (profile as any).role || 'viewer',
        status: (profile as any).status || 'active'
      })) || []

      console.log('Usuários mapeados:', usersWithDefaults)
      setUsers(usersWithDefaults as User[])
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
        console.error('Erro auth:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário')
      }

      console.log('Usuário criado no Auth:', authData.user)

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
        console.error('Erro ao criar perfil:', profileError)
        throw profileError
      }

      console.log('Perfil criado:', profileData)

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
      console.log('Atualizando usuário:', userId, userData)
      
      // Por enquanto, salvar avatar_url como está (sem upload para Storage)
      let avatarUrl = userData.avatar_url

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (userData.full_name !== undefined) updateData.full_name = userData.full_name
      if (userData.role !== undefined) updateData.role = userData.role
      if (userData.status !== undefined) updateData.status = userData.status
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl

      console.log('Dados para atualização:', updateData)

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Erro ao atualizar no banco:', error)
        throw error
      }

      console.log('Usuário atualizado com sucesso:', data)

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
        description: `Não foi possível atualizar o usuário: ${error.message}`,
        variant: 'destructive'
      })
      return false
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      console.log('Deletando usuário:', userId)
      
      // Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError)
        throw profileError
      }

      console.log('Usuário deletado com sucesso')

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
