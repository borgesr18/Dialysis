// src/app/(app)/pacientes/page.tsx
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from './_form';

export default async function Page() {
  const supabase = createClient();
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('*')
    .order('nome_completo');

  async function createPaciente(fd: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getCurrentClinicId();

    await supabase.from('pacientes').insert({
      clinica_id,
      registro: fd.get('registro'),
      nome_completo: fd.get('nome_completo'),
      cidade_nome: fd.get('cidade_nome'),
      alerta_texto: fd.get('alerta_texto'),
    });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pacientes</h1>
      <PacienteForm action={createPaciente} />

      <div className="grid gap-2">
        {(pacientes ?? []).map((p: any) => (
          <div key={p.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.nome_completo}</div>
              <div className="text-sm text-neutral-500">
                REG {p.registro} • {p.cidade_nome ?? '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

