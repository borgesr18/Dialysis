'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Clock, ArrowUpDown, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';

type HistoricoAlteracao = Database['public']['Tables']['historico_alteracoes_dose']['Row'];
type Paciente = Database['public']['Tables']['pacientes']['Row'];
type PerfilUsuario = Database['public']['Tables']['perfis_usuarios']['Row'];

interface HistoricoCompleto extends HistoricoAlteracao {
  paciente?: Paciente;
  usuario?: PerfilUsuario;
}

interface FiltrosHistorico {
  paciente: string;
  usuario: string;
  dataInicio: string;
  dataFim: string;
  tipoAlteracao: string;
}

export default function HeparinaHistorico() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<HistoricoCompleto[]>([]);
  const [filtros, setFiltros] = useState<FiltrosHistorico>({
    paciente: '',
    usuario: '',
    dataInicio: '',
    dataFim: '',
    tipoAlteracao: ''
  });
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof HistoricoAlteracao;
    direcao: 'asc' | 'desc';
  }>({ campo: 'created_at', direcao: 'desc' });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const itensPorPagina = 20;

  useEffect(() => {
    carregarHistorico();
  }, [filtros, ordenacao, paginaAtual]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('historico_alteracoes_dose')
        .select(`
          *,
          pacientes(
            id,
            nome,
            registro
          ),
          perfis_usuarios(
            id,
            nome,
            email
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (filtros.paciente) {
        query = query.ilike('pacientes.nome', `%${filtros.paciente}%`);
      }
      
      if (filtros.usuario) {
        query = query.ilike('perfis_usuarios.nome', `%${filtros.usuario}%`);
      }
      
      if (filtros.dataInicio) {
        query = query.gte('data_alteracao', filtros.dataInicio);
      }
      
      if (filtros.dataFim) {
        const dataFimFormatada = new Date(filtros.dataFim);
        dataFimFormatada.setHours(23, 59, 59, 999);
        query = query.lte('data_alteracao', dataFimFormatada.toISOString());
      }
      
      if (filtros.tipoAlteracao) {
        query = query.eq('tipo_alteracao', filtros.tipoAlteracao);
      }

      // Aplicar ordenação
      query = query.order(ordenacao.campo, { ascending: ordenacao.direcao === 'asc' });
      
      // Aplicar paginação
      const inicio = (paginaAtual - 1) * itensPorPagina;
      query = query.range(inicio, inicio + itensPorPagina - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setHistorico(data || []);
      setTotalRegistros(count || 0);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: keyof FiltrosHistorico, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaAtual(1); // Reset para primeira página
  };

  const handleOrdenacao = (campo: 'data_alteracao' | 'paciente_id' | 'created_at') => {
    setOrdenacao(prev => ({
      campo: campo as keyof HistoricoAlteracao,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      paciente: '',
      usuario: '',
      dataInicio: '',
      dataFim: '',
      tipoAlteracao: ''
    });
    setPaginaAtual(1);
  };

  const exportarHistorico = async () => {
    try {
      // Buscar todos os registros sem paginação para exportação
      let query = supabase
        .from('historico_alteracoes_dose')
        .select(`
          *,
          pacientes(
            nome,
            registro
          ),
          perfis_usuarios(
            nome,
            email
          )
        `);

      // Aplicar os mesmos filtros
      if (filtros.paciente) {
        query = query.ilike('pacientes.nome', `%${filtros.paciente}%`);
      }
      if (filtros.usuario) {
        query = query.ilike('perfis_usuarios.nome', `%${filtros.usuario}%`);
      }
      if (filtros.dataInicio) {
        query = query.gte('data_alteracao', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        const dataFimFormatada = new Date(filtros.dataFim);
        dataFimFormatada.setHours(23, 59, 59, 999);
        query = query.lte('data_alteracao', dataFimFormatada.toISOString());
      }
      if (filtros.tipoAlteracao) {
        query = query.eq('tipo_alteracao', filtros.tipoAlteracao);
      }

      query = query.order('data_alteracao', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Converter para CSV
      const csvContent = [
        // Cabeçalho
        'Data/Hora,Paciente,Registro,Usuário,Tipo,Valor Anterior,Valor Novo,Observações',
        // Dados
        ...(data || []).map((item: any) => [
          new Date(item.data_alteracao).toLocaleString('pt-BR'),
          item.paciente?.nome || '',
          item.paciente?.registro || '',
          item.usuario?.nome || '',
          formatarTipoAlteracao(item.tipo_alteracao),
          item.valor_anterior || '',
          item.valor_novo || '',
          item.observacoes || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historico_heparina_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
    }
  };

  const formatarTipoAlteracao = (tipo: string) => {
    const tipos = {
      'dose_heparina': 'Dose Heparina',
      'dose_cateter': 'Dose Cateter',
      'observacoes': 'Observações',
      'status': 'Status'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatarValor = (valor: string | null, tipo: string) => {
    if (!valor) return 'N/A';
    
    if (tipo === 'dose_heparina' || tipo === 'dose_cateter') {
      return `${valor} UI`;
    }
    
    return valor;
  };

  const getCorTipoAlteracao = (tipo: string) => {
    const cores = {
      'dose_heparina': 'bg-blue-100 text-blue-800',
      'dose_cateter': 'bg-green-100 text-green-800',
      'observacoes': 'bg-yellow-100 text-yellow-800',
      'status': 'bg-purple-100 text-purple-800'
    };
    return cores[tipo as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Paciente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome do paciente..."
                  value={filtros.paciente}
                  onChange={(e) => handleFiltroChange('paciente', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome do usuário..."
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo de Alteração
              </label>
              <Select 
                value={filtros.tipoAlteracao} 
                onChange={(value) => handleFiltroChange('tipoAlteracao', value)}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'dose_heparina', label: 'Dose Heparina' },
                  { value: 'dose_cateter', label: 'Dose Cateter' },
                  { value: 'observacoes', label: 'Observações' },
                  { value: 'status', label: 'Status' }
                ]}
                placeholder="Todos os tipos"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data Início
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
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
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="flex-1"
              >
                Limpar Filtros
              </Button>
              <Button
                onClick={exportarHistorico}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Histórico de Alterações</span>
            </CardTitle>
            <div className="text-sm text-gray-500">
              {totalRegistros} registro(s) encontrado(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum registro encontrado</p>
            </div>
          ) : (
            <>
              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrdenacao('data_alteracao')}
                          className="flex items-center space-x-1 font-semibold"
                        >
                          <span>Data/Hora</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </th>
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrdenacao('paciente_id')}
                          className="flex items-center space-x-1 font-semibold"
                        >
                          <span>Paciente</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </th>
                      <th className="text-left p-3 font-semibold">Usuário</th>
                      <th className="text-left p-3 font-semibold">Tipo</th>
                      <th className="text-left p-3 font-semibold">Valor Anterior</th>
                      <th className="text-left p-3 font-semibold">Valor Novo</th>
                      <th className="text-left p-3 font-semibold">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((item: any) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(item.data_alteracao).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-gray-500">
                              {new Date(item.data_alteracao).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">{item.paciente?.nome}</div>
                            <div className="text-gray-500">Reg: {item.paciente?.registro}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">{item.usuario?.nome}</div>
                            <div className="text-gray-500">{item.usuario?.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getCorTipoAlteracao(item.tipo_alteracao)}>
                            {formatarTipoAlteracao(item.tipo_alteracao)}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          {formatarValor(item.valor_anterior, item.tipo_alteracao)}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {formatarValor(item.valor_novo, item.tipo_alteracao)}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {item.observacoes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Página {paginaAtual} de {totalPaginas}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                      disabled={paginaAtual === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaAtual === totalPaginas}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}