'use server';

import { revalidatePath, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export async function createPacienteAction(formData: FormData) {
  const registroRaw = String(formData.get('registro') ?? '');
  const nomeCompleto = String(formData.get('nomeCompleto') ?? '');
  const cidadeNome   = String(formData.get('cidadeNome') ?? '');
  const alertaTexto  = String(formData.get('alertaTexto') ?? '');

  // Normalização no app também (caso você queira manter o REG como digitado, tudo bem;
  // o que importa é o registro_norm do BD; aqui só evitamos problemas comuns)
  const registro = registroRaw.trim();

  if (!registro || !nomeCompleto) {
    redirect('/pacientes?error=' + encodeURIComponent('Informe REG e Nome.'));
  }

  const supabase = createClient();
  const clinicaId = await getCurrentClinicId(); // lança erro se não houver vínculo

  // Tenta inserir e captura o código 23505 (unique_violation)
  const { error } = await supabase.from('pacientes').insert({
    clinica_id: clinicaId,
    registro,
    nome_completo: nomeCompleto,
    cidade_nome: cidadeNome || null,
    alerta_texto: alertaTexto || null,
  });

  if (error) {
    if ((error as any).code === '23505') {
      redirect('/pacientes?error=' + encodeURIComponent(`Já existe um paciente com REG "${registro}" nesta clínica.`));
    }
    redirect('/pacientes?error=' + encodeURIComponent('Falha ao salvar paciente: ' + error.message));
  }

  // sucesso
  revalidatePath('/pacientes');
  redirect('/pacientes?msg=' + encodeURIComponent('Paciente criado com sucesso.'));
}
