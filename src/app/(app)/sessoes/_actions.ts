'use server';

import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

function enc(msg: string) {
  return encodeURIComponent(msg);
}

const sessaoSchema = z.object({
  paciente_id: z.string().min(1, 'Paciente é obrigatório'),
  maquina_id: z.string().min(1, 'Máquina é obrigatória'),
  data_sessao: z.string().min(1, 'Data da sessão é obrigatória'),
  hora_inicio: z.string().min(1, 'Hora de início é obrigatória'),
  peso_pre: z.number().optional(),
  pressao_arterial_pre: z.string().optional(),
  ultrafiltracao_prescrita: z.number().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada']).default('agendada'),
});

export async function createSessao(formData: FormData) {
  const supabase = createClient();
  
  const validatedFields = sessaoSchema.safeParse({
    paciente_id: formData.get('paciente_id'),
    maquina_id: formData.get('maquina_id'),
    data_sessao: formData.get('data_sessao'),
    hora_inicio: formData.get('hora_inicio'),
    peso_pre: formData.get('peso_pre') ? parseFloat(formData.get('peso_pre') as string) : undefined,
    pressao_arterial_pre: formData.get('pressao_arterial_pre') || undefined,
    ultrafiltracao_prescrita: formData.get('ultrafiltracao_prescrita') ? parseInt(formData.get('ultrafiltracao_prescrita') as string) : undefined,
    observacoes: formData.get('observacoes') || undefined,
    status: 'agendada',
  });

  if (!validatedFields.success) {
    redirect('/sessoes/new?error=' + encodeURIComponent('Dados inválidos'));
  }

  // Validar se a data não é no passado
  const hoje = new Date();
  const dataEscolhida = new Date(validatedFields.data.data_sessao);
  hoje.setHours(0, 0, 0, 0);
  dataEscolhida.setHours(0, 0, 0, 0);
  
  if (dataEscolhida < hoje) {
    redirect('/sessoes/new?error=' + encodeURIComponent('A data da sessão não pode ser no passado'));
  }

  const { error } = await supabase
    .from('sessoes')
    .insert([validatedFields.data]);

  if (error) {
    console.error('Erro ao criar sessão:', error);
    redirect('/sessoes/new?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/sessoes');
  redirect('/sessoes?success=' + encodeURIComponent('Sessão agendada com sucesso'));
}

export async function updateSessao(id: string, formData: FormData) {
  const supabase = createClient();
  
  const validatedFields = sessaoSchema.safeParse({
    paciente_id: formData.get('paciente_id'),
    maquina_id: formData.get('maquina_id'),
    data_sessao: formData.get('data_sessao'),
    hora_inicio: formData.get('hora_inicio'),
    peso_pre: formData.get('peso_pre') ? parseFloat(formData.get('peso_pre') as string) : undefined,
    pressao_arterial_pre: formData.get('pressao_arterial_pre') || undefined,
    ultrafiltracao_prescrita: formData.get('ultrafiltracao_prescrita') ? parseInt(formData.get('ultrafiltracao_prescrita') as string) : undefined,
    observacoes: formData.get('observacoes') || undefined,
    status: formData.get('status') as any,
  });

  if (!validatedFields.success) {
    redirect(`/sessoes/${id}/edit?error=` + encodeURIComponent('Dados inválidos'));
  }

  const { error } = await supabase
    .from('sessoes')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar sessão:', error);
    redirect(`/sessoes/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/sessoes');
  redirect('/sessoes?success=' + encodeURIComponent('Sessão atualizada com sucesso'));
}

export async function deleteSessao(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('sessoes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar sessão:', error);
    redirect('/sessoes?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/sessoes');
  redirect('/sessoes?success=' + encodeURIComponent('Sessão excluída com sucesso'));
}

export async function startSessao(id: string) {
  if (!id || typeof id !== 'string') {
    redirect(`/sessoes?error=${enc('ID da sessão é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .update({
      status: 'em_andamento',
      hora_inicio_real: new Date().toISOString()
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao iniciar sessão:', error);
    redirect(`/sessoes/${id}?error=${enc('Falha ao iniciar sessão')}`);
  }

  revalidatePath('/sessoes');
  revalidatePath(`/sessoes/${id}`);
  redirect(`/sessoes/${id}?ok=${enc('Sessão iniciada com sucesso!')}`);
}

export async function finalizarSessao(id: string, fd: FormData) {
  if (!id || typeof id !== 'string') {
    redirect(`/sessoes?error=${enc('ID da sessão é obrigatório')}`);
  }

  const supabase = createClient();
  const clinica_id = await requireCurrentClinicId();

  const peso_pos = fd.get('peso_pos');
  const pressao_arterial_pos = fd.get('pressao_arterial_pos');
  const observacoes_finais = fd.get('observacoes_finais');

  const { error } = await supabase
    .from('sessoes_hemodialise')
    .update({
      status: 'finalizada',
      hora_fim_real: new Date().toISOString(),
      peso_pos: peso_pos ? parseFloat(String(peso_pos)) : null,
      pressao_arterial_pos: pressao_arterial_pos ? String(pressao_arterial_pos) : null,
      observacoes_finais: observacoes_finais ? String(observacoes_finais) : null
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    console.error('❌ Erro ao finalizar sessão:', error);
    redirect(`/sessoes/${id}?error=${enc('Falha ao finalizar sessão')}`);
  }

  revalidatePath('/sessoes');
  revalidatePath(`/sessoes/${id}`);
  redirect(`/sessoes/${id}?ok=${enc('Sessão finalizada com sucesso!')}`);
}