'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validação para configuração da clínica
const clinicConfigSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade_nome: z.string().optional(),
  uf: z.string().max(2, 'UF deve ter 2 caracteres').optional(),
  fuso_horario: z.string().optional(),
  observacoes: z.string().optional(),
});

function enc(msg: string) {
  return encodeURIComponent(msg);
}

function val(fd: FormData, key: string): string | undefined {
  const v = String(fd.get(key) ?? '').trim();
  return v.length ? v : undefined;
}

export async function updateClinicConfig(formData: FormData) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();

    // Verificar se a clínica existe e o usuário tem acesso
    const { data: existing, error: fetchErr } = await supabase
      .from('clinicas')
      .select('*')
      .eq('id', clinica_id)
      .single();

    if (fetchErr) {
      console.error('❌ Erro ao buscar clínica:', fetchErr);
      redirect(`/admin/config?error=${enc('Erro ao buscar dados da clínica: ' + fetchErr.message)}`);
    }

    if (!existing) {
      redirect(`/admin/config?error=${enc('Clínica não encontrada ou sem permissão de acesso')}`);
    }

    // Extrair e validar dados do formulário
    const rawUpdates = {
      nome: val(formData, 'nome'),
      cnpj: val(formData, 'cnpj'),
      email: val(formData, 'email'),
      telefone: val(formData, 'telefone'),
      endereco: val(formData, 'endereco'),
      cidade_nome: val(formData, 'cidade_nome'),
      uf: val(formData, 'uf'),
      fuso_horario: val(formData, 'fuso_horario'),
      observacoes: val(formData, 'observacoes'),
    };

    // Filtrar apenas campos com valores
    const filteredUpdates = Object.fromEntries(
      Object.entries(rawUpdates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      redirect(`/admin/config?error=${enc('Nenhuma alteração para salvar')}`);
    }

    // Validar dados
    const validatedUpdates = clinicConfigSchema.parse(filteredUpdates);

    // Verificar se há campos permitidos para atualização
    const allowedKeys = Object.keys(existing);
    const payload: Record<string, string> = {};

    for (const [key, value] of Object.entries(validatedUpdates)) {
      if (value !== undefined && allowedKeys.includes(key)) {
        payload[key] = String(value);
      }
    }

    if (Object.keys(payload).length === 0) {
      redirect(`/admin/config?error=${enc('Nenhum campo válido para atualizar')}`);
    }

    // Atualizar clínica
    const { error: updateError } = await supabase
      .from('clinicas')
      .update(payload)
      .eq('id', clinica_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar clínica:', updateError);
      
      let errorMessage = 'Erro ao salvar configurações';
      
      if (updateError.code === '23505') {
        errorMessage = 'Já existe uma clínica com estes dados';
      } else if (updateError.code === '23503') {
        errorMessage = 'Dados de referência inválidos';
      } else if (updateError.message) {
        errorMessage = updateError.message;
      }
      
      redirect(`/admin/config?error=${enc(errorMessage)}`);
    }

    revalidatePath('/admin/config');
    redirect(`/admin/config?ok=${enc('Configurações salvas com sucesso!')}`);
  } catch (error) {
    console.error('❌ Erro na ação updateClinicConfig:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(err => err.message).join(', ');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    redirect(`/admin/config?error=${enc(errorMessage)}`);
  }
}
