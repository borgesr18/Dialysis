'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validação para dados do turno
const turnoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  hora_inicio: z.string().min(1, 'Hora de início é obrigatória'),
  hora_fim: z.string().min(1, 'Hora de fim é obrigatória'),
  dias_semana: z.array(z.number()).min(1, 'Pelo menos um dia da semana deve ser selecionado'),
});

function enc(msg: string) {
  return encodeURIComponent(msg);
}

// Normaliza e valida dados vindos do FormData
function parseTurnoForm(fd: FormData) {
  try {
    const rawData = {
      nome: String(fd.get('nome') ?? '').trim(),
      hora_inicio: String(fd.get('hora_inicio') ?? '').trim(),
      hora_fim: String(fd.get('hora_fim') ?? '').trim(),
      dias_semana: fd.getAll('dias_semana').map(day => parseInt(String(day))),
    };

    return turnoSchema.parse(rawData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ');
      throw new Error(`Dados inválidos: ${messages}`);
    }
    throw error;
  }
}

export async function createTurno(fd: FormData) {
  let turnoData;
  try {
    turnoData = parseTurnoForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/turnos/new?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data, error } = await supabase
    .from('turnos')
    .insert({
      clinica_id,
      ...turnoData!,
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao criar turno:', error);

    let errorMessage = 'Falha ao salvar turno';
    if (error.code === '23505') {
      errorMessage = 'Já existe um turno com este nome nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/turnos/new?error=${enc(errorMessage)}`);
  }

  if (!data?.id) {
    redirect(`/turnos/new?error=${enc('Falha ao criar turno: ID não retornado')}`);
  }

  revalidatePath('/turnos');
  redirect(`/turnos?ok=${enc('Turno criado com sucesso!')}`);
}

export async function updateTurno(id: string, fd: FormData) {
  if (!id || typeof id !== 'string') {
    redirect(`/turnos?error=${enc('ID do turno é obrigatório')}`);
  }

  let turnoData;
  try {
    turnoData = parseTurnoForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/turnos/${id}/edit?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingTurno, error: checkError } = await supabase
    .from('turnos')
    .select('id')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingTurno) {
    console.error('❌ Turno não encontrado ou sem acesso:', checkError);
    redirect(`/turnos?error=${enc('Turno não encontrado ou sem permissão de acesso')}`);
  }

  const { error } = await supabase
    .from('turnos')
    .update({
      ...turnoData!,
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao atualizar turno:', error);

    let errorMessage = 'Falha ao atualizar turno';
    if (error.code === '23505') {
      errorMessage = 'Já existe um turno com este nome nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/turnos/${id}/edit?error=${enc(errorMessage)}`);
  }

  revalidatePath('/turnos');
  redirect(`/turnos?ok=${enc('Turno atualizado com sucesso!')}`);
}

export async function deleteTurno(id: string) {
  if (!id || typeof id !== 'string') {
    redirect(`/turnos?error=${enc('ID do turno é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingTurno, error: checkError } = await supabase
    .from('turnos')
    .select('id, nome')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingTurno) {
    console.error('❌ Turno não encontrado ou sem acesso:', checkError);
    redirect(`/turnos?error=${enc('Turno não encontrado ou sem permissão de acesso')}`);
  }

  // Verificar se há sessões associadas
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessoes_hemodialise')
    .select('id')
    .eq('turno_id', id)
    .limit(1);

  if (sessionsError) {
    console.error('❌ Erro ao verificar dependências:', sessionsError);
    redirect(`/turnos?error=${enc('Erro ao verificar dependências do turno')}`);
  }

  if (sessions && sessions.length > 0) {
    redirect(`/turnos?error=${enc('Não é possível excluir turno com sessões associadas')}`);
  }

  const { error } = await supabase
    .from('turnos')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao excluir turno:', error);

    let errorMessage = 'Falha ao excluir turno';
    if (error.code === '23503') {
      errorMessage = 'Não é possível excluir turno com registros relacionados';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/turnos?error=${enc(errorMessage)}`);
  }

  revalidatePath('/turnos');
  redirect(`/turnos?ok=${enc('Turno excluído com sucesso!')}`);
}