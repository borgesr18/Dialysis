'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const maquinaSchema = z.object({
  sala_id: z.string().min(1, 'Sala é obrigatória'),
  identificador: z.string().min(1, 'Identificador é obrigatório'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  ativa: z.boolean().default(true),
});

function enc(msg: string) {
  return encodeURIComponent(msg);
}

function parseMaquinaForm(fd: FormData) {
  try {
    const raw = {
      sala_id: String(fd.get('sala_id') ?? '').trim(),
      identificador: String(fd.get('identificador') ?? '').trim(),
      marca: fd.get('marca') ? String(fd.get('marca')).trim() : undefined,
      modelo: fd.get('modelo') ? String(fd.get('modelo')).trim() : undefined,
      numero_serie: fd.get('numero_serie') ? String(fd.get('numero_serie')).trim() : undefined,
      ativa: (fd.get('ativa') ?? 'true') === 'true',
    };
    return maquinaSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new Error(`Dados inválidos: ${messages}`);
    }
    throw error;
  }
}

export async function createMaquina(fd: FormData) {
  let dataParsed;
  try {
    dataParsed = parseMaquinaForm(fd);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro interno do servidor';
    redirect(`/maquinas/new?error=${enc(msg)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  // Impedir duplicidade de identificador por clínica
  const { data: exists, error: checkError } = await supabase
    .from('maquinas')
    .select('id')
    .eq('clinica_id', clinica_id)
    .eq('identificador', dataParsed!.identificador)
    .limit(1);

  if (checkError) {
    redirect(`/maquinas/new?error=${enc('Falha ao validar identificador')}`);
  }
  if (exists && exists.length > 0) {
    redirect(`/maquinas/new?error=${enc('Já existe uma máquina com este identificador nesta clínica')}`);
  }

  const { data, error } = await supabase
    .from('maquinas')
    .insert({
      clinica_id,
      ...dataParsed!,
      numero_serie: dataParsed!.numero_serie || null,
    })
    .select('id')
    .single();

  if (error) {
    let msg = 'Falha ao criar máquina';
    if (error.code === '23505') msg = 'Identificador já existe nesta clínica';
    else if (error.code === '23503') msg = 'Dados de referência inválidos';
    else if (error.message) msg = `Erro: ${error.message}`;
    redirect(`/maquinas/new?error=${enc(msg)}`);
  }

  if (!data?.id) {
    redirect(`/maquinas/new?error=${enc('Falha ao criar máquina: ID não retornado')}`);
  }

  revalidatePath('/maquinas');
  redirect(`/maquinas?ok=${enc('Máquina criada com sucesso!')}`);
}

export async function updateMaquina(id: string, fd: FormData) {
  if (!id) {
    redirect(`/maquinas?error=${enc('ID da máquina é obrigatório')}`);
  }

  let dataParsed;
  try {
    dataParsed = parseMaquinaForm(fd);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro interno do servidor';
    redirect(`/maquinas/${id}/edit?error=${enc(msg)}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  // Verificar existência e permissão
  const { data: existing, error: fetchError } = await supabase
    .from('maquinas')
    .select('id')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (fetchError || !existing) {
    redirect(`/maquinas?error=${enc('Máquina não encontrada ou sem permissão de acesso')}`);
  }

  // Evitar duplicidade de identificador ao atualizar
  const { data: dup, error: dupErr } = await supabase
    .from('maquinas')
    .select('id')
    .eq('clinica_id', clinica_id)
    .eq('identificador', dataParsed!.identificador)
    .neq('id', id)
    .limit(1);

  if (dupErr) {
    redirect(`/maquinas/${id}/edit?error=${enc('Falha ao validar identificador')}`);
  }
  if (dup && dup.length > 0) {
    redirect(`/maquinas/${id}/edit?error=${enc('Já existe uma máquina com este identificador nesta clínica')}`);
  }

  const { error } = await supabase
    .from('maquinas')
    .update({
      ...dataParsed!,
      numero_serie: dataParsed!.numero_serie || null,
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    let msg = 'Falha ao atualizar máquina';
    if (error.code === '23505') msg = 'Identificador já existe nesta clínica';
    else if (error.code === '23503') msg = 'Dados de referência inválidos';
    else if (error.message) msg = `Erro: ${error.message}`;
    redirect(`/maquinas/${id}/edit?error=${enc(msg)}`);
  }

  revalidatePath('/maquinas');
  revalidatePath(`/maquinas/${id}`);
  redirect(`/maquinas?ok=${enc('Máquina atualizada com sucesso!')}`);
}

export async function deleteMaquina(id: string) {
  if (!id) {
    redirect(`/maquinas?error=${enc('ID da máquina é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  // Verificar existência
  const { data: existing, error: fetchError } = await supabase
    .from('maquinas')
    .select('id, identificador')
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  if (fetchError || !existing) {
    redirect(`/maquinas?error=${enc('Máquina não encontrada ou sem permissão de acesso')}`);
  }

  // Opcional: verificar dependências (sessoes_hemodialise, escala_pacientes)
  // Aqui apenas executamos desativação (soft delete)
  const { error } = await supabase
    .from('maquinas')
    .update({ ativa: false })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    let msg = 'Falha ao desativar máquina';
    if (error.message) msg = `Erro: ${error.message}`;
    redirect(`/maquinas?error=${enc(msg)}`);
  }

  revalidatePath('/maquinas');
  redirect(`/maquinas?ok=${enc(`Máquina "${existing.identificador}" desativada com sucesso!`)}`);
}