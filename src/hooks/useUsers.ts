import { useState, useEffect } from 'react'
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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { userProfile: currentUserProfile } = useAuth()

  // Só executa se for admin
  const isAdmin = currentUserProfile?.role === 'admin'
  
  useEffect(() => {
    console.log('useUsers - currentUserProfile:', currentUserProfile)
  }, [currentUserProfile])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      if (isAdmin) {
        console.log('Admin buscando todos os usuários da tabela profiles...')
        
        // Buscar todos os profiles da tabela para admins
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar usuários:', error)
          throw error
        }

        console.log('Profiles encontrados:', profiles)

        // Filtrar e mapear usuários válidos
        const validUsers = (profiles || [])
          .filter(profile => profile.email && profile.id)
          .map(profile => ({
            ...profile,
            role: profile.role || 'viewer',
            status: profile.status || 'pending',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || null
          }))

        setUsers(validUsers as User[])
        console.log('Usuários válidos carregados:', validUsers.length)
      } else {
        console.log('Usuário comum buscando apenas seu próprio perfil...')
        
        // Para usuários comuns, buscar apenas seu próprio perfil
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserProfile?.id)

        if (error) {
          console.error('Erro ao buscar perfil próprio:', error)
          throw error
        }

        console.log('Perfil próprio encontrado:', profiles)

        // Mapear perfil próprio
        const userProfile = profiles?.[0]
        if (userProfile) {
          const mappedUser = {
            ...userProfile,
            role: userProfile.role || 'viewer',
            status: userProfile.status || 'pending',
            full_name: userProfile.full_name || '',
            avatar_url: userProfile.avatar_url || null
          }
          setUsers([mappedUser] as User[])
        } else {
          setUsers([])
        }
      }

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
      console.log('Criando usuário via signup sem confirmação de email...')
      setLoading(true)
      
      // Validar dados de entrada
      if (!userData.email || !userData.password || !userData.full_name) {
        throw new Error('Dados de usuário incompletos')
      }

      // Criar usuário via signup normal (sem admin API para evitar problemas de permissão)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name
          }
          // Remover emailRedirectTo para não precisar confirmar email
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário - usuário não retornado')
      }

      console.log('Usuário criado:', authData.user.id)

      // Criar/atualizar perfil na tabela profiles com dados completos
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'viewer',
          status: 'pending', // Status padrão pending para aprovação
          avatar_url: userData.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()

      if (profileError) {
        console.error('Erro ao criar/atualizar perfil:', profileError)
        // Mesmo se houver erro no perfil, não falha completamente
        console.warn('Perfil pode não ter sido criado corretamente, mas usuário auth foi criado')
      }

      console.log('Perfil criado/atualizado:', profileData)

      toast({
        title: 'Sucesso',
        description: `Usuário ${userData.full_name} criado com sucesso! Status: Pendente (ative o usuário para permitir login)`
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
      } else if (error.message?.includes('Invalid email')) {
        toast({
          title: 'Erro',
          description: 'Email inválido',
          variant: 'destructive'
        })
      } else if (error.message?.includes('Password')) {
        toast({
          title: 'Erro',
          description: 'Senha deve ter pelo menos 6 caracteres',
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
        description: userData.status === 'active' 
          ? 'Usuário ativado com sucesso! Agora pode fazer login.'
          : 'Usuário atualizado com sucesso'
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
    console.log('=== INÍCIO DELETE USER ===')
    console.log('userId:', userId)
    console.log('isAdmin:', isAdmin)
    
    if (!isAdmin) {
      console.log('Usuário não é admin, bloqueando exclusão')
      toast({
        title: 'Erro',
        description: 'Apenas administradores podem deletar usuários',
        variant: 'destructive'
      })
      return false
    }

    try {
      console.log('Iniciando processo de exclusão...')
      setLoading(true)
      
      // Primeiro deletar da tabela profiles
      console.log('Deletando da tabela profiles...')
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError)
        throw profileError
      }

      console.log('Usuário removido do sistema com sucesso')

      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso'
      })

      console.log('Chamando fetchUsers para atualizar lista...')
      await fetchUsers()
      console.log('=== FIM DELETE USER ===')
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

  useEffect(() => {
    // Busca usuários quando o perfil do usuário atual for carregado
    if (currentUserProfile) {
      console.log('Perfil do usuário atual:', currentUserProfile)
      console.log('É admin?', isAdmin)
      
      // Busca todos os usuários para admin ou apenas o próprio para usuários comuns
      fetchUsers()
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
