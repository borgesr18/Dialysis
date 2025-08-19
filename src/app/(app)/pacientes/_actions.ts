'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

function reqString(fd: FormData, name: string) {
  return String(fd.get(name) ?? '').trim();
}

export async function createPaciente(fd: FormData) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  if (!clinica_id) throw new Error('Sem vínculo de clínica.');

  const registro = reqString(fd, 'registro');
  const nome = reqString(fd, 'nome_completo');
  if (!registro || !nome) throw new Error('Registro e Nome são obrigatórios.');

  const { error } = await supabase.from('pacientes').insert({
    clinica_id,
    registro,
    nome_completo: nome,
    cidade_nome: reqString(fd, 'cidade_nome') || null,
    alerta_texto: reqString(fd, 'alerta_texto') || null,
  });

  if (error) throw error;

  revalidatePath('/pacientes');
  redirect('/pacientes');
}

export async function updatePaciente(id: string, fd: FormData) {
  const supabase = createClient();
  const nome = reqString(fd, 'nome_completo');
  if (!nome) throw new Error('Nome é obrigatório.');

  const payload: any = {
    registro: reqString(fd, 'registro') || null,
    nome_completo: nome,
    cidade_nome: reqString(fd, 'cidade_nome') || null,
    alerta_texto: reqString(fd, 'alerta_texto') || null,
  };

  const { error } = await supabase.from('pacientes').update(payload).eq('id', id);
  if (error) throw error;

  revalidatePath('/pacientes');
  redirect(`/pacientes/${id}`);
}

export async function toggleAtivo(id: string, ativo: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from('pacientes').update({ ativo }).eq('id', id);
  if (error) throw error;
  revalidatePath('/pacientes');
}

export async function removePaciente(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('pacientes').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/pacientes');
  redirect('/pacientes');
}
