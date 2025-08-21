'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, AlertTriangle, Clock, MapPin, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';
import HeparinaTabelaPacientes from './HeparinaTabelaPacientes';

type Paciente = Database['public']['Tables']['pacientes']['Row'];
type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
type SessaoHemodialise = Database['public']['Tables']['sessoes_hemodialise']['Row'];
type AcessoVascular = Database['public']['Tables']['acessos_vasculares']['Row'];

interface PacienteComDose extends Paciente {
  dose_heparina?: DoseHeparina;
  sessao_atual?: SessaoHemodialise;
  acesso_vascular?: AcessoVascular;
  cidade?: string;
  maquina_numero?: number;
  nome?: string;
  registro?: string;
}

const TURNOS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' }
];

const TIPOS_ACESSO = [
  { value: 'FAV', label: 'FAV' },
  { value: 'CDL', label: 'CDL' },
  { value: 'PC', label: 'PC' }
];

const CIDADES = [
  'BARRA', 'CARUARU', 'SAIRE', 'BELO JARDIM', 'SÃO JOAQUIM',
  'SÃO CAITANO', 'SANTA CRUZ', 'AGRESTINA', 'ALTINHO', 'JATAÚBA'
];

export default function HeparinaConsulta() {
  const { supabase } = useSupabase();
  const [pacientes, setPacientes] = useState<PacienteComDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');
  const [filtroCidade, setFiltroCidade] = useState<string>('');
  const [filtroTipoAcesso, setFiltroTipoAcesso] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      setLoading(true);
      
      // Buscar pacientes com suas informações relacionadas
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select(`
          *,
          doses_heparina(
            id,
            dose_heparina,
            dose_cateter,
            data_prescricao,
            data_aplicacao,
            observacoes,
            status
          ),
          sessoes_hemodialise(
            id,
            turno,
            data_sessao,
            maquina_id,
            status
          ),
          acessos_vasculares(
            id,
            tipo,
            localizacao,
            data_implante,
            status
          )
        `)
        .eq('ativo', true)
        .order('nome');

      if (pacientesError) throw pacientesError;

      // Buscar informações das máquinas para obter números
      const { data: maquinasData } = await supabase
        .from('maquinas')
        .select('id, numero, sala_id, salas(nome)');

      // Processar dados dos pacientes
      const pacientesProcessados = pacientesData?.map((paciente: any) => {
        const sessaoAtual = paciente.sessoes_hemodialise?.[0];
        const maquina = maquinasData?.find((m: any) => m.id === sessaoAtual?.maquina_id);
        
        return {
          ...paciente,
          dose_heparina: paciente.doses_heparina?.[0],
          sessao_atual: sessaoAtual,
          acesso_vascular: paciente.acessos_vasculares?.[0],
          cidade: paciente.cidade || '',
          maquina_numero: maquina?.numero
        };
      }) || [];

      setPacientes(pacientesProcessados);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente: any) => {
      // Filtro de busca por nome ou registro
      const matchSearch = !searchTerm || 
        (paciente.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.registro?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por turno
      const matchTurno = !filtroTurno || paciente.sessao_atual?.turno === filtroTurno;

      // Filtro por cidade
      const matchCidade = !filtroCidade || paciente.cidade === filtroCidade;

      // Filtro por tipo de acesso
      const matchTipoAcesso = !filtroTipoAcesso || paciente.acesso_vascular?.tipo === filtroTipoAcesso;

      return matchSearch && matchTurno && matchCidade && matchTipoAcesso;
    });
  }, [pacientes, searchTerm, filtroTurno, filtroCidade, filtroTipoAcesso]);

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroTurno('');
    setFiltroCidade('');
    setFiltroTipoAcesso('');
  };

  const contadorFiltros = [filtroTurno, filtroCidade, filtroTipoAcesso].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do paciente ou registro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Botão de Filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {contadorFiltros > 0 && (
                <Badge variant="danger" className="ml-2 h-5 w-5 p-0 text-xs">
                  {contadorFiltros}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Turno</label>
                <Select 
                  value={filtroTurno} 
                  onChange={setFiltroTurno}
                  options={[
                    { value: '', label: 'Todos os turnos' },
                    ...TURNOS
                  ]}
                  placeholder="Todos os turnos"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cidade</label>
                <Select 
                  value={filtroCidade} 
                  onChange={setFiltroCidade}
                  options={[
                    { value: '', label: 'Todas as cidades' },
                    ...CIDADES.map(cidade => ({ value: cidade, label: cidade }))
                  ]}
                  placeholder="Todas as cidades"
                  searchable
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Acesso</label>
                <Select 
                  value={filtroTipoAcesso} 
                  onChange={setFiltroTipoAcesso}
                  options={[
                    { value: '', label: 'Todos os tipos' },
                    ...TIPOS_ACESSO
                  ]}
                  placeholder="Todos os tipos"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={limparFiltros}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{pacientesFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Com Dose Prescrita</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pacientesFiltrados.filter((p: any) => p.dose_heparina).length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {pacientesFiltrados.filter((p: any) => !p.dose_heparina).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cidades</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(pacientesFiltrados.map(p => p.cidade).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pacientes */}
      <HeparinaTabelaPacientes 
        pacientes={pacientesFiltrados}
        onDoseUpdate={carregarPacientes}
      />
    </div>
  );
}