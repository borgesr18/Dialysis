import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';

function enc(msg: string) {
	return encodeURIComponent(msg);
}

export async function POST(request: Request) {
	const fd = await request.formData();
	const action = String(fd.get('_action') || '').toLowerCase();

	if (action === 'delete') {
		try {
			const id = String(fd.get('id') || '');
			if (!id) {
				return NextResponse.redirect(new URL(`/pacientes?error=${enc('ID do paciente é obrigatório')}`, request.url));
			}

			const supabase = createClient();
			const clinica_id = await requireCurrentClinicId();

			// Verificar dependências (sessões)
			const { data: sessions, error: sessionsError } = await supabase
				.from('sessoes_hemodialise')
				.select('id')
				.eq('paciente_id', id)
				.limit(1);

			if (sessionsError) {
				return NextResponse.redirect(new URL(`/pacientes/${id}?error=${enc('Erro ao verificar dependências do paciente')}`, request.url));
			}

			if (sessions && sessions.length > 0) {
				return NextResponse.redirect(new URL(`/pacientes/${id}?error=${enc('Não é possível excluir paciente com sessões registradas')}`, request.url));
			}

			// Buscar nome para feedback
			const { data: existing, error: checkError } = await supabase
				.from('pacientes')
				.select('id, nome_completo')
				.eq('id', id)
				.eq('clinica_id', clinica_id)
				.single();

			if (checkError || !existing) {
				return NextResponse.redirect(new URL(`/pacientes?error=${enc('Paciente não encontrado ou sem permissão de acesso')}`, request.url));
			}

			const { error } = await supabase
				.from('pacientes')
				.delete()
				.eq('id', id)
				.eq('clinica_id', clinica_id);

			if (error) {
				let message = 'Falha ao excluir paciente';
				if (error.code === '23503') message = 'Não é possível excluir paciente com registros relacionados';
				else if (error.message) message = `Erro: ${error.message}`;
				return NextResponse.redirect(new URL(`/pacientes/${id}?error=${enc(message)}`, request.url));
			}

			return NextResponse.redirect(new URL(`/pacientes?ok=${enc(`Paciente "${existing.nome_completo}" excluído com sucesso!`)}`, request.url));
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
			return NextResponse.redirect(new URL(`/pacientes?error=${enc(msg)}`, request.url));
		}
	}

	return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}