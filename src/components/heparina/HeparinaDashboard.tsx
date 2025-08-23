// PASTA: src/components/heparina/HeparinaDashboard.tsx
// ✅ CORRIGIDO: Função convertida para useCallback com dependências corretas

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, Clock, Users, TrendingUp, Syringe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';

type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
type AlertaHeparina = Database['public']['Tables']['alertas_heparina']['Row'];
type Paciente = Database['public']['Tables']['pacientes']['Row'];
type SessaoHemodialise = Database['public']['Tables']['sessoes_hemodialise']['Row'];

interface EstatisticasTurno {
  turno: string;
  totalPacientes: number;
  comDose: number;
  semDose: number;
  alertas: number;
  doseMedia: number;
}

interface AlertaAtivo extends AlertaHeparina {
  doses_heparina?: {
    paciente_id: string;
    pacientes?: {
      id: string;
      nome_completo: string;
      cpf?: string;
    };
  };
}

export default function HeparinaDashboard() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [estatisticasTurnos, setEstatisticasTurnos] = useState<EstatisticasTurno[]>([]);
  const [alertasAtivos, setAlertasAtivos] = useState<AlertaAtivo[]>([]);
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalPacientes: 0,
    totalComDose: 0,
    totalSemDose: 0,
    totalAlertas: 0,
    doseMediaGeral: 0
  });

  const carregarDados = useCallback(async () => {
    try {
      console.log('🔄 Iniciando carregamento dos dados do dashboard heparina...');
      setLoading(true);
      
      console.log('📊 Carregando estatísticas de turnos...');
      await carregarEstatisticasTurnos();
      console.log('✅ Estatísticas de turnos carregadas');
      
      console.log('🚨 Carregando alertas ativos...');
      await carregarAlertasAtivos();
      console.log('✅ Alertas ativos carregados');
      
      console.log('📈 Carregando estatísticas gerais...');
      await carregarEstatisticasGerais();
      console.log('✅ Estatísticas gerais carregadas');
      
      console.log('🎉 Todos os dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      console.error('Stack trace:', error);
      // Não deixar em loading infinito mesmo com erro
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]); // ✅ Adicionada dependência supabase

  useEffect(() => {
    carregarDados();
  }, [carregarDados]); // ✅ Adicionada dependência carregarDados

  const carregarEstatisticasTurnos = async () => {
    try {
      // Buscar sessões ativas do dia atual
      const hoje = new Date().toISOString().split('T')[0];
      console.log('📅 Buscando sessões para a data:', hoje);
      
      const { data: sessoes, error: sessoesError } = await supabase
        .from('sessoes_hemodialise')
        .select(`
          id,
          paciente_id,
          hora_inicio
        `)
        .eq('data_sessao', hoje)
        .in('status', ['AGENDADA', 'EM_ANDAMENTO', 'CONFIRMADA']);

      if (sessoesError) {
        console.error('❌ Erro ao buscar sessões:', sessoesError);
        throw sessoesError;
      }

      console.log(`📋 Encontradas ${sessoes?.length || 0} sessões para hoje`);

      // Buscar doses de heparina para os pacientes das sessões
      const pacienteIds = sessoes?.map((s: any) => s.paciente_id) || [];
      
      if (pacienteIds.length === 0) {
        console.log('⚠️ Nenhum paciente encontrado para hoje');
        setEstatisticasTurnos([]);
        return;
      }

      const { data: doses, error: dosesError } = await supabase
        .from('doses_heparina')
        .select('id, paciente_id, dose_heparina, data_prescricao')
        .in('paciente_id', pacienteIds);

      if (dosesError) {
        console.error('❌ Erro ao buscar doses:', dosesError);
        throw dosesError;
      }

      console.log(`💉 Encontradas ${doses?.length || 0} doses`);

      // Obter última dose por paciente (mais recente por data_prescricao)
      const ultimaDosePorPaciente = new Map<string, any>();
      (doses || []).forEach((d: any) => {
        const atual = ultimaDosePorPaciente.get(d.paciente_id);
        if (!atual || new Date(d.data_prescricao) > new Date(atual.data_prescricao)) {
          ultimaDosePorPaciente.set(d.paciente_id, d);
        }
      });

      const doseIds = Array.from(ultimaDosePorPaciente.values()).map((d: any) => d.id);

      // Buscar alertas ativos
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_heparina')
        .select('id, dose_heparina_id, ativo')
        .in('dose_heparina_id', doseIds.length > 0 ? doseIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('ativo', true);

      if (alertasError) {
        console.error('❌ Erro ao buscar alertas:', alertasError);
        // Não falhar por causa dos alertas
      }

      console.log(`🚨 Encontrados ${alertas?.length || 0} alertas ativos`);

      // Processar estatísticas por turno (derivado de hora_inicio)
      const gruposPorTurno = new Map<string, any[]>();
      (sessoes || []).forEach((s: any) => {
        const hora = (s.hora_inicio || '').slice(0, 2);
        let nomeTurno = 'Indefinido';
        const horaNum = Number(hora);
        if (!Number.isNaN(horaNum)) {
          if (horaNum >= 5 && horaNum < 12) nomeTurno = 'manha';
          else if (horaNum >= 12 && horaNum < 18) nomeTurno = 'tarde';
          else nomeTurno = 'noite';
        }
        if (!gruposPorTurno.has(nomeTurno)) gruposPorTurno.set(nomeTurno, []);
        gruposPorTurno.get(nomeTurno)!.push(s);
      });

      const estatisticas: EstatisticasTurno[] = Array.from(gruposPorTurno.entries()).map(([turnoNome, sessoesTurno]) => {
        const pacientesTurno = sessoesTurno.map((s: any) => s.paciente_id);
        const pacientesComDose = pacientesTurno.filter((pid: string) => ultimaDosePorPaciente.has(pid));
        const dosesTurno = pacientesComDose.map((pid: string) => ultimaDosePorPaciente.get(pid));
        const alertasTurno = (alertas || []).filter(a => dosesTurno.some((d: any) => d.id === a.dose_heparina_id));
        
        const doseMedia = dosesTurno.length > 0 
          ? dosesTurno.reduce((acc: number, d: any) => acc + (d.dose_heparina || 0), 0) / dosesTurno.length 
          : 0;

        return {
          turno: turnoNome,
          totalPacientes: sessoesTurno.length,
          comDose: pacientesComDose.length,
          semDose: sessoesTurno.length - pacientesComDose.length,
          alertas: alertasTurno.length,
          doseMedia: Math.round(doseMedia)
        };
      });

      console.log('📊 Estatísticas por turno processadas:', estatisticas);
      setEstatisticasTurnos(estatisticas);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas de turnos:', error);
      setEstatisticasTurnos([]);
    }
  };

  const carregarAlertasAtivos = async () => {
    try {
      const { data: alertas, error } = await supabase
        .from('alertas_heparina')
        .select(`
          *,
          doses_heparina(
            paciente_id,
            pacientes(
              id,
              nome_completo,
              cpf
            )
          )
        `)
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar alertas ativos:', error);
        throw error;
      }

      console.log(`🚨 Carregados ${alertas?.length || 0} alertas ativos`);
      setAlertasAtivos(alertas || []);

    } catch (error) {
      console.error('❌ Erro ao carregar alertas ativos:', error);
      setAlertasAtivos([]);
    }
  };

  const carregarEstatisticasGerais = async () => {
    try {
      // Buscar total de pacientes ativos
      const { data: pacientes, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('ativo', true);

      if (pacientesError) throw pacientesError;

      // Buscar doses
      const { data: doses, error: dosesError } = await supabase
        .from('doses_heparina')
        .select('paciente_id, dose_heparina');

      if (dosesError) throw dosesError;

      // Buscar alertas ativos
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_heparina')
        .select('id')
        .eq('ativo', true);

      if (alertasError) throw alertasError;

      const totalPacientes = pacientes?.length || 0;
      const pacientesComDoseSet = new Set((doses || []).map((d: any) => d.paciente_id));
      const totalComDose = pacientesComDoseSet.size;
      const totalSemDose = Math.max(0, totalPacientes - totalComDose);
      const totalAlertas = alertas?.length || 0;
      const doseMediaGeral = doses && doses.length > 0 
        ? Math.round((doses as any[]).reduce((acc, d) => acc + (d.dose_heparina || 0), 0) / doses.length)
        : 0;

      const estatisticas = {
        totalPacientes,
        totalComDose,
        totalSemDose,
        totalAlertas,
        doseMediaGeral
      };

      console.log('📈 Estatísticas gerais processadas:', estatisticas);
      setEstatisticasGerais(estatisticas);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas gerais:', error);
      setEstatisticasGerais({
        totalPacientes: 0,
        totalComDose: 0,
        totalSemDose: 0,
        totalAlertas: 0,
        doseMediaGeral: 0
      });
    }
  };

  const formatarTurno = (turno: string) => {
    const turnos = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite'
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  const calcularPorcentagem = (valor: number, total: number) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalPacientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Syringe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Com Dose</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalComDose}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Dose</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalSemDose}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalAlertas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dose Média</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.doseMediaGeral}UI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Turno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Estatísticas por Turno - Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {estatisticasTurnos.map((turno) => (
              <div key={turno.turno} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{formatarTurno(turno.turno)}</h3>
                  <Badge variant={turno.alertas > 0 ? 'danger' : 'success'}>
                    {turno.totalPacientes} pacientes
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Com dose</span>
                    <span className="font-medium text-green-600">{turno.comDose}</span>
                  </div>
                  <Progress 
                    value={calcularPorcentagem(turno.comDose, turno.totalPacientes)} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sem dose</span>
                    <span className="font-medium text-orange-600">{turno.semDose}</span>
                  </div>
                  <Progress 
                    value={calcularPorcentagem(turno.semDose, turno.totalPacientes)} 
                    className="h-2 bg-orange-200"
                  />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dose média</span>
                    <span className="font-medium">{turno.doseMedia}UI</span>
                  </div>
                  {turno.alertas > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Alertas</span>
                      <span className="font-medium text-red-600">{turno.alertas}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      {alertasAtivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Alertas Ativos</span>
              <Badge variant="danger">{alertasAtivos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasAtivos.map((alerta) => (
                <div key={alerta.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {(alerta.doses_heparina as any)?.pacientes?.nome_completo || 'Paciente não identificado'}
                      </p>
                      <p className="text-sm text-gray-600">{alerta.tipo_alerta}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(alerta.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge variant="danger" className="text-xs">
                      {alerta.tipo_alerta}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Syringe className="h-6 w-6" />
              <span>Nova Prescrição</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity className="h-6 w-6" />
              <span>Consultar Doses</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span>Histórico</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
