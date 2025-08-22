'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient, isAdminClientConfigured } from '@/lib/supabase-admin';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { z } from 'zod';

// Schema de validação para papel do usuário
const papelSchema = z.enum(['ADMIN', 'GESTOR', 'ENFERMAGEM', 'TECNICO', 'FARMACIA', 'MEDICO', 'VISUALIZADOR']);

// Schema de validação para email
const emailSchema = z.string().email('Email inválido').toLowerCase();

function enc(msg: string) {
  return encodeURIComponent(msg);
}

export async function linkExistingUserByEmail(formData: FormData) {
  try {
    // Verificar se o cliente admin está configurado
    if (!isAdminClientConfigured()) {
      redirect(`/admin/membros?error=${enc('Configuração de administrador não encontrada. Verifique as variáveis de ambiente.')}`);
    }

    const supabase = createClient();
    const admin = createAdminClient();
    const clinica_id = await requireCurrentClinicId();

    // Validar dados do formulário
    const rawEmail = String(formData.get('email') || '').trim();
    const rawPapel = String(formData.get('papel') || 'VISUALIZADOR');

    const email = emailSchema.parse(rawEmail);
    const papel = papelSchema.parse(rawPapel);

    // Buscar usuário por email
    let userId: string | null = null;
    let page = 1;
    const maxPages = 5; // Limitar busca para evitar loops infinitos

    while (page <= maxPages && !userId) {
      try {
        const { data, error } = await admin.auth.admin.listUsers({ 
          page, 
          perPage: 100 
        });

        if (error) {
          console.error(`❌ Erro ao listar usuários (página ${page}):`, error);
          break;
        }

        const foundUser = data.users.find(u => u.email?.toLowerCase() === email);
        if (foundUser) {
          userId = foundUser.id;
          break;
        }

        page++;
      } catch (error) {
        console.error(`❌ Erro na busca de usuários (página ${page}):`, error);
        break;
      }
    }

    if (!userId) {
      redirect(`/admin/membros?error=${enc('Usuário não encontrado. Envie um convite primeiro.')}`);
    }

    // Verificar se o usuário já está vinculado à clínica
    const { data: existingLink } = await supabase
      .from('usuarios_clinicas')
      .select('id')
      .eq('user_id', userId)
      .eq('clinica_id', clinica_id)
      .single();

    if (existingLink) {
      redirect(`/admin/membros?error=${enc('Usuário já está vinculado a esta clínica.')}`);
    }

    // Criar/atualizar perfil do usuário
    const { error: upsertErr } = await supabase
      .from('perfis_usuarios')
      .upsert({ id: userId, papel }, { onConflict: 'id' });

    if (upsertErr) {
      console.error('❌ Erro ao criar/atualizar perfil:', upsertErr);
      redirect(`/admin/membros?error=${enc(`Erro ao definir papel: ${upsertErr.message}`)}`);
    }

    // Vincular usuário à clínica
    const { error: linkErr } = await supabase
      .from('usuarios_clinicas')
      .insert({ 
        user_id: userId, 
        clinica_id,
        role: 'user' // Papel padrão na tabela usuarios_clinicas
      });

    if (linkErr) {
      console.error('❌ Erro ao vincular usuário:', linkErr);
      
      let errorMessage = 'Erro ao vincular usuário à clínica';
      if (linkErr.code === '23505') {
        errorMessage = 'Usuário já está vinculado a esta clínica';
      } else if (linkErr.message) {
        errorMessage = linkErr.message;
      }
      
      redirect(`/admin/membros?error=${enc(errorMessage)}`);
    }

    revalidatePath('/admin/membros');
    redirect(`/admin/membros?ok=${enc('Usuário vinculado com sucesso!')}`);
  } catch (error) {
    console.error('❌ Erro na ação linkExistingUserByEmail:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(err => err.message).join(', ');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    redirect(`/admin/membros?error=${enc(errorMessage)}`);
  }
}

export async function updateUserRole(formData: FormData) {
  try {
    const supabase = createClient();
    await requireCurrentClinicId(); // Verificar se tem acesso

    // Validar dados do formulário
    const userId = String(formData.get('user_id') || '').trim();
    const rawPapel = String(formData.get('papel') || 'VISUALIZADOR');

    if (!userId) {
      redirect(`/admin/membros?error=${enc('ID do usuário é obrigatório.')}`);
    }

    const papel = papelSchema.parse(rawPapel);

    // Verificar se o usuário existe
    const { data: existingProfile } = await supabase
      .from('perfis_usuarios')
      .select('id')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('perfis_usuarios')
      .upsert({ id: userId, papel }, { onConflict: 'id' });

    if (error) {
      console.error('❌ Erro ao atualizar papel:', error);
      redirect(`/admin/membros?error=${enc(`Erro ao atualizar papel: ${error.message}`)}`);
    }

    revalidatePath('/admin/membros');
    redirect(`/admin/membros?ok=${enc('Papel atualizado com sucesso!')}`);
  } catch (error) {
    console.error('❌ Erro na ação updateUserRole:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(err => err.message).join(', ');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    redirect(`/admin/membros?error=${enc(errorMessage)}`);
  }
}

export async function removeMember(formData: FormData) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();

    const userId = String(formData.get('user_id') || '').trim();

    if (!userId) {
      redirect(`/admin/membros?error=${enc('ID do usuário é obrigatório.')}`);
    }

    // Verificar se o vínculo existe
    const { data: existingLink } = await supabase
      .from('usuarios_clinicas')
      .select('id')
      .eq('clinica_id', clinica_id)
      .eq('user_id', userId)
      .single();

    if (!existingLink) {
      redirect(`/admin/membros?error=${enc('Usuário não está vinculado a esta clínica.')}`);
    }

    const { error } = await supabase
      .from('usuarios_clinicas')
      .delete()
      .eq('clinica_id', clinica_id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao remover membro:', error);
      redirect(`/admin/membros?error=${enc(`Erro ao remover membro: ${error.message}`)}`);
    }

    revalidatePath('/admin/membros');
    redirect(`/admin/membros?ok=${enc('Membro removido da clínica com sucesso!')}`);
  } catch (error) {
    console.error('❌ Erro na ação removeMember:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro interno do servidor';
    
    redirect(`/admin/membros?error=${enc(errorMessage)}`);
  }
}

export async function inviteUser(formData: FormData) {
  try {
    // Verificar se o cliente admin está configurado
    if (!isAdminClientConfigured()) {
      redirect(`/admin/membros?error=${enc('Configuração de administrador não encontrada. Verifique as variáveis de ambiente.')}`);
    }

    const admin = createAdminClient();
    await requireCurrentClinicId(); // Verificar se tem acesso

    // Validar email
    const rawEmail = String(formData.get('email') || '').trim();
    const email = emailSchema.parse(rawEmail);

    // Definir URL de redirecionamento
    const redirectTo = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      : undefined;

    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        invited_by: 'admin', // Metadados adicionais se necessário
      }
    });

    if (error) {
      console.error('❌ Erro ao enviar convite:', error);
      
      let errorMessage = 'Erro ao enviar convite';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está registrado. Use a opção "Vincular Usuário Existente".';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      redirect(`/admin/membros?error=${enc(errorMessage)}`);
    }

    revalidatePath('/admin/membros');
    redirect(`/admin/membros?ok=${enc('Convite enviado por email com sucesso!')}`);
  } catch (error) {
    console.error('❌ Erro na ação inviteUser:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(err => err.message).join(', ');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    redirect(`/admin/membros?error=${enc(errorMessage)}`);
  }
}

