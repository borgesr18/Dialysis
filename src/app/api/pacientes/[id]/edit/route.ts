import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';

function enc(msg: string) {
	return encodeURIComponent(msg);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
				new URL(`/pacientes/${params.id}/edit?error=${enc('Registro e Nome completo são obrigatórios')}`, request.url),
			);
		}

		// Ensure belongs to clinic
		const { data: exists, error: checkError } = await supabase
			.from('pacientes')
			.select('id')
			.eq('id', params.id)
			.eq('clinica_id', clinica_id)
			.single();

		if (checkError || !exists) {
			return NextResponse.redirect(
				new URL(`/pacientes?error=${enc('Paciente não encontrado ou sem permissão de acesso')}`, request.url),
			);
		}

		const { error } = await supabase
			.from('pacientes')
			.update({ registro, nome_completo, cidade_nome, alerta_texto, ativo })
			.eq('id', params.id)
			.eq('clinica_id', clinica_id);

		if (error) {
			let message = 'Falha ao atualizar paciente';
			if (error.code === '23505') message = 'Já existe um paciente com este registro nesta clínica';
			else if (error.code === '23503') message = 'Dados de referência inválidos';
			else if (error.message) message = `Erro: ${error.message}`;
			return NextResponse.redirect(
				new URL(`/pacientes/${params.id}/edit?error=${enc(message)}`, request.url),
			);
		}

		return NextResponse.redirect(
			new URL(`/pacientes/${params.id}?ok=${enc('Paciente atualizado com sucesso!')}`, request.url),
		);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
		return NextResponse.redirect(new URL(`/pacientes/${params.id}/edit?error=${enc(msg)}`, request.url));
	}
}