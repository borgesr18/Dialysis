'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9_\-\.]+/g, '-').replace(/-+/g, '-');
}

export async function uploadDocumento(pacienteId: string, fd: FormData) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) {
    // Sem vínculo -> rota de onboarding
    throw new Error('Sem vínculo de clínica.');
  }

  const file = fd.get('arquivo') as File | null;
  if (!file || file.size === 0) {
    throw new Error('Selecione um arquivo.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const originalName = file.name || 'documento';
  const safeName = sanitizeFilename(originalName);
  const path = `${clinicaId}/${pacienteId}/${Date.now()}-${safeName}`;

  // Upload no Storage (bucket privado)
  const { error: upErr } = await supabase
    .storage
    .from('documentos')
    .upload(path, bytes, { contentType: file.type || 'application/octet-stream', upsert: false });

  if (upErr) throw upErr;

  // Insere metadados
  const { error: metaErr } = await supabase.from('docs_paciente').insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId,
    storage_path: path,
    tipo: file.type || null,
  });
  if (metaErr) {
    // rollback best-effort do arquivo se falhar metadado
    await supabase.storage.from('documentos').remove([path]);
    throw metaErr;
  }

  revalidatePath(`/pacientes/${pacienteId}`);
}

export async function deleteDocumento(docId: string, pacienteId: string) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) throw new Error('Sem vínculo de clínica.');

  // Busca metadados para pegar o path
  const { data: doc, error } = await supabase
    .from('docs_paciente')
    .select('id, storage_path')
    .eq('id', docId)
    .maybeSingle();

  if (error) throw error;
  if (!doc) throw new Error('Documento não encontrado.');

  // Remove do storage primeiro
  const { error: remErr } = await supabase.storage.from('documentos').remove([doc.storage_path]);
  if (remErr) throw remErr;

  // Remove metadados
  const { error: delErr } = await supabase.from('docs_paciente').delete().eq('id', docId);
  if (delErr) throw delErr;

  revalidatePath(`/pacientes/${pacienteId}`);
}
