'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
// import { requireAdmin } from '@/lib/roles'; // Temporariamente removido
import { redirect } from 'next/navigation';

function val(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? '').trim();
  return v.length ? v : null;
}

export async function updateClinicConfig(formData: FormData) {
  // await requireAdmin(); // Temporariamente removido
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  if (!clinica_id) {
    redirect('/admin/config?error=' + encodeURIComponent('Clínica não encontrada para o usuário atual.'));
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('clinicas')
    .select('*')
    .eq('id', clinica_id)
    .maybeSingle();

  if (fetchErr) {
    redirect('/admin/config?error=' + encodeURIComponent(fetchErr.message));
  }

  const allowedKeys = existing ? Object.keys(existing) : ['nome'];

  const updates = {
    nome: val(formData, 'nome'),
    cnpj: val(formData, 'cnpj'),
    email: val(formData, 'email'),
    telefone: val(formData, 'telefone'),
    endereco: val(formData, 'endereco'),
    cidade_nome: val(formData, 'cidade_nome'),
    uf: val(formData, 'uf'),
    fuso_horario: val(formData, 'fuso_horario'),
    observacoes: val(formData, 'observacoes'),
  };

  const payload: Record<string, string> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v && allowedKeys.includes(k)) {
      payload[k] = String(v);
    }
  }

  if (!Object.keys(payload).length) {
    redirect('/admin/config?error=' + encodeURIComponent('Nenhuma alteração para salvar.'));
  }

  const { error } = await supabase.from('clinicas').update(payload).eq('id', clinica_id).single();

  if (error) {
    redirect('/admin/config?error=' + encodeURIComponent(error.message));
  }

  redirect('/admin/config?ok=' + encodeURIComponent('Configurações salvas com sucesso.'));
}
