import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';

function enc(msg: string) {
	return encodeURIComponent(msg);
}

export async function POST(request: Request) {
	try {
		const supabase = createClient();
		const clinica_id = await requireCurrentClinicId();

		const fd = await request.formData();
		const registro = String(fd.get('registro') ?? '').trim();
		const nome_completo = String(fd.get('nome_completo') ?? '').trim();
		const cidade_nome = fd.get('cidade_nome') ? String(fd.get('cidade_nome')).trim() : null;
		const alerta_texto = fd.get('alerta_texto') ? String(fd.get('alerta_texto')).trim() : null;
		const ativo = (fd.get('ativo') ?? 'true') === 'true';

		if (!registro || !nome_completo) {
			return NextResponse.redirect(
				new URL(`/pacientes/new?error=${enc('Registro e Nome completo são obrigatórios')}`, request.url),
			);
		}

		const { data, error } = await supabase
			.from('pacientes')
			.insert({ clinica_id, registro, nome_completo, cidade_nome, alerta_texto, ativo })
			.select('id')
			.single();

		if (error || !data?.id) {
			let message = 'Falha ao salvar paciente';
			if (error?.code === '23505') message = 'Já existe um paciente com este registro nesta clínica';
			else if (error?.code === '23503') message = 'Dados de referência inválidos';
			else if (error?.message) message = `Erro: ${error.message}`;
			return NextResponse.redirect(new URL(`/pacientes/new?error=${enc(message)}`, request.url));
		}

		return NextResponse.redirect(
			new URL(`/pacientes/${data.id}?ok=${enc('Paciente criado com sucesso!')}`, request.url),
		);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
		return NextResponse.redirect(new URL(`/pacientes/new?error=${enc(msg)}`, request.url));
	}
}