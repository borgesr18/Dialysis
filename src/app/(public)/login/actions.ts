'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Informe e-mail e senha.'));
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'E-mail ou senha incorretos.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Confirme seu e-mail antes de fazer login.';
    } else if (error.message.includes('Too many requests')) {
      errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
    }
    
    redirect('/login?error=' + encodeURIComponent(errorMessage));
  }

  if (data.user) {
    // Verificar se o usuário tem vínculo com alguma clínica
    const { data: vinculo } = await supabase
      .from('usuarios_clinicas')
      .select('clinica_id')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!vinculo?.clinica_id) {
      redirect('/onboarding');
    }
  }

  // Sucesso: redireciona para a página solicitada ou dashboard
  redirect(next);
}

export async function signUpWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const nome = String(formData.get('nome') ?? '').trim();

  if (!email || !password || !nome) {
    redirect('/register?error=' + encodeURIComponent('Preencha todos os campos obrigatórios.'));
  }

  if (password.length < 8) {
    redirect('/register?error=' + encodeURIComponent('A senha deve ter pelo menos 8 caracteres.'));
  }

  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent('As senhas não coincidem.'));
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nome,
      },
    },
  });

  if (error) {
    let errorMessage = 'Erro ao criar conta. Tente novamente.';
    
    if (error.message.includes('User already registered')) {
      errorMessage = 'Este e-mail já está cadastrado.';
    } else if (error.message.includes('Password should be at least')) {
      errorMessage = 'A senha deve ter pelo menos 8 caracteres.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'E-mail inválido.';
    }
    
    redirect('/register?error=' + encodeURIComponent(errorMessage));
  }

  if (data.user && !data.session) {
    redirect('/login?message=' + encodeURIComponent('Verifique seu e-mail para confirmar a conta.'));
  }

  // Se o usuário foi criado e já está logado, redirecionar para onboarding
  redirect('/onboarding');
}
