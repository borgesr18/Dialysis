'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, AlertTriangle, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';

type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
type AlertaHeparina = Database['public']['Tables']['alertas_heparina']['Row'];
type Paciente = Database['public']['Tables']['pacientes']['Row'];

interface DadosGrafico {
  data: string;
  total: number;
  comDose: number;
  semDose: number;
  alertas: number;
  doseMedia: number;
}

interface EstatisticasPorTipo {
  tipo: string;
  quantidade: number;
  percentual: number;
  doseMedia: number;
}

interface RelatorioFiltros {
  dataInicio: string;
  dataFim: string;
  tipoRelatorio: 'diario' | 'semanal' | 'mensal';
  tipoAcesso: string;
}

const CORES_GRAFICO = {
  comDose: '#10b981',
  semDose: '#f59e0b',
  alertas: '#ef4444',
  doseMedia: '#3b82f6'
};

const CORES_PIE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function HeparinaRelatorios() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
  const [estatisticasTipo, setEstatisticasTipo] = useState<EstatisticasPorTipo[]>([]);
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    tipoRelatorio: 'diario',
    tipoAcesso: ''
  });
  const [resumoGeral, setResumoGeral] = useState({
    totalPacientes: 0,
    totalDoses: 0,
    doseMediaGeral: 0,
    totalAlertas: 0,
    pacientesSemDose: 0,
    aderencia: 0
  });

  useEffect(() => {
    carregarDadosRelatorio();
  }, [filtros]);

  const carregarDadosRelatorio = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarDadosGrafico(),
        carregarEstatisticasPorTipo(),
        carregarResumoGeral()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosGrafico = async () => {
    const { dataInicio, dataFim, tipoRelatorio } = filtros;
    
    // Gerar array de datas baseado no tipo de relatório
    const datas = gerarArrayDatas(dataInicio, dataFim, tipoRelatorio);
    
    const dadosProcessados: DadosGrafico[] = [];
    
    for (const data of datas) {
      const { inicio, fim, label } = data;
      
      // Buscar pacientes ativos no período
      let queryPacientes = supabase
        .from('pacientes')
        .select('id, acessos_vasculares(tipo)')
        .eq('ativo', true);
      
      if (filtros.tipoAcesso) {
        queryPacientes = queryPacientes.eq('acessos_vasculares.tipo', filtros.tipoAcesso);
      }
      
      const { data: pacientes } = await queryPacientes;
      const pacientesIds = pacientes?.map((p: any) => p.id) || [];
      
      // Buscar doses do período
      const { data: doses } = await supabase
        .from('doses_heparina')
        .select('*')
        .in('paciente_id', pacientesIds)
        .gte('data_prescricao', inicio)
        .lte('data_prescricao', fim);
      
      // Buscar alertas do período
      const { data: alertas } = await supabase
        .from('alertas_heparina')
        .select('*')
        .in('paciente_id', pacientesIds)
        .gte('data_criacao', inicio)
        .lte('data_criacao', fim);
      
      const totalPacientes = pacientes?.length || 0;
      const comDose = doses?.length || 0;
      const semDose = totalPacientes - comDose;
      const totalAlertas = alertas?.length || 0;
      const doseMedia = doses && doses.length > 0
        ? doses.reduce((acc: number, d: any) => acc + (d.dose_heparina || 0), 0) / doses.length
        : 0;
      
      dadosProcessados.push({
        data: label,
        total: totalPacientes,
        comDose,
        semDose,
        alertas: totalAlertas,
        doseMedia: Math.round(doseMedia)
      });
    }
    
    setDadosGrafico(dadosProcessados);
  };

  const carregarEstatisticasPorTipo = async () => {
    const { dataInicio, dataFim } = filtros;
    
    // Buscar doses agrupadas por tipo de acesso
    const { data: acessos } = await supabase
      .from('acessos_vasculares')
      .select(`
        tipo,
        paciente_id,
        doses_heparina(
          dose_heparina,
          data_prescricao
        )
      `)
      .gte('doses_heparina.data_prescricao', dataInicio)
      .lte('doses_heparina.data_prescricao', dataFim);
    
    // Processar estatísticas por tipo
    const estatisticasMap = new Map<string, { quantidade: number; doses: number[] }>();
    
    acessos?.forEach((acesso: any) => {
      if (!acesso.doses_heparina || acesso.doses_heparina.length === 0) return;
      
      const tipo = acesso.tipo;
      const doses = acesso.doses_heparina.map((d: any) => d.dose_heparina || 0);
      
      if (!estatisticasMap.has(tipo)) {
        estatisticasMap.set(tipo, { quantidade: 0, doses: [] });
      }
      
      const stats = estatisticasMap.get(tipo)!;
      stats.quantidade += doses.length;
      stats.doses.push(...doses);
    });
    
    const totalDoses = Array.from(estatisticasMap.values())
      .reduce((acc, stats) => acc + stats.quantidade, 0);
    
    const estatisticas: EstatisticasPorTipo[] = Array.from(estatisticasMap.entries())
      .map(([tipo, stats]) => ({
        tipo: formatarTipoAcesso(tipo),
        quantidade: stats.quantidade,
        percentual: totalDoses > 0 ? (stats.quantidade / totalDoses) * 100 : 0,
        doseMedia: stats.doses.length > 0
          ? stats.doses.reduce((acc, dose) => acc + dose, 0) / stats.doses.length
          : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
    
    setEstatisticasTipo(estatisticas);
  };

  const carregarResumoGeral = async () => {
    const { dataInicio, dataFim } = filtros;
    
    // Total de pacientes ativos
    const { count: totalPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);
    
    // Total de doses no período
    const { data: doses, count: totalDoses } = await supabase
      .from('doses_heparina')
      .select('dose_heparina', { count: 'exact' })
      .gte('data_prescricao', dataInicio)
      .lte('data_prescricao', dataFim);
    
    // Total de alertas no período
    const { count: totalAlertas } = await supabase
      .from('alertas_heparina')
      .select('*', { count: 'exact', head: true })
      .gte('data_criacao', dataInicio)
      .lte('data_criacao', dataFim);
    
    const doseMediaGeral = doses && doses.length > 0
      ? doses.reduce((acc: number, d: any) => acc + (d.dose_heparina || 0), 0) / doses.length
      : 0;
    
    const pacientesSemDose = (totalPacientes || 0) - (totalDoses || 0);
    const aderencia = totalPacientes && totalPacientes > 0
      ? ((totalDoses || 0) / totalPacientes) * 100
      : 0;
    
    setResumoGeral({
      totalPacientes: totalPacientes || 0,
      totalDoses: totalDoses || 0,
      doseMediaGeral,
      totalAlertas: totalAlertas || 0,
      pacientesSemDose,
      aderencia
    });
  };

  const gerarArrayDatas = (inicio: string, fim: string, tipo: 'diario' | 'semanal' | 'mensal') => {
    const datas = [];
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    
    let atual = new Date(dataInicio);
    
    while (atual <= dataFim) {
      const proximaData = new Date(atual);
      let label = '';
      
      switch (tipo) {
        case 'diario':
          proximaData.setDate(atual.getDate() + 1);
          label = atual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          break;
        case 'semanal':
          proximaData.setDate(atual.getDate() + 7);
          label = `Sem ${Math.ceil(atual.getDate() / 7)}`;
          break;
        case 'mensal':
          proximaData.setMonth(atual.getMonth() + 1);
          label = atual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          break;
      }
      
      datas.push({
        inicio: atual.toISOString().split('T')[0],
        fim: new Date(proximaData.getTime() - 1).toISOString().split('T')[0],
        label
      });
      
      atual = proximaData;
    }
    
    return datas;
  };

  const formatarTipoAcesso = (tipo: string) => {
    const tipos = {
      'FAV': 'Fístula Arteriovenosa',
      'CDL': 'Cateter de Longa Duração',
      'PC': 'Permcath'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const exportarRelatorio = async () => {
    try {
      // Preparar dados para exportação
      const dadosExportacao = {
        periodo: `${filtros.dataInicio} a ${filtros.dataFim}`,
        tipoRelatorio: filtros.tipoRelatorio,
        resumoGeral,
        dadosGrafico,
        estatisticasTipo
      };
      
      // Converter para CSV
      const csvContent = [
        // Cabeçalho do relatório
        `Relatório de Heparina - ${dadosExportacao.periodo}`,
        '',
        'RESUMO GERAL',
        `Total de Pacientes,${resumoGeral.totalPacientes}`,
        `Total de Doses,${resumoGeral.totalDoses}`,
        `Dose Média Geral,${resumoGeral.doseMediaGeral.toFixed(0)} UI`,
        `Total de Alertas,${resumoGeral.totalAlertas}`,
        `Pacientes sem Dose,${resumoGeral.pacientesSemDose}`,
        `Aderência,${resumoGeral.aderencia.toFixed(1)}%`,
        '',
        'DADOS POR PERÍODO',
        'Data,Total Pacientes,Com Dose,Sem Dose,Alertas,Dose Média',
        ...dadosGrafico.map(item => 
          `${item.data},${item.total},${item.comDose},${item.semDose},${item.alertas},${item.doseMedia}`
        ),
        '',
        'ESTATÍSTICAS POR TIPO DE ACESSO',
        'Tipo,Quantidade,Percentual,Dose Média',
        ...estatisticasTipo.map(item => 
          `${item.tipo},${item.quantidade},${item.percentual.toFixed(1)}%,${item.doseMedia.toFixed(0)} UI`
        )
      ].join('\n');
      
      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_heparina_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Configurações do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data Início
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data Fim
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo de Relatório
              </label>
              <Select
                value={filtros.tipoRelatorio}
                onChange={(value: string) => 
                  setFiltros(prev => ({ ...prev, tipoRelatorio: value as 'diario' | 'semanal' | 'mensal' }))
                }
                options={[
                  { value: 'diario', label: 'Diário' },
                  { value: 'semanal', label: 'Semanal' },
                  { value: 'mensal', label: 'Mensal' }
                ]}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo de Acesso
              </label>
              <Select
                value={filtros.tipoAcesso}
                onChange={(value) => setFiltros(prev => ({ ...prev, tipoAcesso: value }))}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'FAV', label: 'Fístula Arteriovenosa' },
                  { value: 'CDL', label: 'Cateter de Longa Duração' },
                  { value: 'PC', label: 'Permcath' }
                ]}
                placeholder="Todos os tipos"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={exportarRelatorio}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              <span>Exportar Relatório</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {resumoGeral.totalPacientes}
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
                    <p className="text-sm font-medium text-gray-600">Aderência</p>
                    <p className="text-3xl font-bold text-green-600">
                      {resumoGeral.aderencia.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {resumoGeral.totalDoses} de {resumoGeral.totalPacientes} pacientes
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="h-6 w-6 text-green-600" />
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
                      {resumoGeral.totalAlertas}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dose média: {resumoGeral.doseMediaGeral.toFixed(0)} UI
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Doses de Heparina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="comDose" 
                      stroke={CORES_GRAFICO.comDose} 
                      strokeWidth={2}
                      name="Com Dose"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="semDose" 
                      stroke={CORES_GRAFICO.semDose} 
                      strokeWidth={2}
                      name="Sem Dose"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="alertas" 
                      stroke={CORES_GRAFICO.alertas} 
                      strokeWidth={2}
                      name="Alertas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de Barras e Pizza */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="comDose" fill={CORES_GRAFICO.comDose} name="Com Dose" />
                      <Bar dataKey="semDose" fill={CORES_GRAFICO.semDose} name="Sem Dose" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estatisticasTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.tipo}: ${entry.percentual.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {estatisticasTipo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Detalhadas por Tipo de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Tipo de Acesso</th>
                      <th className="text-left p-3 font-semibold">Quantidade</th>
                      <th className="text-left p-3 font-semibold">Percentual</th>
                      <th className="text-left p-3 font-semibold">Dose Média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estatisticasTipo.map((item, index) => (
                      <tr key={item.tipo} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: CORES_PIE[index % CORES_PIE.length] }}
                            ></div>
                            <span className="font-medium">{item.tipo}</span>
                          </div>
                        </td>
                        <td className="p-3">{item.quantidade}</td>
                        <td className="p-3">{item.percentual.toFixed(1)}%</td>
                        <td className="p-3">{item.doseMedia.toFixed(0)} UI</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}