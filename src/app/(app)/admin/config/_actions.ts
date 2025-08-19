'use server';

import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { requireAdmin } from '@/lib/roles';
import { redirect } from 'next/navigation';

function val(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? '').trim();
  return v.length ? v : null;
}

export async function updateClinica(fd: FormData) {
  await requireAdmin();
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

  const raw: Record<string, string | null> = {
    nome: val(fd, 'nome'),
    cnpj: val(fd, 'cnpj'),
    email: val(fd, 'email'),
    telefone: val(fd, 'telefone'),
    endereco: val(fd, 'endereco'),
    cidade_nome: val(fd, 'cidade_nome'),
    uf: val(fd, 'uf'),
    fuso_horario: val(fd, 'fuso_horario'),
    observacoes: val(fd, 'observacoes'),
  };

  const payload: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && allowedKeys.includes(k)) {
      payload[k] = v;
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
