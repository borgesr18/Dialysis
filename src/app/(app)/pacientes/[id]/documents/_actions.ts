'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9_\-\.]+/g, '-').replace(/-+/g, '-');
}

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export async function uploadDocumento(pacienteId: string, fd: FormData) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) {
    throw new Error('Sem vínculo de clínica.');
  }

  const file = fd.get('arquivo') as File | null;
  if (!file || file.size === 0) {
    throw new Error('Selecione um arquivo.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo excede 10MB.');
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new Error('Tipo de arquivo não permitido.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const originalName = file.name || 'documento';
  const safeName = sanitizeFilename(originalName);
  const path = `${clinicaId}/${pacienteId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase
    .storage
    .from('documentos')
    .upload(path, bytes, { contentType: file.type || 'application/octet-stream', upsert: false });

  if (upErr) throw upErr;

  const { error: metaErr } = await supabase.from('docs_paciente').insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId,
    storage_path: path,
    tipo: file.type || null,
  });
  if (metaErr) {
    await supabase.storage.from('documentos').remove([path]);
    throw metaErr;
  }

  revalidatePath(`/pacientes/${pacienteId}`);
}

export async function deleteDocumento(docId: string, pacienteId: string) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) throw new Error('Sem vínculo de clínica.');

  const { data: doc, error } = await supabase
    .from('docs_paciente')
    .select('id, storage_path')
    .eq('id', docId)
    .maybeSingle();

  if (error) throw error;
  if (!doc) throw new Error('Documento não encontrado.');

  const { error: remErr } = await supabase.storage.from('documentos').remove([doc.storage_path]);
  if (remErr) throw remErr;

  const { error: delErr } = await supabase.from('docs_paciente').delete().eq('id', docId);
  if (delErr) throw delErr;

  revalidatePath(`/pacientes/${pacienteId}`);
}

export async function getSignedUrl(storagePath: string, expiresIn = 600) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from('documentos').createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl ?? null;
}

export async function listDocumentos(pacienteId: string, expiresIn = 600) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) throw new Error('Sem vínculo de clínica.');

  const { data, error } = await supabase
    .from('docs_paciente')
    .select('id, storage_path, tipo, created_at')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const docs = data ?? [];
  const withUrls = await Promise.all(
    docs.map(async (d: any) => {
      const url = await getSignedUrl(d.storage_path, expiresIn);
      return { ...d, url };
    })
  );
  return withUrls;
}
