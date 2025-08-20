'use client';

import { useState } from 'react';
import { CitySelect } from '@/components/CitySelect';

export default function PacienteForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaults?: {
    registro?: string;
    nomeCompleto?: string;
    cidadeNome?: string | null;
    alertaTexto?: string | null;
  };
}) {
  const [cidade, setCidade] = useState<string>(defaults?.cidadeNome ?? '');

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="registro" className="text-sm text-neutral-700">
          REG
        </label>
        <input
          id="registro"
          name="registro"
          defaultValue={defaults?.registro ?? ''}
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
          defaultValue={defaults?.nomeCompleto ?? ''}
          autoComplete="name"
          required
          className="border rounded-md px-3 py-2"
          placeholder="Nome e sobrenome"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm text-neutral-700">Cidade (PE)</label>
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
          defaultValue={defaults?.alertaTexto ?? ''}
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

