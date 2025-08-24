import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { 
  configuracaoAlertaSchema, 
  validateRequestData, 
  handleApiError,
  getClinicaIdFromUser
} from '@/middleware/heparina-validation';
import { auditConfiguracaoAlerta } from '@/utils/heparina-audit';

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
    const tipo_acesso = searchParams.get('tipo_acesso');
    const ativo = searchParams.get('ativo');
    const clinica_id_param = searchParams.get('clinica_id');

    let query = supabase
      .from('configuracoes_alerta')
      .select('*')
      .eq('clinica_id', clinica_id)
      .order('created_at', { ascending: false });

    if (tipo_acesso) {
      query = query.eq('tipo_acesso', tipo_acesso);
    }

    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true');
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
    const { success, data: validatedData, error: validationError } = validateRequestData(configuracaoAlertaSchema, {
      ...body,
      clinica_id
    });

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Verificar se já existe configuração para o mesmo tipo de acesso
    const { data: existingConfig } = await supabase
      .from('configuracoes_alerta')
      .select('id')
      .eq('tipo_acesso', validatedData.tipo_acesso)
      .eq('clinica_id', clinica_id)
      .eq('ativo', true)
      .single();

    if (existingConfig) {
      return NextResponse.json(
        { error: 'Já existe uma configuração ativa para este tipo de acesso' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('configuracoes_alerta')
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
      await auditConfiguracaoAlerta(
        'configuracao_criada',
        (data as any).id,
        user.id,
        clinica_id,
        undefined,
        validatedData
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
        { error: 'ID da configuração é obrigatório' },
        { status: 400 }
      );
    }

    const { success, data: validatedData, error: validationError } = validateRequestData(
      configuracaoAlertaSchema, 
      { ...updateData, clinica_id }
    );
    
    // Remove clinica_id dos dados validados para não sobrescrever
    if (validatedData && 'clinica_id' in validatedData) {
      delete (validatedData as any).clinica_id;
    }

    if (!success || !validatedData) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Verificar se a configuração existe e pertence à clínica
    const { data: existingConfig, error: fetchError } = await supabase
      .from('configuracoes_alerta')
      .select('*')
      .eq('id', id)
      .eq('clinica_id', clinica_id)
      .single();

    if (fetchError || !existingConfig) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      );
    }

    // Se está alterando tipo_acesso, verificar conflitos
    if ((validatedData as any).tipo_acesso && (validatedData as any).tipo_acesso !== existingConfig.tipo_acesso) {
      const { data: conflictConfig } = await supabase
        .from('configuracoes_alerta')
        .select('id')
        .eq('tipo_acesso', (validatedData as any).tipo_acesso)
        .eq('clinica_id', clinica_id)
        .eq('ativo', true)
        .neq('id', id)
        .single();

      if (conflictConfig) {
        return NextResponse.json(
          { error: 'Já existe uma configuração ativa para este tipo de acesso' },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('configuracoes_alerta')
      .update(validatedData)
      .eq('id', id)
      .eq('clinica_id', clinica_id)
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
      const action = (validatedData as any).ativo === false ? 'configuracao_desativada' : 'configuracao_atualizada';
      await auditConfiguracaoAlerta(
        action,
        (data as any).id,
        user.id,
        clinica_id,
        existingConfig,
        validatedData
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}