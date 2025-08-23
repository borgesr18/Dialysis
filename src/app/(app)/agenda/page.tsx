'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CalendarioAgenda } from '@/components/agenda/CalendarioAgenda';
import FormularioAgendamento from '@/components/agenda/FormularioAgendamento';
import EditarAgendamento from '@/components/agenda/EditarAgendamento';
import FiltrosAgenda from '@/components/agenda/FiltrosAgenda';
import { agendamentosService } from '@/services/agendamentos';
import { pacientesService } from '@/services/pacientes';
import { maquinasService } from '@/services/maquinas';
import { turnosService } from '@/services/turnos';
import {
  AgendamentoSessao,
  EventoCalendario,
  CriarAgendamentoRequest,
  AtualizarAgendamentoRequest,
  Paciente,
  Maquina,
  Turno,
  StatusAgendamento,
  TipoVisualizacaoCalendario,
  SlotDisponivel,
  ConflitosAgendamento,
  FiltrosAgendamento
} from '@/shared/types';
// Removida importação de validação inexistente
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function AgendaPage() {
  const { user, clinicId } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoSessao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<SlotDisponivel[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  const [modalEditarAgendamento, setModalEditarAgendamento] = useState(false);
  const [modalFiltros, setModalFiltros] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoSessao | null>(null);
  
  const [visualizacao, setVisualizacao] = useState<TipoVisualizacaoCalendario>('mensal' as TipoVisualizacaoCalendario);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtros, setFiltros] = useState<FiltrosAgendamento>({});
  
  // Estatísticas
  const [estatisticas, setEstatisticas] = useState<Record<StatusAgendamento, number>>({} as Record<StatusAgendamento, number>);

  // Carregar dados iniciais
  useEffect(() => {
    if (clinicId) {
      carregarDadosIniciais();
    }
  }, [clinicId]);

  // Recarregar agendamentos quando a data ou filtros mudam
  useEffect(() => {
    if (clinicId) {
      carregarAgendamentos();
    }
  }, [dataAtual, visualizacao, filtros, clinicId]);

  // Carregar estatísticas separadamente
  useEffect(() => {
    if (clinicId && agendamentos.length >= 0) {
      carregarEstatisticas();
    }
  }, [clinicId, dataAtual, agendamentos]);

  const carregarDadosIniciais = async () => {
    if (!clinicId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Carregar dados em paralelo
      const [pacientesRes, maquinasRes, turnosRes] = await Promise.all([
        pacientesService.listarPacientes(clinicId),
        maquinasService.listarMaquinas(clinicId),
        turnosService.listarTurnos(clinicId)
      ]);

      if (pacientesRes.error) {
        throw new Error('Erro ao carregar pacientes: ' + pacientesRes.error.message);
      }
      if (maquinasRes.error) {
        throw new Error('Erro ao carregar máquinas: ' + maquinasRes.error.message);
      }
      if (turnosRes.error) {
        throw new Error('Erro ao carregar turnos: ' + turnosRes.error.message);
      }

      setPacientes(pacientesRes.data || []);
      setMaquinas(maquinasRes.data || []);
      setTurnos(turnosRes.data || []);
      
      // Carregar agendamentos
      await carregarAgendamentos();
      
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const carregarAgendamentos = async () => {
    if (!clinicId) return;
    
    try {
      // Calcular período baseado na visualização e filtros
      let dataInicio: Date;
      let dataFim: Date;
      
      if (filtros.dataInicio && filtros.dataFim) {
        dataInicio = filtros.dataInicio;
        dataFim = filtros.dataFim;
      } else {
        switch (visualizacao) {
          case 'mensal' as TipoVisualizacaoCalendario:
            dataInicio = startOfMonth(dataAtual);
            dataFim = endOfMonth(dataAtual);
            break;
          case 'semanal' as TipoVisualizacaoCalendario:
            dataInicio = startOfWeek(dataAtual, { locale: ptBR });
            dataFim = endOfWeek(dataAtual, { locale: ptBR });
            break;
          case 'diaria' as TipoVisualizacaoCalendario:
            dataInicio = dataAtual;
            dataFim = dataAtual;
            break;
          default:
            dataInicio = startOfMonth(dataAtual);
            dataFim = endOfMonth(dataAtual);
        }
      }

      const { data, error } = await agendamentosService.obterAgendamentosPorPeriodo(
        clinicId,
        dataInicio,
        dataFim
      );

      if (error) {
        throw new Error('Erro ao carregar agendamentos: ' + error.message);
      }

      let agendamentosFiltrados = data || [];

      // Aplicar filtros adicionais
      if (filtros.pacienteId) {
        agendamentosFiltrados = agendamentosFiltrados.filter(
          a => a.paciente_id === filtros.pacienteId
        );
      }

      if (filtros.maquinaId) {
        agendamentosFiltrados = agendamentosFiltrados.filter(
          a => a.maquina_id === filtros.maquinaId
        );
      }

      if (filtros.turnoId) {
        agendamentosFiltrados = agendamentosFiltrados.filter(
          a => a.turno_id === filtros.turnoId
        );
      }

      if (filtros.status) {
        agendamentosFiltrados = agendamentosFiltrados.filter(
          a => a.status === filtros.status
        );
      }

      if (filtros.buscarTexto) {
        const busca = filtros.buscarTexto.toLowerCase();
        agendamentosFiltrados = agendamentosFiltrados.filter(a => 
          a.pacientes?.nome_completo.toLowerCase().includes(busca) ||
          a.maquinas?.identificador?.toString().toLowerCase().includes(busca) ||
          a.maquinas?.modelo?.toLowerCase().includes(busca) ||
          a.maquinas?.marca?.toLowerCase().includes(busca) ||
          a.observacoes?.toLowerCase().includes(busca)
        );
      }

      setAgendamentos(agendamentosFiltrados);
      
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
    }
  };

  const carregarEstatisticas = async () => {
    if (!clinicId) return;
    
    try {
      const { data, error } = await agendamentosService.contarAgendamentosPorStatus(
        clinicId,
        startOfMonth(dataAtual),
        endOfMonth(dataAtual)
      );

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }

      setEstatisticas(data || {} as Record<StatusAgendamento, number>);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const verificarConflitos = useCallback(async (
    data: Date,
    maquinaId: string,
    pacienteId: string,
    agendamentoId?: string
  ): Promise<ConflitosAgendamento> => {
    if (!clinicId) {
      return { conflitoPaciente: false, conflitoMaquina: false };
    }
    
    return await agendamentosService.verificarConflitos(
      data,
      maquinaId,
      pacienteId,
      agendamentoId
    );
  }, [clinicId]);

  const handleCriarAgendamento = async (dados: CriarAgendamentoRequest) => {
    if (!clinicId) return;
    
    try {
      const { data, error } = await agendamentosService.criarAgendamento({
        ...dados,
        clinica_id: clinicId
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar agendamento');
      }

      // Recarregar agendamentos
      await carregarAgendamentos();
      setModalNovoAgendamento(false);
      
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      throw err;
    }
  };

  const handleAtualizarAgendamento = async (id: string, dados: AtualizarAgendamentoRequest) => {
    if (!clinicId) return;
    
    try {
      const { data, error } = await agendamentosService.atualizarAgendamento(
        id,
        dados,
        clinicId
      );

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar agendamento');
      }

      // Recarregar agendamentos
      await carregarAgendamentos();
      
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      throw err;
    }
  };

  const handleCancelarAgendamento = async (id: string, motivo: string) => {
    if (!clinicId) return;
    
    try {
      const { data, error } = await agendamentosService.cancelarAgendamento(
        id,
        motivo,
        clinicId
      );

      if (error) {
        throw new Error(error.message || 'Erro ao cancelar agendamento');
      }

      // Recarregar agendamentos
      await carregarAgendamentos();
      
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      throw err;
    }
  };

  const handleEventoClick = (evento: EventoCalendario) => {
    const agendamento = agendamentos.find(a => a.id === evento.id);
    if (agendamento) {
      setAgendamentoSelecionado(agendamento);
      setModalEditarAgendamento(true);
    }
  };

  const handleSlotClick = (slotInfo: any) => {
    setModalNovoAgendamento(true);
  };

  const handleFiltrosChange = async (novosFiltros: FiltrosAgendamento) => {
    try {
      // Validação simples inline
      const newErrors: Record<string, string> = {};
      
      // Verificar se data início não é maior que data fim
      if (novosFiltros.dataInicio && novosFiltros.dataFim && 
          novosFiltros.dataInicio > novosFiltros.dataFim) {
        newErrors.dataInicio = 'Data de início não pode ser maior que data de fim';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setValidationErrors(newErrors);
        return;
      }

      setValidationErrors({});
      setFiltros(novosFiltros);
      
    } catch (error) {
      console.error('Erro na validação dos filtros:', error);
      setError('Erro ao aplicar filtros. Tente novamente.');
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.pacienteId) count++;
    if (filtros.maquinaId) count++;
    if (filtros.turnoId) count++;
    if (filtros.status) count++;
    if (filtros.dataInicio) count++;
    if (filtros.dataFim) count++;
    if (filtros.buscarTexto) count++;
    return count;
  };

  // Converter agendamentos para eventos do calendário
  const eventos: EventoCalendario[] = agendamentos.map(agendamento => ({
    id: agendamento.id,
    title: `${agendamento.pacientes?.nome_completo} - Máq. ${agendamento.maquinas?.identificador}`,
    start: new Date(`${agendamento.data_agendamento}T${agendamento.hora_inicio}`),
    end: new Date(`${agendamento.data_agendamento}T${agendamento.hora_fim}`),
    resource: {
      agendamento,
      paciente: agendamento.pacientes?.nome_completo || '',
      maquina: `${agendamento.maquinas?.identificador} - ${agendamento.maquinas?.modelo ?? ''}`.trim(),
      status: agendamento.status
    }
  }));

  const getStatusBadgeVariant = (status: StatusAgendamento) => {
    switch (status) {
      case 'agendado':
        return 'default';
      case 'confirmado':
        return 'success';
      case 'em_andamento':
        return 'warning';
      case 'concluido':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'faltou':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: StatusAgendamento) => {
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      faltou: 'Faltou'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando agenda...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Erro ao carregar agenda</h3>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
            <Button onClick={carregarDadosIniciais} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary-600" />
            Agenda
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setModalFiltros(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {contarFiltrosAtivos() > 0 && (
              <Badge variant="default" className="ml-1">
                {contarFiltrosAtivos()}
              </Badge>
            )}
          </Button>
          
          <Button
            onClick={() => setModalNovoAgendamento(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
          
          <Button
            variant="outline"
            onClick={carregarAgendamentos}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Exibir erros */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="text-red-800 font-medium mb-2">Erros de validação:</h4>
          {Object.entries(validationErrors).map(([campo, mensagem]) => (
            <p key={campo} className="text-red-800 text-sm">{mensagem}</p>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(estatisticas).map(([status, count]) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {getStatusLabel(status as StatusAgendamento)}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(status as StatusAgendamento)}>
                {count}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          <CalendarioAgenda
            eventos={eventos}
            agendamentos={agendamentos}
            visualizacao={visualizacao}
            onVisualizacaoChange={setVisualizacao}
            onEventoClick={handleEventoClick}
            onSlotClick={handleSlotClick}
          />
        </CardContent>
      </Card>

      {/* Modal Novo Agendamento */}
      <FormularioAgendamento
        isOpen={modalNovoAgendamento}
        onClose={() => setModalNovoAgendamento(false)}
        onSubmit={handleCriarAgendamento}
        pacientes={pacientes}
        maquinas={maquinas}
        turnos={turnos}
        slotsDisponiveis={slotsDisponiveis}
        verificarConflitos={verificarConflitos}
      />

      {/* Modal Editar Agendamento */}
      <EditarAgendamento
        isOpen={modalEditarAgendamento}
        onClose={() => {
          setModalEditarAgendamento(false);
          setAgendamentoSelecionado(null);
        }}
        agendamento={agendamentoSelecionado}
        onUpdate={handleAtualizarAgendamento}
        onCancel={handleCancelarAgendamento}
        pacientes={pacientes}
        maquinas={maquinas}
        turnos={turnos}
        slotsDisponiveis={slotsDisponiveis}
        verificarConflitos={verificarConflitos}
      />

      {/* Modal Filtros */}
      <FiltrosAgenda
        isOpen={modalFiltros}
        onClose={() => setModalFiltros(false)}
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        pacientes={pacientes}
        maquinas={maquinas}
        turnos={turnos}
        onLimparFiltros={handleLimparFiltros}
      />
    </div>
  );
}
