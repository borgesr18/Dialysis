import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { 
  historicoAlteracaoSchema, 
  validateRequestData, 
  handleApiError,
  getClinicaIdFromUser
} from '@/middleware/heparina-validation';
import { auditHistoricoHeparina } from '@/utils/heparina-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { success: clinicaSuccess, clinica_id, error: clinicaError } = await getClinicaIdFromUser();
    
    if (!clinicaSuccess || !clinica_id) {
      return NextResponse.json(
        { error: clinicaError || 'Erro ao obter clínica do usuário' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const dose_heparina_id = searchParams.get('dose_heparina_id');
    const clinica_id_param = searchParams.get('clinica_id');

    let query = supabase
      .from('historico_alteracoes_dose')
      .select(`
        *,
        doses_heparina(
          dose_heparina,
          unidade,
          pacientes(nome, cpf)
        )
      `)
      .eq('clinica_id', clinica_id)
      .order('data_alteracao', { ascending: false });

    if (dose_heparina_id) {
      // Verificar se a dose pertence à clínica
      const { data: dose, error: doseError } = await supabase
        .from('doses_heparina')
        .select('clinica_id')
        .eq('id', dose_heparina_id)
        .single();

      if (doseError || !dose || dose.clinica_id !== clinica_id) {
        return NextResponse.json(
          { error: 'Dose não encontrada ou sem acesso' },
          { status: 404 }
        );
      }

      query = query.eq('dose_heparina_id', dose_heparina_id);
    }

    if (clinica_id_param && clinica_id_param === clinica_id) {
      query = query.eq('clinica_id', clinica_id_param);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { success: clinicaSuccess, clinica_id, error: clinicaError } = await getClinicaIdFromUser();
    
    if (!clinicaSuccess || !clinica_id) {
      return NextResponse.json(
        { error: clinicaError || 'Erro ao obter clínica do usuário' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { success, data: validatedData, error: validationError } = validateRequestData(historicoAlteracaoSchema, {
      ...body,
      clinica_id
    });

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Verificar se a dose existe e pertence à clínica
    const { data: dose, error: doseError } = await supabase
      .from('doses_heparina')
      .select('clinica_id, paciente_id')
      .eq('id', validatedData.dose_heparina_id)
      .single();

    if (doseError || !dose || dose.clinica_id !== clinica_id) {
      return NextResponse.json(
        { error: 'Dose não encontrada ou sem acesso' },
        { status: 404 }
      );
    }

    // Criar registro de histórico
    const { data, error } = await supabase
      .from('historico_alteracoes_dose')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Log de auditoria
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await auditHistoricoHeparina(
        data.id,
        user.id,
        clinica_id,
        validatedData.dose_heparina_id,
        validatedData.dose_anterior,
        validatedData.dose_nova,
        validatedData.motivo_alteracao
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}