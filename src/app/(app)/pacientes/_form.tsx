'use client';

import { useState } from 'react';
import CitySelect from '@/components/CitySelect';

type Props = {
  action: (fd: FormData) => void;
  initial?: {
    registro?: string | null;
    nome_completo?: string | null;
    cidade_nome?: string | null;
    alerta_texto?: string | null;
  };
  submitLabel?: string;
  cancelHref?: string;
};

export default function PacienteForm({ action, initial, submitLabel = 'Salvar', cancelHref }: Props) {
  const [cidade, setCidade] = useState(initial?.cidade_nome ?? '');

  return (
    <form action={action} className="card grid gap-3">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="label">Registro (REG)</label>
          <input name="registro" defaultValue={initial?.registro ?? ''} className="input" placeholder="0001" required />
        </div>
        <div className="md:col-span-2">
          <label className="label">Nome completo</label>
          <input name="nome_completo" defaultValue={initial?.nome_completo ?? ''} className="input" placeholder="Nome do paciente" required />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="label">Cidade (PE)</label>
          <CitySelect value={cidade} onChange={setCidade} />
          <input type="hidden" name="cidade_nome" value={cidade} />
        </div>
        <div>
          <label className="label">Alerta (ex.: isolamento, alergias)</label>
          <input name="alerta_texto" defaultValue={initial?.alerta_texto ?? ''} className="input" placeholder="Observação/alerta" />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {cancelHref && (
          <a href={cancelHref} className="px-4 py-2 rounded-md border hover:bg-gray-50">Cancelar</a>
        )}
        <button className="btn" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
