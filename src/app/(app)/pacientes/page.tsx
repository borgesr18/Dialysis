import { createClient } from '@/src/lib/supabase-server';
import Link from 'next/link';
import PacienteForm from './_form';
import { getClinicId } from '@/src/lib/get-clinic';

export default async function PacientesPage() {
  const supabase = createClient();
  const clinicId = await getClinicId();
  const { data: pacientes } = await supabase.from('pacientes').select('*').order('nome_completo', { ascending: true });

  async function createPaciente(formData: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getClinicId();
    await supabase.from('pacientes').insert({
      clinica_id,
      registro: String(formData.get('registro')||''),
      nome_completo: String(formData.get('nome_completo')||''),
      cidade_nome: String(formData.get('cidade_nome')||''),
      alerta_texto: String(formData.get('alerta_texto')||'') || null,
      ativo: true,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
      </div>

      <PacienteForm action={createPaciente} />

      <div className="grid gap-2">
        {(pacientes||[]).map((p) => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{p.nome_completo}</div>
              <div className="text-sm text-neutral-500">REG {p.registro} • {p.cidade_nome ?? '—'}</div>
            </div>
            <Link href={`#/pacientes/${p.id}`} className="text-sm underline">ver</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
