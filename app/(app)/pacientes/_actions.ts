'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function enc(msg: string) {
  return encodeURIComponent(msg);
}

// Normaliza dados vindos do FormData
function parsePacienteForm(fd: FormData) {
  const registro = String(fd.get('registro') ?? '').trim();
  const nome_completo = String(fd.get('nome_completo') ?? '').trim();
  const cidade_nome = (fd.get('cidade_nome') ?? '') as string;
  const alerta_texto = (fd.get('alerta_texto') ?? '') as string;
  const ativo = (fd.get('ativo') ?? 'true') === 'true';

  return { registro, nome_completo, cidade_nome, alerta_texto, ativo };
}

export async function createPaciente(fd: FormData) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId(); // lança erro se não houver vínculo

  const { registro, nome_completo, cidade_nome, alerta_texto, ativo } =
    parsePacienteForm(fd);

  // validação simples
  if (!registro || !nome_completo) {
    redirect(
      `/pacientes/new?error=${enc('Registro e Nome são obrigatórios.')}`
    );
  }

  const { data, error } = await supabase
    .from('pacientes')
    .insert({
      clinica_id,
      registro,
      nome_completo,
      cidade_nome: cidade_nome || null,
      alerta_texto: alerta_texto || null,
      ativo,
    })
    .select('id')
    .single();

  if (error) {
    // 23505 = unique violation (ex.: uniq_paciente_registro_por_clinica)
    const msg =
      error.code === '23505'
        ? 'Já existe um paciente com este REG nesta clínica.'
        : `Falha ao salvar: ${error.message}`;
    redirect(`/pacientes/new?error=${enc(msg)}`);
  }

  revalidatePath('/pacientes');
  redirect(`/pacientes/${data!.id}?ok=${enc('Paciente criado com sucesso!')}`);
}

export async function updatePaciente(id: string, fd: FormData) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const { registro, nome_completo, cidade_nome, alerta_texto, ativo } =
    parsePacienteForm(fd);

  if (!id) {
    redirect(`/pacientes?error=${enc('ID do paciente é obrigatório.')}`);
  }

  const { error } = await supabase
    .from('pacientes')
    .update({
      registro,
      nome_completo,
      cidade_nome: cidade_nome || null,
      alerta_texto: alerta_texto || null,
      ativo,
    })
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    const msg =
      error.code === '23505'
        ? 'Já existe um paciente com este REG nesta clínica.'
        : `Falha ao atualizar: ${error.message}`;
    redirect(`/pacientes/${id}/edit?error=${enc(msg)}`);
  }

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${id}`);
  redirect(`/pacientes/${id}?ok=${enc('Paciente atualizado com sucesso!')}`);
}

export async function deletePaciente(id: string) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  if (!id) {
    redirect(`/pacientes?error=${enc('ID do paciente é obrigatório.')}`);
  }

  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);

  if (error) {
    redirect(`/pacientes/${id}?error=${enc('Falha ao excluir: ' + error.message)}`);
  }

  revalidatePath('/pacientes');
  redirect(`/pacientes?ok=${enc('Paciente excluído com sucesso!')}`);
}

