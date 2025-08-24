'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const maquinaSchema = z.object({
  identificador: z.string().min(1, 'Identificador é obrigatório'),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  sala_id: z.string().min(1, 'Sala é obrigatória'),
  status: z.enum(['ativa', 'manutencao', 'inativa']).default('ativa'),
});

export async function createMaquina(formData: FormData) {
  const supabase = createClient();
  
  const validatedFields = maquinaSchema.safeParse({
    identificador: formData.get('identificador'),
    modelo: formData.get('modelo'),
    numero_serie: formData.get('numero_serie'),
    sala_id: formData.get('sala_id'),
    status: formData.get('status') || 'ativa',
  });

  if (!validatedFields.success) {
    redirect('/maquinas/new?error=' + encodeURIComponent('Dados inválidos'));
  }

  const { error } = await supabase
    .from('maquinas')
    .insert([validatedFields.data]);

  if (error) {
    console.error('Erro ao criar máquina:', error);
    redirect('/maquinas/new?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/maquinas');
  redirect('/maquinas?success=' + encodeURIComponent('Máquina criada com sucesso'));
}

export async function updateMaquina(id: string, formData: FormData) {
  const supabase = createClient();
  
  const validatedFields = maquinaSchema.safeParse({
    identificador: formData.get('identificador'),
    modelo: formData.get('modelo'),
    numero_serie: formData.get('numero_serie'),
    sala_id: formData.get('sala_id'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    redirect(`/maquinas/${id}/edit?error=` + encodeURIComponent('Dados inválidos'));
  }

  const { error } = await supabase
    .from('maquinas')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar máquina:', error);
    redirect(`/maquinas/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/maquinas');
  redirect('/maquinas?success=' + encodeURIComponent('Máquina atualizada com sucesso'));
}

export async function deleteMaquina(id: string) {
  const supabase = createClient();
  
  // Verificar se a máquina está sendo usada em sessões
  const { data: sessoes } = await supabase
    .from('sessoes')
    .select('id')
    .eq('maquina_id', id)
    .limit(1);

  if (sessoes && sessoes.length > 0) {
    redirect('/maquinas?error=' + encodeURIComponent('Não é possível excluir uma máquina que possui sessões associadas'));
  }

  const { error } = await supabase
    .from('maquinas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar máquina:', error);
    redirect('/maquinas?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/maquinas');
  redirect('/maquinas?success=' + encodeURIComponent('Máquina excluída com sucesso'));
}