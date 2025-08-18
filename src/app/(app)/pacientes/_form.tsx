// src/app/(app)/pacientes/_form.tsx
'use client';

import { CitySelect } from '@/components/CitySelect';
import { useState } from 'react';

export default function PacienteForm({ action }: { action: (fd: FormData) => void }) {
  // Mantém controlado só se quiser; como é Server Action, basta name nos inputs
  const [cidade, setCidade] = useState<string>('');

  return (
    <form action={action} className="grid gap-3">
      <input
        className="border rounded-md px-3 py-2"
        name="registro"
        placeholder="Registro (REG)"
        required
      />
      <input
        className="border rounded-md px-3 py-2"
        name="nome_completo"
        placeholder="Nome completo"
        required
      />
      <CitySelect value={cidade} onChange={(v) => setCidade(v)} />
      <input type="hidden" name="cidade_nome" value={cidade} />
      <textarea
        className="border rounded-md px-3 py-2"
        name="alerta_texto"
        placeholder="Observações/alertas"
      />
      <button className="rounded-xl px-4 py-2 bg-black text-white">Salvar</button>
    </form>
  );
}

