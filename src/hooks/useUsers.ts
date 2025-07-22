import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useUserProfile } from './useUserProfile'

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
  const { profile: currentUserProfile } = useUserProfile()

  // Só executa se for admin
  const isAdmin = currentUserProfile?.role === 'admin'

  const fetchUsers = async () => {
    // Só busca usuários se for admin
    if (!isAdmin) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Admin buscando todos os usuários da tabela profiles...')
      
      // Buscar todos os profiles da tabela, incluindo usuários não confirmados
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        throw error
      }

      console.log('Profiles encontrados na tabela:', profiles)
      console.log('Total de usuários encontrados:', profiles?.length || 0)

      // Garantir que temos um array válido
      const validProfiles = profiles || []
      
      setUsers(validProfiles as User[])
      console.log('Usuários definidos no state:', validProfiles.length)
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
      setUsers([])
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
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem criar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      console.log('Admin criando novo usuário:', userData)
      setLoading(true)
      
      // Validar dados de entrada
      if (!userData.email || !userData.password || !userData.full_name) {
        console.error('Dados de usuário incompletos:', userData)
        throw new Error('Dados de usuário incompletos')
      }

      console.log('Tentando criar usuário com admin API...')
      
      // Criar usuário com admin API - SEM confirmação de email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirma email automaticamente
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário com admin API:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário - usuário não retornado')
      }

      console.log('Usuário criado no auth:', authData.user.id)

      // Criar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'viewer',
          status: 'pending', // Status padrão pending para admin aprovar
          avatar_url: userData.avatar_url || null
        })
        .select()
        .single()

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        throw profileError
      }

      console.log('Perfil criado com sucesso:', profileData)

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso! Status: Pendente (ative o usuário para permitir login)'
      })

      await fetchUsers()
      return true

    } catch (error: any) {
      console.error('Erro detalhado ao criar usuário:', error)
      
      // Tratamento específico para erros comuns
      if (error.message?.includes('duplicate key') || error.message?.includes('already registered')) {
        toast({
          title: 'Erro',
          description: 'Este email já está em uso',
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
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, userData: {
    full_name?: string
    role?: 'admin' | 'editor' | 'viewer'
    status?: 'active' | 'pending' | 'inactive'
    avatar_url?: string
  }) => {
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem editar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      console.log('Admin atualizando usuário:', userId, userData)
      
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
    if (!isAdmin) {
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem deletar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      console.log('Admin deletando usuário:', userId)
      
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
    // Só busca usuários quando o perfil do usuário atual for carregado e for admin
    if (currentUserProfile) {
      console.log('Perfil do usuário atual carregado:', currentUserProfile)
      console.log('É admin?', isAdmin)
      
      if (isAdmin) {
        fetchUsers()
      } else {
        setLoading(false)
        console.log('Usuário não é admin, não buscando lista de usuários')
      }
    }
  }, [currentUserProfile, isAdmin])

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
    isAdmin
  }
}
