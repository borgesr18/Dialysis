'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Filter, X, Search, Calendar, User, Monitor, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { FiltrosAgendamento, StatusAgendamento, Paciente, Maquina, Turno } from '@/shared/types';

interface FiltrosAgendaProps {
  isOpen: boolean;
  onClose: () => void;
  filtros: FiltrosAgendamento;
  onFiltrosChange: (filtros: FiltrosAgendamento) => void;
  pacientes: Paciente[];
  maquinas: Maquina[];
  turnos: Turno[];
  onLimparFiltros?: () => void;
}

const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'faltou', label: 'Faltou' }
];

export function FiltrosAgenda({
  isOpen,
  onClose,
  filtros,
  onFiltrosChange,
  pacientes,
  maquinas,
  turnos,
  onLimparFiltros,
}: FiltrosAgendaProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosAgendamento>(filtros);
  const [buscarPaciente, setBuscarPaciente] = useState('');
  const [buscarMaquina, setBuscarMaquina] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  const handleFiltroChange = (campo: keyof FiltrosAgendamento, valor: any) => {
    setFiltrosLocais(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleAplicarFiltros = async () => {
    setIsValidating(true);
    
    try {
      // Validação simples inline
      const newErrors: Record<string, string> = {};
      
      // Validar se data início não é maior que data fim
      if (filtrosLocais.dataInicio && filtrosLocais.dataFim) {
        if (filtrosLocais.dataInicio > filtrosLocais.dataFim) {
          newErrors.dataInicio = 'Data de início não pode ser maior que data de fim';
        }
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      onFiltrosChange(filtrosLocais);
      onClose();
      
    } catch (error) {
      console.error('Erro na validação dos filtros:', error);
      setErrors({ geral: 'Erro ao validar filtros. Tente novamente.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLimparFiltros = () => {
    const filtrosVazios: FiltrosAgendamento = {
      pacienteId: undefined,
      maquinaId: undefined,
      turnoId: undefined,
      status: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      buscarTexto: undefined
    };
    setFiltrosLocais(filtrosVazios);
    onFiltrosChange(filtrosVazios);
    setBuscarPaciente('');
    setBuscarMaquina('');
    
    // Chamar callback externo se fornecido
    if (onLimparFiltros) {
      onLimparFiltros();
    }
    
    onClose();
  };

  // Filtrar pacientes baseado na busca
  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome_completo.toLowerCase().includes(buscarPaciente.toLowerCase()) ||
    paciente.cpf?.includes(buscarPaciente)
  );

  // Filtrar máquinas baseado na busca
  const maquinasFiltradas = maquinas.filter(maquina =>
    maquina.numero?.toString().includes(buscarMaquina) ||
    maquina.modelo?.toLowerCase().includes(buscarMaquina.toLowerCase())
  );

  const pacienteOptions = pacientesFiltrados.map(paciente => ({
    value: paciente.id,
    label: `${paciente.nome_completo} - ${paciente.cpf}`
  }));

  const maquinaOptions = maquinasFiltradas.map(maquina => ({
    value: maquina.id,
    label: `Máquina ${maquina.numero} - ${maquina.modelo}`
  }));

  const turnoOptions = turnos.map(turno => ({
    value: turno.id,
    label: `${turno.nome} (${turno.hora_inicio} - ${turno.hora_fim})`
  }));

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

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary-600" />
              Filtros da Agenda
              {filtrosAtivos > 0 && (
                <Badge variant="default" className="ml-2">
                  {filtrosAtivos} ativo{filtrosAtivos > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Busca Geral */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Busca Geral
            </label>
            <Input
              placeholder="Buscar por nome do paciente, máquina, observações..."
              value={filtrosLocais.buscarTexto || ''}
              onChange={(e) => handleFiltroChange('buscarTexto', e.target.value || undefined)}
            />
          </div>

          {/* Filtros por Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Início
              </label>
              <Input
                type="date"
                value={isClient && filtrosLocais.dataInicio ? format(filtrosLocais.dataInicio, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFiltroChange('dataInicio', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Fim
              </label>
              <Input
                type="date"
                value={isClient && filtrosLocais.dataFim ? format(filtrosLocais.dataFim, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFiltroChange('dataFim', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Filtro por Paciente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Paciente
            </label>
            <div className="space-y-2">
              <Input
                placeholder="Buscar paciente por nome ou CPF..."
                value={buscarPaciente}
                onChange={(e) => setBuscarPaciente(e.target.value)}
              />
              <Select
                options={pacienteOptions}
                value={filtrosLocais.pacienteId}
                onChange={(value) => handleFiltroChange('pacienteId', value)}
                placeholder="Selecione um paciente"
                searchable
              />
            </div>
          </div>

          {/* Filtro por Máquina */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Máquina
            </label>
            <div className="space-y-2">
              <Input
                placeholder="Buscar máquina por número ou modelo..."
                value={buscarMaquina}
                onChange={(e) => setBuscarMaquina(e.target.value)}
              />
              <Select
                options={maquinaOptions}
                value={filtrosLocais.maquinaId}
                onChange={(value) => handleFiltroChange('maquinaId', value)}
                placeholder="Selecione uma máquina"
                searchable
              />
            </div>
          </div>

          {/* Filtro por Turno */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Turno
            </label>
            <Select
              options={turnoOptions}
              value={filtrosLocais.turnoId}
              onChange={(value) => handleFiltroChange('turnoId', value)}
              placeholder="Selecione um turno"
            />
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              options={statusOptions}
              value={filtrosLocais.status}
              onChange={(value) => handleFiltroChange('status', value as StatusAgendamento)}
              placeholder="Selecione um status"
            />
          </div>

          {/* Exibir erros */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              {Object.entries(errors).map(([campo, mensagem]) => (
                <div key={campo} className="text-red-800 text-sm">
                  {mensagem}
                </div>
              ))}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleLimparFiltros}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAplicarFiltros}
                disabled={isValidating}
                loading={isValidating}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {isValidating ? 'Validando...' : 'Aplicar Filtros'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}

export default FiltrosAgenda;