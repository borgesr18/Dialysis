import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { 
  alertaHeparinaSchema, 
  validateRequestData, 
  validatePacienteClinica,
  handleApiError,
  getClinicaIdFromUser
} from '@/middleware/heparina-validation';
import { auditAlertaHeparina } from '@/utils/heparina-audit';

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
    const paciente_id = searchParams.get('paciente_id');
    const ativo = searchParams.get('ativo');
    const severidade = searchParams.get('severidade');
    const clinica_id_param = searchParams.get('clinica_id');

    let query = supabase
      .from('alertas_heparina')
      .select(`
        *,
        pacientes(nome, cpf),
        doses_heparina(dose_heparina, unidade)
      `)
      .eq('clinica_id', clinica_id)
      .order('data_criacao', { ascending: false });

    if (paciente_id) {
      // Validar se o paciente pertence à clínica
      const { success: pacienteSuccess } = await validatePacienteClinica(paciente_id, clinica_id);
      if (!pacienteSuccess) {
        return NextResponse.json(
          { error: 'Paciente não encontrado ou sem acesso' },
          { status: 403 }
        );
      }
      query = query.eq('paciente_id', paciente_id);
    }

    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true');
    }

    if (severidade) {
      query = query.eq('severidade', severidade);
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
    const { success, data: validatedData, error: validationError } = validateRequestData(alertaHeparinaSchema, {
      ...body,
      clinica_id
    });

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Validar se o paciente pertence à clínica
    const { success: pacienteSuccess, error: pacienteError } = await validatePacienteClinica(
      validatedData.paciente_id, 
      clinica_id
    );

    if (!pacienteSuccess) {
      return NextResponse.json(
        { error: pacienteError },
        { status: 404 }
      );
    }

    // Se dose_heparina_id foi fornecido, verificar se existe e pertence à clínica
    if (validatedData.dose_heparina_id) {
      const { data: dose, error: doseError } = await supabase
        .from('doses_heparina')
        .select('id, clinica_id')
        .eq('id', validatedData.dose_heparina_id)
        .single();

      if (doseError || !dose || dose.clinica_id !== clinica_id) {
        return NextResponse.json(
          { error: 'Dose de heparina não encontrada ou sem acesso' },
          { status: 404 }
        );
      }
    }

    // Criar novo alerta
    const { data, error } = await supabase
      .from('alertas_heparina')
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
      await auditAlertaHeparina(
        'alerta_criado',
        data.id,
        user.id,
        clinica_id,
        undefined,
        validatedData,
        { paciente_id: validatedData.paciente_id }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do alerta é obrigatório' },
        { status: 400 }
      );
    }

    const { success, data: validatedData, error: validationError } = validateRequestData(
      alertaHeparinaSchema.omit({ clinica_id: true }), 
      updateData
    );

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Verificar se o alerta existe e pertence à clínica
    const { data: alerta, error: alertaError } = await supabase
      .from('alertas_heparina')
      .select('*')
      .eq('id', id)
      .single();

    if (alertaError || !alerta) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    if (alerta.clinica_id !== clinica_id) {
      return NextResponse.json(
        { error: 'Alerta não pertence à clínica atual' },
        { status: 403 }
      );
    }

    // Se o alerta está sendo resolvido, adicionar timestamp
    if ((validatedData as any).ativo === false && alerta.ativo === true) {
      (validatedData as any).resolvido_em = new Date().toISOString();
      
      // Obter usuário atual para registrar quem resolveu
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        (validatedData as any).resolvido_por = user.id;
      }
    }

    // Atualizar alerta
    const { data, error } = await supabase
      .from('alertas_heparina')
      .update(validatedData)
      .eq('id', id)
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
      const action = (validatedData as any).ativo === false ? 'alerta_resolvido' : 'alerta_atualizado';
      await auditAlertaHeparina(
        action,
        id,
        user.id,
        clinica_id,
        alerta,
        { ...alerta, ...validatedData },
        { paciente_id: (alerta as any).paciente_id }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}