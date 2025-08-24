import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { 
  handleApiError,
  getClinicaIdFromUser
} from '@/middleware/heparina-validation';

// GET - Buscar estatísticas do módulo Heparina
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
    const periodo = searchParams.get('periodo') || '30'; // dias
    const tipo_acesso = searchParams.get('tipo_acesso');
    
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();
    
    // Buscar estatísticas de doses
    let dosesQuery = supabase
      .from('doses_heparina')
      .select('dose_heparina, tipo_acesso, ativo, data_prescricao')
      .eq('clinica_id', clinica_id)
      .gte('data_prescricao', dataInicioISO);
    
    if (tipo_acesso) {
      dosesQuery = dosesQuery.eq('tipo_acesso', tipo_acesso);
    }
    
    const { data: doses, error: dosesError } = await dosesQuery;
    
    if (dosesError) {
      console.error('❌ Erro ao buscar doses:', dosesError);
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas de doses' },
        { status: 500 }
      );
    }
    
    // Buscar alertas ativos
    let alertasQuery = supabase
      .from('alertas_heparina')
      .select(`
        severidade, ativo, data_criacao,
        doses_heparina!inner(
          tipo_acesso
        )
      `)
      .eq('clinica_id', clinica_id)
      .eq('resolvido', false);
    
    if (tipo_acesso) {
      alertasQuery = alertasQuery.eq('doses_heparina.tipo_acesso', tipo_acesso);
    }
    
    const { data: alertas, error: alertasError } = await alertasQuery;
    
    if (alertasError) {
      console.error('❌ Erro ao buscar alertas:', alertasError);
      return NextResponse.json(
        { error: 'Erro ao buscar alertas ativos' },
        { status: 500 }
      );
    }
    
    // Buscar histórico de alterações
    let historicoQuery = supabase
      .from('historico_alteracoes_dose')
      .select(`
        dose_anterior, dose_nova, data_alteracao,
        doses_heparina!inner(
          tipo_acesso
        )
      `)
      .eq('clinica_id', clinica_id)
      .gte('data_alteracao', dataInicioISO);
    
    if (tipo_acesso) {
      historicoQuery = historicoQuery.eq('doses_heparina.tipo_acesso', tipo_acesso);
    }
    
    const { data: historico, error: historicoError } = await historicoQuery;
    
    if (historicoError) {
      console.error('❌ Erro ao buscar histórico:', historicoError);
      return NextResponse.json(
        { error: 'Erro ao buscar histórico de alterações' },
        { status: 500 }
      );
    }
    
    // Calcular estatísticas
    const totalDoses = doses?.length || 0;
    const dosesAtivas = doses?.filter(d => d.ativo).length || 0;
    const totalAlertas = alertas?.length || 0;
    const totalAlteracoes = historico?.length || 0;
    
    // Estatísticas por tipo de acesso
    const estatisticasPorTipo = {
      FAV: {
        doses: doses?.filter(d => d.tipo_acesso === 'FAV').length || 0,
        alertas: alertas?.filter((a: any) => a.doses_heparina?.tipo_acesso === 'FAV').length || 0,
        alteracoes: historico?.filter((h: any) => h.doses_heparina?.tipo_acesso === 'FAV').length || 0
      },
      CDL: {
        doses: doses?.filter(d => d.tipo_acesso === 'CDL').length || 0,
        alertas: alertas?.filter((a: any) => a.doses_heparina?.tipo_acesso === 'CDL').length || 0,
        alteracoes: historico?.filter((h: any) => h.doses_heparina?.tipo_acesso === 'CDL').length || 0
      },
      PC: {
        doses: doses?.filter(d => d.tipo_acesso === 'PC').length || 0,
        alertas: alertas?.filter((a: any) => a.doses_heparina?.tipo_acesso === 'PC').length || 0,
        alteracoes: historico?.filter((h: any) => h.doses_heparina?.tipo_acesso === 'PC').length || 0
      }
    };
    
    // Estatísticas por nível de prioridade dos alertas
    const alertasPorPrioridade = {
      critica: alertas?.filter((a: any) => a.severidade === 'critica').length || 0,
      alta: alertas?.filter((a: any) => a.severidade === 'alta').length || 0,
      media: alertas?.filter((a: any) => a.severidade === 'media').length || 0,
      baixa: alertas?.filter((a: any) => a.severidade === 'baixa').length || 0
    };
    
    // Dose média por tipo de acesso
    const doseMediaPorTipo = {
      FAV: doses?.filter((d: any) => d.tipo_acesso === 'FAV').reduce((acc: number, d: any) => acc + d.dose_heparina, 0) / (doses?.filter((d: any) => d.tipo_acesso === 'FAV').length || 1) || 0,
      CDL: doses?.filter((d: any) => d.tipo_acesso === 'CDL').reduce((acc: number, d: any) => acc + d.dose_heparina, 0) / (doses?.filter((d: any) => d.tipo_acesso === 'CDL').length || 1) || 0,
      PC: doses?.filter((d: any) => d.tipo_acesso === 'PC').reduce((acc: number, d: any) => acc + d.dose_heparina, 0) / (doses?.filter((d: any) => d.tipo_acesso === 'PC').length || 1) || 0
    };
    
    const estatisticas = {
      resumo: {
        totalDoses,
        dosesAtivas,
        totalAlertas,
        totalAlteracoes,
        periodo: parseInt(periodo)
      },
      porTipoAcesso: estatisticasPorTipo,
      alertasPorPrioridade,
      doseMediaPorTipo,
      tendencias: {
        dosesUltimos7Dias: doses?.filter((d: any) => {
          const data7Dias = new Date();
          data7Dias.setDate(data7Dias.getDate() - 7);
          return new Date(d.data_prescricao) >= data7Dias;
        }).length || 0,
        alertasUltimos7Dias: alertas?.filter((a: any) => {
          const data7Dias = new Date();
          data7Dias.setDate(data7Dias.getDate() - 7);
          return new Date(a.data_criacao) >= data7Dias;
        }).length || 0
      }
    };
    
    return NextResponse.json({ data: estatisticas });
  } catch (error) {
    return handleApiError(error);
  }
}