// src/app/(app)/agenda/page.tsx
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export default async function AgendaPage() {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  // TODO: listar escala aqui quando quiser. Mantendo simples p/ compilar.
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <p className="text-sm text-neutral-600">
        Clínica ativa: {clinicaId ?? 'não vinculada ao seu usuário'}
      </p>
    </div>
  );
}
