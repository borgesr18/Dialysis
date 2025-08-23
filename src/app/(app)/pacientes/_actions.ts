'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validação para dados do paciente
const pacienteSchema = z.object({
  registro: z.string().min(1, 'Registro é obrigatório'),
  nome_completo: z.string().min(1, 'Nome completo é obrigatório'),
  cidade_nome: z.string().optional(),
  alerta_texto: z.string().optional(),
  ativo: z.boolean().default(true),
});

function enc(msg: string) {
  return encodeURIComponent(msg);
}

// Normaliza e valida dados vindos do FormData
function parsePacienteForm(fd: FormData) {
  try {
    const rawData = {
      registro: String(fd.get('registro') ?? '').trim(),
      nome_completo: String(fd.get('nome_completo') ?? '').trim(),
      cidade_nome: fd.get('cidade_nome') ? String(fd.get('cidade_nome')).trim() : undefined,
      alerta_texto: fd.get('alerta_texto') ? String(fd.get('alerta_texto')).trim() : undefined,
      ativo: (fd.get('ativo') ?? 'true') === 'true',
    };

    return pacienteSchema.parse(rawData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ');
      throw new Error(`Dados inválidos: ${messages}`);
    }
    throw error;
  }
}

export async function createPaciente(fd: FormData) {
  let pacienteData;
  try {
    pacienteData = parsePacienteForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/pacientes/new?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data, error } = await supabase
    .from('pacientes')
    .insert({
      clinica_id,
      ...pacienteData!,
      alerta_texto: pacienteData!.alerta_texto || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao criar paciente:', error);

    let errorMessage = 'Falha ao salvar paciente';
    if (error.code === '23505') {
      errorMessage = 'Já existe um paciente com este registro nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/pacientes/new?error=${enc(errorMessage)}`);
  }

  if (!data?.id) {
    redirect(`/pacientes/new?error=${enc('Falha ao criar paciente: ID não retornado')}`);
  }

  revalidatePath('/pacientes');
  redirect(`/pacientes/${data!.id}?ok=${enc('Paciente criado com sucesso!')}`);
}

export async function updatePaciente(id: string, fd: FormData) {
  if (!id || typeof id !== 'string') {
    redirect(`/pacientes?error=${enc('ID do paciente é obrigatório')}`);
  }

  let pacienteData;
  try {
    pacienteData = parsePacienteForm(fd);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno do servidor';
    redirect(`/pacientes/${id}/edit?error=${enc(errorMessage)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingPatient, error: checkError } = await supabase
    .from('pacientes')
    .select('id')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingPatient) {
    console.error('❌ Paciente não encontrado ou sem acesso:', checkError);
    redirect(`/pacientes?error=${enc('Paciente não encontrado ou sem permissão de acesso')}`);
  }

  const { error } = await supabase
    .from('pacientes')
    .update({
      ...pacienteData!,
      alerta_texto: pacienteData!.alerta_texto || null,
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao atualizar paciente:', error);

    let errorMessage = 'Falha ao atualizar paciente';
    if (error.code === '23505') {
      errorMessage = 'Já existe um paciente com este registro nesta clínica';
    } else if (error.code === '23503') {
      errorMessage = 'Dados de referência inválidos';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/pacientes/${id}/edit?error=${enc(errorMessage)}`);
  }

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${id}`);
  redirect(`/pacientes/${id}?ok=${enc('Paciente atualizado com sucesso!')}`);
}

export async function deletePaciente(id: string) {
  if (!id || typeof id !== 'string') {
    redirect(`/pacientes?error=${enc('ID do paciente é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { data: existingPatient, error: checkError } = await supabase
    .from('pacientes')
    .select('id, nome_completo')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (checkError || !existingPatient) {
    console.error('❌ Paciente não encontrado ou sem acesso:', checkError);
    redirect(`/pacientes?error=${enc('Paciente não encontrado ou sem permissão de acesso')}`);
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessoes_hemodialise')
    .select('id')
    .eq('paciente_id', id)
    .limit(1);

  if (sessionsError) {
    console.error('❌ Erro ao verificar dependências:', sessionsError);
    redirect(`/pacientes/${id}?error=${enc('Erro ao verificar dependências do paciente')}`);
  }

  if (sessions && sessions.length > 0) {
    redirect(`/pacientes/${id}?error=${enc('Não é possível excluir paciente com sessões registradas')}`);
  }

  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao excluir paciente:', error);

    let errorMessage = 'Falha ao excluir paciente';
    if (error.code === '23503') {
      errorMessage = 'Não é possível excluir paciente com registros relacionados';
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`;
    }

    redirect(`/pacientes/${id}?error=${enc(errorMessage)}`);
  }

  revalidatePath('/pacientes');
  redirect(`/pacientes?ok=${enc(`Paciente "${existingPatient!.nome_completo}" excluído com sucesso!`)}`);
}

