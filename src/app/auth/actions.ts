'use server'

import { supabase } from '@/integrations/supabase/client'

export async function signup(formData: FormData) {
  // Extrair dados do formulário
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // Validações básicas
  if (!email || !password || !fullName) {
    throw new Error('Por favor, preencha todos os campos.')
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }

  try {
    // Passo 1: Criar usuário no Auth sem confirmação de email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined // Remove redirect para não precisar confirmar
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário. Tente novamente.')
    }

    // Passo 2: Inserir dados na tabela profiles com status pending
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        role: 'viewer',
        status: 'pending' // Status pending para admin aprovar
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      throw new Error('Erro ao criar perfil. Tente novamente.')
    }

    return { success: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para fazer login.' }

  } catch (error) {
    console.error('Erro inesperado:', error)
    throw error
  }
}

export async function updateProfile(formData: FormData) {
  // Extrair dados do formulário
  const fullName = formData.get('fullName') as string
  const avatarUrl = formData.get('avatarUrl') as string
  const role = formData.get('role') as string
  const status = formData.get('status') as string

  try {
    // Passo 1: Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Usuário não autorizado. Faça login novamente.')
    }

    // Passo 2: Atualizar perfil na tabela profiles
    const updateData: any = {}
    
    if (fullName) updateData.full_name = fullName
    if (avatarUrl) updateData.avatar_url = avatarUrl
    if (role) updateData.role = role
    if (status) updateData.status = status

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      throw new Error('Erro ao atualizar perfil. Tente novamente.')
    }

    return { success: 'Perfil atualizado com sucesso!' }

  } catch (error) {
    console.error('Erro inesperado ao atualizar perfil:', error)
    throw error
  }
}
