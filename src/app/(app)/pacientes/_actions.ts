'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { revalidatePath, redirect } from 'next/navigation';

function q(msg: string) {
  return encodeURIComponent(msg);
}

export async function createPaciente(formData: FormData) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const registro = String(formData.get('registro') ?? '').trim();
  const nomeCompleto = String(formData.get('nomeCompleto') ?? '').trim();
  const cidadeNome = String(formData.get('cidadeNome') ?? '').trim();
  const alertaTexto = String(formData.get('alertaTexto') ?? '').trim();

  if (!registro || !nomeCompleto) {
    redirect('/pacientes?error=' + q('Informe REG e Nome.'));
  }

  const { error } = await supabase.from('pacientes').insert({
    clinica_id: clinicaId,
    registro,
    nome_completo: nomeCompleto,
    cidade_nome: cidadeNome || null,
    alerta_texto: alertaTexto || null,
  });

  if (error) {
    if ((error as any).code === '23505') {
      redirect('/pacientes?error=' + q(`Já existe um paciente com REG "${registro}" nesta clínica.`));
    }
    redirect('/pacientes?error=' + q('Falha ao salvar paciente: ' + error.message));
  }

  revalidatePath('/pacientes');
  redirect('/pacientes?msg=' + q('Paciente criado com sucesso.'));
}

export async function updatePaciente(id: string, formData: FormData) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const registro = String(formData.get('registro') ?? '').trim();
  const nomeCompleto = String(formData.get('nomeCompleto') ?? '').trim();
  const cidadeNome = String(formData.get('cidadeNome') ?? '').trim();
  const alertaTexto = String(formData.get('alertaTexto') ?? '').trim();

  if (!id) redirect('/pacientes?error=' + q('ID inválido.'));
  if (!registro || !nomeCompleto) {
    redirect('/pacientes?error=' + q('Informe REG e Nome.'));
  }

  const { error } = await supabase
    .from('pacientes')
    .update({
      registro,
      nome_completo: nomeCompleto,
      cidade_nome: cidadeNome || null,
      alerta_texto: alertaTexto || null,
    })
    .eq('id', id)
    .eq('clinica_id', clinicaId);

  if (error) {
    if ((error as any).code === '23505') {
      redirect('/pacientes?error=' + q(`REG "${registro}" já está em uso nesta clínica.`));
    }
    redirect('/pacientes?error=' + q('Falha ao atualizar paciente: ' + error.message));
  }

  revalidatePath('/pacientes');
  redirect('/pacientes?msg=' + q('Paciente atualizado com sucesso.'));
}

/** Aliases para compatibilidade com imports antigos */
export { createPaciente as createPacienteAction };
export { updatePaciente as updatePacienteAction };
