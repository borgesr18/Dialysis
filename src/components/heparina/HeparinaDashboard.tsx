'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Clock, Users, TrendingUp, Syringe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarEstatisticasTurnos(),
        carregarAlertasAtivos(),
        carregarEstatisticasGerais()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticasTurnos = async () => {
    // Buscar sessões ativas do dia atual
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data: sessoes, error: sessoesError } = await supabase
      .from('sessoes_hemodialise')
      .select(`
        turno,
        paciente_id,
        pacientes(
          id,
          nome
        )
      `)
      .eq('data_sessao', hoje)
      .eq('status', 'agendada');

    if (sessoesError) throw sessoesError;

    // Buscar doses de heparina do dia
    const { data: doses, error: dosesError } = await supabase
      .from('doses_heparina')
      .select('*')
      .gte('data_prescricao', hoje)
      .lt('data_prescricao', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (dosesError) throw dosesError;

    // Buscar alertas ativos
    const { data: alertas, error: alertasError } = await supabase
      .from('alertas_heparina')
      .select('*')
      .eq('resolvido', false);

    if (alertasError) throw alertasError;

    // Processar estatísticas por turno
    const turnos = ['manha', 'tarde', 'noite'];
    const estatisticas = turnos.map(turno => {
      const pacientesTurno = sessoes?.filter((s: any) => s.turno === turno) || [];
      const pacientesIds = pacientesTurno.map((s: any) => s.paciente_id);
      
      const dosesturno = doses?.filter((d: any) => pacientesIds.includes(d.paciente_id)) || [];
      const alertasTurno = alertas?.filter((a: any) => pacientesIds.includes(a.paciente_id)) || [];
      
      const doseMedia = dosesturno.length > 0 
        ? dosesturno.reduce((acc: number, d: any) => acc + (d.dose_heparina || 0), 0) / dosesturno.length
        : 0;

      return {
        turno,
        totalPacientes: pacientesTurno.length,
        comDose: dosesturno.length,
        semDose: pacientesTurno.length - dosesturno.length,
        alertas: alertasTurno.length,
        doseMedia
      };
    });

    setEstatisticasTurnos(estatisticas);
  };

  const carregarAlertasAtivos = async () => {
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
      .eq('resolvido', false)
      .order('data_criacao', { ascending: false })
      .limit(10);

    if (error) throw error;

    setAlertasAtivos(alertas || []);
  };

  const carregarEstatisticasGerais = async () => {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Total de pacientes ativos
    const { count: totalPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Doses prescritas hoje
    const { data: dosesHoje, count: totalComDose } = await supabase
      .from('doses_heparina')
      .select('dose_heparina', { count: 'exact' })
      .gte('data_prescricao', hoje)
      .lt('data_prescricao', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // Alertas ativos
    const { count: totalAlertas } = await supabase
      .from('alertas_heparina')
      .select('*', { count: 'exact', head: true })
      .eq('resolvido', false);

    const doseMediaGeral = dosesHoje && dosesHoje.length > 0
      ? dosesHoje.reduce((acc: number, d: any) => acc + (d.dose_heparina || 0), 0) / dosesHoje.length
      : 0;

    setEstatisticasGerais({
      totalPacientes: totalPacientes || 0,
      totalComDose: totalComDose || 0,
      totalSemDose: (totalPacientes || 0) - (totalComDose || 0),
      totalAlertas: totalAlertas || 0,
      doseMediaGeral
    });
  };

  const formatarTurno = (turno: string) => {
    const turnos = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite'
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  const formatarTipoAlerta = (tipo: string) => {
    const tipos = {
      'dose_alta': 'Dose Alta',
      'dose_baixa': 'Dose Baixa',
      'dose_faltante': 'Dose Faltante',
      'interacao': 'Interação'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getCorAlerta = (tipo: string) => {
    const cores = {
      'dose_alta': 'bg-red-100 text-red-800 border-red-200',
      'dose_baixa': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'dose_faltante': 'bg-orange-100 text-orange-800 border-orange-200',
      'interacao': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return cores[tipo as keyof typeof cores] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estatisticasGerais.totalPacientes}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Dose Prescrita</p>
                <p className="text-3xl font-bold text-green-600">
                  {estatisticasGerais.totalComDose}
                </p>
                <Progress 
                  value={(estatisticasGerais.totalComDose / estatisticasGerais.totalPacientes) * 100} 
                  className="mt-2 h-2"
                />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Syringe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Dose</p>
                <p className="text-3xl font-bold text-orange-600">
                  {estatisticasGerais.totalSemDose}
                </p>
                <Progress 
                  value={(estatisticasGerais.totalSemDose / estatisticasGerais.totalPacientes) * 100} 
                  className="mt-2 h-2"
                />
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-3xl font-bold text-red-600">
                  {estatisticasGerais.totalAlertas}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dose média: {estatisticasGerais.doseMediaGeral.toFixed(0)} UI
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Turno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Estatísticas por Turno</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {estatisticasTurnos.map((turno) => (
              <div key={turno.turno} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  {formatarTurno(turno.turno)}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Pacientes</span>
                    <span className="font-semibold">{turno.totalPacientes}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Com Dose</span>
                    <span className="font-semibold text-green-600">{turno.comDose}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sem Dose</span>
                    <span className="font-semibold text-orange-600">{turno.semDose}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Alertas</span>
                    <Badge variant={turno.alertas > 0 ? 'danger' : 'neutral'}>
                      {turno.alertas}
                    </Badge>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dose Média</span>
                      <span className="font-semibold">
                        {turno.doseMedia > 0 ? `${turno.doseMedia.toFixed(0)} UI` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={turno.totalPacientes > 0 ? (turno.comDose / turno.totalPacientes) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alertas Ativos</span>
            {alertasAtivos.length > 0 && (
              <Badge variant="danger">{alertasAtivos.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertasAtivos.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3">
                <Activity className="h-6 w-6 text-green-600 mx-auto" />
              </div>
              <p className="text-gray-500">Nenhum alerta ativo no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertasAtivos.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className={`p-4 rounded-lg border ${getCorAlerta(alerta.tipo_alerta)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="neutral" className="text-xs">
                          {formatarTipoAlerta(alerta.tipo_alerta)}
                        </Badge>
                        <span className="text-sm font-medium">
                          {alerta.doses_heparina?.pacientes?.nome_completo}
                        </span>
                        <span className="text-xs text-gray-500">
                          CPF: {alerta.doses_heparina?.pacientes?.cpf}
                        </span>
                      </div>
                      <p className="text-sm">Dose: {alerta.valor_dose} UI (Limite: {alerta.limite_configurado} UI)</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alerta.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}