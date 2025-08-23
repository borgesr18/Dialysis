'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function enc(msg: string) {
  return encodeURIComponent(msg);
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const str = String(value).replace(',', '.').trim();
  if (str === '') return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export async function createSessao(fd: FormData) {
  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const paciente_id = String(fd.get('paciente_id') ?? '').trim();
  const maquina_id = String(fd.get('maquina_id') ?? '').trim();
  const data_sessao = String(fd.get('data_sessao') ?? '').trim();
  const hora_inicio = String(fd.get('hora_inicio') ?? '').trim();
  const peso_pre = parseNumber(fd.get('peso_pre'));
  const pressao_arterial_pre = String(fd.get('pressao_arterial_pre') ?? '').trim() || null;
  const ultrafiltracao_prescrita = parseNumber(fd.get('ultrafiltracao_prescrita'));
  const observacoes = String(fd.get('observacoes') ?? '').trim() || null;

  if (!paciente_id || !maquina_id || !data_sessao || !hora_inicio) {
    redirect(`/sessoes/new?error=${enc('Preencha todos os campos obrigatórios')}`);
  }

  // Verificar se paciente pertence à clínica do usuário
  const { data: paciente, error: pacienteErr } = await supabase
    .from('pacientes')
    .select('id')
    .eq('id', paciente_id)
    .eq('clinica_id', clinica_id)
    .maybeSingle();

  if (pacienteErr || !paciente) {
    redirect(`/sessoes/new?error=${enc('Paciente inválido para a clínica atual')}`);
  }

  // Verificar se máquina pertence à clínica do usuário
  const { data: maq, error: maqErr } = await supabase
    .from('maquinas')
    .select('id')
    .eq('id', maquina_id)
    .eq('clinica_id', clinica_id)
    .maybeSingle();

  if (maqErr || !maq) {
    redirect(`/sessoes/new?error=${enc('Máquina inválida para a clínica atual')}`);
  }

  const insertPayload: any = {
    paciente_id,
    maquina_id,
    data_sessao,
    hora_inicio,
    peso_pre,
    pressao_arterial_pre,
    observacoes,
    status: 'AGENDADA',
  };
  if (ultrafiltracao_prescrita !== null) {
    insertPayload['ultrafiltração_prescrita'] = ultrafiltracao_prescrita;
  }

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .insert(insertPayload);

  if (error) {
    const msg = error.message || 'Falha ao criar sessão';
    redirect(`/sessoes/new?error=${enc(msg)}`);
  }

  revalidatePath('/sessoes');
  redirect(`/sessoes?ok=${enc('Sessão criada com sucesso!')}`);
}

export async function updateSessao(id: string, fd: FormData) {
  if (!id) {
    redirect(`/sessoes?error=${enc('ID da sessão é obrigatório')}`);
  }
  const supabase = createClient();

  const payload: any = {
    peso_pre: parseNumber(fd.get('peso_pre')),
    peso_pos: parseNumber(fd.get('peso_pos')),
    pressao_arterial_pre: String(fd.get('pressao_arterial_pre') ?? '').trim() || null,
    pressao_arterial_pos: String(fd.get('pressao_arterial_pos') ?? '').trim() || null,
    observacoes: String(fd.get('observacoes') ?? '').trim() || null,
  };

  const ufPresc = parseNumber(fd.get('ultrafiltracao_prescrita'));
  if (ufPresc !== null) payload['ultrafiltração_prescrita'] = ufPresc;
  const ufReal = parseNumber(fd.get('ultrafiltracao_realizada'));
  if (ufReal !== null) payload['ultrafiltração_realizada'] = ufReal;

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .update(payload)
    .eq('id', id);

  if (error) {
    const msg = error.message || 'Falha ao atualizar sessão';
    redirect(`/sessoes/${id}?error=${enc(msg)}`);
  }

  revalidatePath(`/sessoes/${id}`);
  revalidatePath('/sessoes');
  redirect(`/sessoes/${id}?ok=${enc('Sessão atualizada com sucesso!')}`);
}

export async function startSessao(id: string) {
  if (!id) {
    redirect(`/sessoes?error=${enc('ID da sessão é obrigatório')}`);
  }
  const supabase = createClient();

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .update({ status: 'EM_ANDAMENTO' })
    .eq('id', id)
    .eq('status', 'AGENDADA');

  if (error) {
    const msg = error.message || 'Falha ao iniciar sessão';
    redirect(`/sessoes/${id}?error=${enc(msg)}`);
  }

  revalidatePath(`/sessoes/${id}`);
  revalidatePath('/sessoes');
  redirect(`/sessoes/${id}?ok=${enc('Sessão iniciada!')}`);
}

export async function finalizarSessao(id: string, fd?: FormData) {
  if (!id) {
    redirect(`/sessoes?error=${enc('ID da sessão é obrigatório')}`);
  }
  const supabase = createClient();

  const hora_fim = (fd && String(fd.get('hora_fim') ?? '').trim()) || null;
  const peso_pos = fd ? parseNumber(fd.get('peso_pos')) : null;
  const pressao_arterial_pos = fd ? (String(fd.get('pressao_arterial_pos') ?? '').trim() || null) : null;
  const ultrafiltracao_realizada = fd ? parseNumber(fd.get('ultrafiltracao_realizada')) : null;

  const payload: any = { status: 'CONCLUIDA' };
  if (hora_fim) payload.hora_fim = hora_fim;
  if (peso_pos !== null) payload.peso_pos = peso_pos;
  if (pressao_arterial_pos) payload.pressao_arterial_pos = pressao_arterial_pos;
  if (ultrafiltracao_realizada !== null) payload['ultrafiltração_realizada'] = ultrafiltracao_realizada;

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .update(payload)
    .eq('id', id)
    .in('status', ['EM_ANDAMENTO', 'AGENDADA']);

  if (error) {
    const msg = error.message || 'Falha ao finalizar sessão';
    redirect(`/sessoes/${id}?error=${enc(msg)}`);
  }

  revalidatePath(`/sessoes/${id}`);
  revalidatePath('/sessoes');
  redirect(`/sessoes/${id}?ok=${enc('Sessão finalizada!')}`);
}