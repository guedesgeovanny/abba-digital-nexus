
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
  const supabase = createClient()

  // Extrair dados do formulário
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // Validações básicas
  if (!email || !password || !fullName) {
    return redirect('/signup?error=Por favor, preencha todos os campos.')
  }

  if (password.length < 6) {
    return redirect('/signup?error=A senha deve ter pelo menos 6 caracteres.')
  }

  try {
    // Passo 1: Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
    }

    if (!authData.user) {
      return redirect('/signup?error=Erro ao criar usuário. Tente novamente.')
    }

    // Passo 2: Inserir dados na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        role: 'viewer',
        status: 'active'
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Se houver erro no perfil, ainda redireciona para login pois o usuário foi criado
      return redirect('/login?message=Usuário criado, mas houve um problema no perfil. Tente fazer login.')
    }

    // Passo 3: Sucesso - redirecionar para login
    return redirect('/login?message=Cadastro realizado com sucesso! Faça o login.')

  } catch (error) {
    console.error('Erro inesperado:', error)
    return redirect('/signup?error=Erro interno do servidor. Tente novamente.')
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()

  // Extrair dados do formulário
  const fullName = formData.get('fullName') as string
  const avatarUrl = formData.get('avatarUrl') as string
  const role = formData.get('role') as string
  const status = formData.get('status') as string

  try {
    // Passo 1: Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Usuário não autorizado. Faça login novamente.' }
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
      return { error: 'Erro ao atualizar perfil. Tente novamente.' }
    }

    // Passo 3: Revalidar dados e retornar sucesso
    revalidatePath('/dashboard/settings')
    return { success: 'Perfil atualizado com sucesso!' }

  } catch (error) {
    console.error('Erro inesperado ao atualizar perfil:', error)
    return { error: 'Erro interno do servidor. Tente novamente.' }
  }
}
