'use client';
import { CitySelect } from '@/src/components/CitySelect';
import { useState } from 'react';

export default function PacienteForm({ action }: { action: (fd: FormData) => void }) {
  const [cidade, setCidade] = useState<string>('');

  return (
    <form action={action} className="card grid gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="label">Registro (REG)</label>
          <input name="registro" className="input" required />
        </div>
        <div className="md:col-span-2">
          <label className="label">Nome completo</label>
          <input name="nome_completo" className="input" required />
        </div>
        <div className="md:col-span-3">
          <label className="label">Cidade (PE)</label>
          <CitySelect value={cidade} onChange={(v)=>{ setCidade(v); }} />
          <input type="hidden" name="cidade_nome" value={cidade} />
        </div>
        <div className="md:col-span-3">
          <label className="label">Observações / Alerta</label>
          <textarea name="alerta_texto" className="input"></textarea>
        </div>
      </div>
      <button className="btn w-full md:w-auto" type="submit">Salvar paciente</button>
    </form>
  );
}
