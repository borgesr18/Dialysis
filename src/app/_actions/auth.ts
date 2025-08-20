'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        nome_completo: formData.get('nome_completo') as string,
        nome_clinica: formData.get('nome_clinica') as string,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    throw new Error(error.message)
  }

  if (authData.user) {
    // Criar clínica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .insert({
        nome: data.options.data.nome_clinica
      })
      .select()
      .single()

    if (clinicaError) {
      throw new Error('Erro ao criar clínica: ' + clinicaError.message)
    }

    // Criar perfil do usuário
    const { error: perfilError } = await supabase
      .from('perfis_usuarios')
      .insert({
        id: authData.user.id,
        nome: data.options.data.nome_completo,
        papel: 'ADMIN'
      })

    if (perfilError) {
      throw new Error('Erro ao criar perfil: ' + perfilError.message)
    }

    // Associar usuário à clínica
    const { error: associacaoError } = await supabase
      .from('usuarios_clinicas')
      .insert({
        user_id: authData.user.id,
        clinica_id: clinica.id
      })

    if (associacaoError) {
      throw new Error('Erro ao associar usuário à clínica: ' + associacaoError.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserClinica() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: usuarioClinica } = await supabase
    .from('usuarios_clinicas')
    .select(`
      clinica_id,
      clinicas (
        id,
        nome
      )
    `)
    .eq('user_id', user.id)
    .single()

  return usuarioClinica
}