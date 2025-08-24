'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validação para dados da sala
const salaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

function enc(msg: string) {
  return encodeURIComponent(msg);
}

// Normaliza e valida dados vindos do FormData
function parseSalaForm(fd: FormData) {
  try {
    const rawData = {
      nome: String(fd.get('nome') ?? '').trim(),
      descricao: fd.get('descricao') ? String(fd.get('descricao')).trim() : undefined,
    };

    return salaSchema.parse(rawData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ');
      throw new Error(`Dados inválidos: ${messages}`);
    }
    throw error;
  }
}

export async function createSala(fd: FormData) {
  let salaData;
  try {
    salaData = parseSalaForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/salas/new?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data, error } = await supabase
    .from('salas')
    .insert({
      clinica_id,
      ...salaData!,
      descricao: salaData!.descricao || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao criar sala:', error);

    let errorMessage = 'Falha ao salvar sala';
    if (error.code === '23505') {
      errorMessage = 'Já existe uma sala com este nome nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/salas/new?error=${enc(errorMessage)}`);
  }

  if (!data?.id) {
    redirect(`/salas/new?error=${enc('Falha ao criar sala: ID não retornado')}`);
  }

  revalidatePath('/salas');
  redirect(`/salas?ok=${enc('Sala criada com sucesso!')}`);
}

export async function updateSala(id: string, fd: FormData) {
  if (!id || typeof id !== 'string') {
    redirect(`/salas?error=${enc('ID da sala é obrigatório')}`);
  }

  let salaData;
  try {
    salaData = parseSalaForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/salas/${id}/edit?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingSala, error: checkError } = await supabase
    .from('salas')
    .select('id')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingSala) {
    console.error('❌ Sala não encontrada ou sem acesso:', checkError);
    redirect(`/salas?error=${enc('Sala não encontrada ou sem permissão de acesso')}`);
  }

  const { error } = await supabase
    .from('salas')
    .update({
      ...salaData!,
      descricao: salaData!.descricao || null,
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao atualizar sala:', error);

    let errorMessage = 'Falha ao atualizar sala';
    if (error.code === '23505') {
      errorMessage = 'Já existe uma sala com este nome nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/salas/${id}/edit?error=${enc(errorMessage)}`);
  }

  revalidatePath('/salas');
  redirect(`/salas?ok=${enc('Sala atualizada com sucesso!')}`);
}

export async function deleteSala(id: string) {
  if (!id || typeof id !== 'string') {
    redirect(`/salas?error=${enc('ID da sala é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingSala, error: checkError } = await supabase
    .from('salas')
    .select('id, nome')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingSala) {
    console.error('❌ Sala não encontrada ou sem acesso:', checkError);
    redirect(`/salas?error=${enc('Sala não encontrada ou sem permissão de acesso')}`);
  }

  // Verificar se há máquinas associadas
  const { data: machines, error: machinesError } = await supabase
    .from('maquinas')
    .select('id')
    .eq('sala_id', id)
    .limit(1);

  if (machinesError) {
    console.error('❌ Erro ao verificar dependências:', machinesError);
    redirect(`/salas?error=${enc('Erro ao verificar dependências da sala')}`);
  }

  if (machines && machines.length > 0) {
    redirect(`/salas?error=${enc('Não é possível excluir sala com máquinas associadas')}`);
  }

  const { error } = await supabase
    .from('salas')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao excluir sala:', error);

    let errorMessage = 'Falha ao excluir sala';
    if (error.code === '23503') {
      errorMessage = 'Não é possível excluir sala com registros relacionados';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/salas?error=${enc(errorMessage)}`);
  }

  revalidatePath('/salas');
  redirect(`/salas?ok=${enc('Sala excluída com sucesso!')}`);
}