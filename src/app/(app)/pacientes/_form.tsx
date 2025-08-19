'use client';

import { useState } from 'react';
import { CitySelect } from '@/components/CitySelect';

export default function PacienteForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [cidade, setCidade] = useState<string>('');

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="registro" className="text-sm text-neutral-700">
          REG
        </label>
        <input
          id="registro"
          name="registro"
          autoComplete="off"
          required
          className="border rounded-md px-3 py-2"
          placeholder="0001"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="nomeCompleto" className="text-sm text-neutral-700">
          Nome completo
        </label>
        <input
          id="nomeCompleto"
          name="nomeCompleto"
          autoComplete="name"
          required
          className="border rounded-md px-3 py-2"
          placeholder="Nome e sobrenome"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm text-neutral-700">Cidade (PE)</label>
        {/* CitySelect controla a UI; passamos o valor via input oculto para a Server Action */}
        <CitySelect value={cidade} onChange={setCidade} />
        <input type="hidden" name="cidadeNome" value={cidade} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="alertaTexto" className="text-sm text-neutral-700">
          Observações / Alertas
        </label>
        <textarea
          id="alertaTexto"
          name="alertaTexto"
          className="border rounded-md px-3 py-2 min-h-[80px]"
          placeholder="Alergias, isolamento, particularidades..."
        />
      </div>

      <div className="pt-1">
        <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white">
          Salvar
        </button>
      </div>
    </form>
  );
}

