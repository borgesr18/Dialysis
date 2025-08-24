import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { 
  doseHeparinaSchema, 
  validateRequestData, 
  validatePacienteClinica,
  handleApiError,
  getClinicaIdFromUser
} from '@/middleware/heparina-validation';
import { auditDoseHeparina } from '@/utils/heparina-audit';

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
    const aplicada = searchParams.get('aplicada');
    const clinica_id_param = searchParams.get('clinica_id');

    let query = supabase
      .from('doses_heparina')
      .select(`
        *,
        pacientes(nome, cpf),
        sessoes_hemodialise(data_sessao)
      `)
      .eq('clinica_id', clinica_id)
      .order('data_prescricao', { ascending: false });

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

    if (aplicada !== null) {
      query = query.eq('aplicada', aplicada === 'true');
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
    const { success, data: validatedData, error: validationError } = validateRequestData(doseHeparinaSchema, {
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

    // Se a dose está sendo aplicada, desativar outras doses ativas do mesmo paciente
    if (validatedData.aplicada) {
      await supabase
        .from('doses_heparina')
        .update({ aplicada: false })
        .eq('paciente_id', validatedData.paciente_id)
        .eq('aplicada', true);
    }

    // Criar nova dose
    const { data, error } = await supabase
      .from('doses_heparina')
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
      await auditDoseHeparina(
        'dose_criada',
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
        { error: 'ID da dose é obrigatório' },
        { status: 400 }
      );
    }

    const { success, data: validatedData, error: validationError } = validateRequestData(
      doseHeparinaSchema.partial(), 
      updateData
    );

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Verificar se a dose existe e pertence à clínica
    const { data: dose, error: doseError } = await supabase
      .from('doses_heparina')
      .select('*')
      .eq('id', id)
      .single();

    if (doseError || !dose) {
      return NextResponse.json(
        { error: 'Dose não encontrada' },
        { status: 404 }
      );
    }

    if (dose.clinica_id !== clinica_id) {
      return NextResponse.json(
        { error: 'Dose não pertence à clínica atual' },
        { status: 403 }
      );
    }

    // Se a dose está sendo ativada, desativar outras doses ativas do mesmo paciente
    if (validatedData.aplicada === true) {
      await supabase
        .from('doses_heparina')
        .update({ aplicada: false })
        .eq('paciente_id', dose.paciente_id)
        .eq('aplicada', true)
        .neq('id', id);
    }

    // Atualizar dose
    const { data, error } = await supabase
      .from('doses_heparina')
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
      const action = validatedData.aplicada === true ? 'dose_aplicada' : 'dose_atualizada';
      await auditDoseHeparina(
        action,
        id,
        user.id,
        clinica_id,
        dose,
        { ...dose, ...validatedData },
        { paciente_id: dose.paciente_id }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}