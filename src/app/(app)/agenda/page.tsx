import { createClient } from '@/src/lib/supabase-server'
import { getCurrentClinicId } from '@/src/lib/get-clinic'
import { createClient } from '@/lib/supabase-server'
import { getCurrentClinicId } from '@/lib/get-clinic'

export default async function AgendaPage() {
  const supabase = createClient();
  const { data: turnos } = await supabase.from('turnos').select('*').order('hora_inicio');
  const { data: salas } = await supabase.from('salas').select('*').order('nome');
  const { data: pacientes } = await supabase.from('pacientes').select('id, nome_completo').order('nome_completo');
  const { data: escala } = await supabase.from('escala_pacientes').select('*');

  async function addToEscala(formData: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getClinicId();
    await supabase.from('escala_pacientes').insert({
      clinica_id,
      paciente_id: String(formData.get('paciente_id')||''),
      sala_id: String(formData.get('sala_id')||''),
      turno_id: String(formData.get('turno_id')||''),
      maquina_id: (formData.get('maquina_id') ? String(formData.get('maquina_id')) : null),
      dias_semana: Array.from(formData.getAll('dias_semana')).map(String),
      observacao: String(formData.get('observacao')||'') || null,
    });
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Agenda / Escala</h1>

      <form action={addToEscala} className="card grid md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="label">Paciente</label>
          <select name="paciente_id" className="select" required>
            <option value="">Selecione</option>
            {(pacientes||[]).map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Sala</label>
          <select name="sala_id" className="select" required>
            <option value="">Selecione</option>
            {(salas||[]).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Turno</label>
          <select name="turno_id" className="select" required>
            <option value="">Selecione</option>
            {(turnos||[]).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
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
        <div className="md:col-span-6">
          <label className="label">Observação</label>
          <input name="observacao" className="input" placeholder="Tempo 03:00 / 04:00, etc." />
        </div>
        <div className="md:col-span-6 flex items-end">
          <button className="btn" type="submit">Adicionar à escala</button>
        </div>
      </form>

      <div className="grid gap-2">
        {(escala||[]).map((e) => (
          <div key={e.id} className="card text-sm flex items-center justify-between">
            <div>
              <div><b>Paciente:</b> {e.paciente_id}</div>
              <div className="text-neutral-500"><b>Turno:</b> {e.turno_id} • <b>Sala:</b> {e.sala_id} • <b>Dias:</b> {e.dias_semana?.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
