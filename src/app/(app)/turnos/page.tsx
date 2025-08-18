import { createClient } from '@/src/lib/supabase-server';
import { getClinicId } from '@/src/lib/get-clinic';

export default async function TurnosPage() {
  const supabase = createClient();
  const { data: turnos } = await supabase.from('turnos').select('*').order('hora_inicio');

  async function createTurno(formData: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getClinicId();
    const nome = String(formData.get('nome')||'');
    const hora_inicio = String(formData.get('hora_inicio')||'08:00');
    const hora_fim = String(formData.get('hora_fim')||'12:00');
    const dias_semana = Array.from(formData.getAll('dias_semana')).map(String);
    await supabase.from('turnos').insert({ clinica_id, nome, hora_inicio, hora_fim, dias_semana });
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Turnos</h1>
      <form action={createTurno} className="card grid md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="label">Nome</label>
          <input name="nome" className="input" placeholder="Seg/Qua/Sex 1º Turno" required />
        </div>
        <div>
          <label className="label">Início</label>
          <input type="time" name="hora_inicio" className="input" defaultValue="08:00" />
        </div>
        <div>
          <label className="label">Fim</label>
          <input type="time" name="hora_fim" className="input" defaultValue="12:00" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Dias da semana</label>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['DOM','SEG','TER','QUA','QUI','SEX','SAB'].map(d => (
              <label key={d} className="border rounded-lg px-2 py-1 flex items-center gap-2">
                <input type="checkbox" name="dias_semana" value={d} /> {d}
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-6 flex items-end">
          <button className="btn" type="submit">Adicionar turno</button>
        </div>
      </form>

      <div className="grid gap-2">
        {(turnos||[]).map((t) => (
          <div key={t.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{t.nome}</div>
              <div className="text-sm text-neutral-500">{t.hora_inicio}–{t.hora_fim} • {t.dias_semana.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
