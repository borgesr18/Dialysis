'use client';

import React, { useState, useEffect } from 'react';
import { format, addMinutes, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { validarAgendamento, validarEdicao, validarCancelamento, validarConflitosHorario, formatarErrosValidacao } from '@/utils/validacoes-agenda';
import { Calendar, Clock, User, Monitor, AlertCircle, Check, Edit3, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  AgendamentoSessao,
  AtualizarAgendamentoRequest,
  Paciente,
  Maquina,
  Turno,
  StatusAgendamento,
  SlotDisponivel,
  ConflitosAgendamento
} from '@/shared/types';
import { cn } from '@/lib/utils';

interface EditarAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: AgendamentoSessao | null;
  onUpdate: (id: string, dados: AtualizarAgendamentoRequest) => Promise<void>;
  onCancel: (id: string, motivo: string) => Promise<void>;
  pacientes: Paciente[];
  maquinas: Maquina[];
  turnos: Turno[];
  slotsDisponiveis: SlotDisponivel[];
  verificarConflitos: (data: Date, maquinaId: string, pacienteId: string, agendamentoId?: string) => Promise<ConflitosAgendamento>;
}

interface FormData {
  pacienteId: string;
  maquinaId: string;
  turnoId: string;
  dataAgendamento: string;
  horaInicio: string;
  duracaoMinutos: number;
  observacoes: string;
}

type ModoEdicao = 'visualizar' | 'editar' | 'cancelar';

const EditarAgendamento: React.FC<EditarAgendamentoProps> = ({
  isOpen,
  onClose,
  agendamento,
  onUpdate,
  onCancel,
  pacientes,
  maquinas,
  turnos,
  slotsDisponiveis,
  verificarConflitos
}) => {
  const [modo, setModo] = useState<ModoEdicao>('visualizar');
  const [formData, setFormData] = useState<FormData>({
    pacienteId: '',
    maquinaId: '',
    turnoId: '',
    dataAgendamento: '',
    horaInicio: '',
    duracaoMinutos: 240,
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [conflitos, setConflitos] = useState<ConflitosAgendamento | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Opções de duração
  const duracaoOptions = [
    { value: '180', label: '3 horas' },
    { value: '240', label: '4 horas' },
    { value: '300', label: '5 horas' }
  ];

  // Reset form quando modal abre ou agendamento muda
  useEffect(() => {
    if (isOpen && agendamento) {
      setFormData({
        pacienteId: agendamento.paciente_id,
        maquinaId: agendamento.maquina_id,
        turnoId: agendamento.turno_id,
        dataAgendamento: agendamento.data_agendamento,
        horaInicio: agendamento.hora_inicio,
        duracaoMinutos: agendamento.duracao_minutos || 240,
        observacoes: agendamento.observacoes || ''
      });
      setModo('visualizar');
      setErrors({});
      setConflitos(null);
      setMotivoCancelamento('');
    }
  }, [isOpen, agendamento]);

  // Atualizar horários disponíveis quando turno ou data mudam
  useEffect(() => {
    if (formData.turnoId && formData.dataAgendamento && modo === 'editar') {
      const turnoSelecionado = turnos.find(t => t.id === formData.turnoId);
      if (turnoSelecionado) {
        const horarios = gerarHorariosDisponiveis(turnoSelecionado);
        setHorariosDisponiveis(horarios);
      }
    } else {
      setHorariosDisponiveis([]);
    }
  }, [formData.turnoId, formData.dataAgendamento, turnos, modo]);

  // Verificar conflitos quando dados relevantes mudam (apenas no modo editar)
  useEffect(() => {
    if (modo === 'editar' && formData.pacienteId && formData.maquinaId && formData.dataAgendamento && formData.horaInicio && agendamento) {
      verificarConflitosAgendamento();
    }
  }, [formData.pacienteId, formData.maquinaId, formData.dataAgendamento, formData.horaInicio, modo]);

  const gerarHorariosDisponiveis = (turno: Turno): string[] => {
    const horarios: string[] = [];
    const inicio = new Date(`2000-01-01T${turno.hora_inicio}`);
    const fim = new Date(`2000-01-01T${turno.hora_fim}`);
    
    let atual = inicio;
    while (atual < fim) {
      horarios.push(format(atual, 'HH:mm'));
      atual = addMinutes(atual, 30); // Intervalos de 30 minutos
    }
    
    return horarios;
  };

  const verificarConflitosAgendamento = async () => {
    if (!agendamento) return;
    
    try {
      const dataHora = new Date(`${formData.dataAgendamento}T${formData.horaInicio}`);
      const conflitosEncontrados = await verificarConflitos(
        dataHora,
        formData.maquinaId,
        formData.pacienteId,
        agendamento.id // Excluir o próprio agendamento da verificação
      );
      setConflitos(conflitosEncontrados);
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    if (!agendamento) return false;
    
    setIsValidating(true);
    
    try {
      // Verificar se pode ser editado
      const validacaoEdicao = validarEdicao(agendamento);
      if (!validacaoEdicao.valido) {
        const newErrors: Record<string, string> = {};
        validacaoEdicao.erros.forEach(erro => {
          newErrors[erro.campo] = erro.mensagem;
        });
        setErrors(newErrors);
        return false;
      }

      // Validações básicas
      const validacaoBasica = validarAgendamento(formData);
      if (!validacaoBasica.valido) {
        const newErrors: Record<string, string> = {};
        validacaoBasica.erros.forEach(erro => {
          newErrors[erro.campo] = erro.mensagem;
        });
        setErrors(newErrors);
        return false;
      }

      // Verificar conflitos se todos os campos necessários estão preenchidos
      if (formData.pacienteId && formData.maquinaId && formData.dataAgendamento && 
          formData.horaInicio && formData.duracaoMinutos) {
        
        const dataHora = new Date(`${formData.dataAgendamento}T${formData.horaInicio}`);
        const conflitos = await verificarConflitos(
          dataHora,
          formData.maquinaId,
          formData.pacienteId,
          agendamento.id
        );

        if (conflitos.conflitoPaciente || conflitos.conflitoMaquina) {
          const newErrors: Record<string, string> = {};
          
          if (conflitos.conflitoPaciente) {
            newErrors.pacienteId = 'Paciente já possui agendamento neste horário';
          }
          
          if (conflitos.conflitoMaquina) {
            newErrors.maquinaId = 'Máquina já está ocupada neste horário';
          }
          
          setErrors(newErrors);
          return false;
        }
      }

      setErrors({});
      return true;
      
    } catch (error) {
      console.error('Erro na validação:', error);
      setErrors({ geral: 'Erro ao validar dados. Tente novamente.' });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid || !agendamento) {
      return;
    }

    if (conflitos && (conflitos.conflitoPaciente || conflitos.conflitoMaquina)) {
      return;
    }

    setLoading(true);
    
    try {
      const dataHoraInicio = new Date(`${formData.dataAgendamento}T${formData.horaInicio}`);
      const dataHoraFim = addMinutes(dataHoraInicio, formData.duracaoMinutos);

      const dadosAtualizacao: AtualizarAgendamentoRequest = {
        paciente_id: formData.pacienteId,
        maquina_id: formData.maquinaId,
        turno_id: formData.turnoId,
        data_agendamento: formData.dataAgendamento,
        hora_inicio: formData.horaInicio,
        hora_fim: format(dataHoraFim, 'HH:mm'),
        duracao_minutos: formData.duracaoMinutos,
        observacoes: formData.observacoes || undefined
      };

      await onUpdate(agendamento.id, dadosAtualizacao);
      setModo('visualizar');
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!agendamento) return;
    
    // Validar se pode ser cancelado
    const validacaoCancelamento = validarCancelamento(agendamento);
    if (!validacaoCancelamento.valido) {
      const mensagemErro = formatarErrosValidacao(validacaoCancelamento.erros);
      alert(mensagemErro);
      return;
    }
    
    if (!motivoCancelamento.trim()) {
      setErrors({ motivoCancelamento: 'Informe o motivo do cancelamento' });
      return;
    }

    setLoading(true);
    
    try {
      await onCancel(agendamento.id, motivoCancelamento);
      onClose();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!agendamento) {
    return null;
  }

  const paciente = pacientes.find(p => p.id === agendamento.paciente_id);
  const maquina = maquinas.find(m => m.id === agendamento.maquina_id);
  const turno = turnos.find(t => t.id === agendamento.turno_id);

  const pacienteOptions = pacientes.map(p => ({
    value: p.id,
    label: p.nome_completo
  }));

  const maquinaOptions = maquinas
    .filter(m => m.status === 'ativa')
    .map(m => ({
      value: m.id,
      label: `${m.numero} - ${m.modelo}`
    }));

  const turnoOptions = turnos.map(t => ({
    value: t.id,
    label: `${t.nome} (${t.hora_inicio} - ${t.hora_fim})`
  }));

  const horarioOptions = horariosDisponiveis.map(h => ({
    value: h,
    label: h
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {modo === 'visualizar' && <Calendar className="h-5 w-5 text-primary-600" />}
              {modo === 'editar' && <Edit3 className="h-5 w-5 text-primary-600" />}
              {modo === 'cancelar' && <X className="h-5 w-5 text-red-600" />}
              
              {modo === 'visualizar' && 'Detalhes do Agendamento'}
              {modo === 'editar' && 'Editar Agendamento'}
              {modo === 'cancelar' && 'Cancelar Agendamento'}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(agendamento.status)}>
                {getStatusLabel(agendamento.status)}
              </Badge>
              
              {modo === 'visualizar' && agendamento.status === 'agendado' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModo('editar')}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setModo('cancelar')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {modo === 'visualizar' && (
            <div className="space-y-6">
              {/* Informações do Paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Paciente
                  </Label>
                  <p className="text-lg font-medium">{paciente?.nome_completo}</p>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Monitor className="h-4 w-4" />
                    Máquina
                  </Label>
                  <p className="text-lg font-medium">
                    {maquina ? `${maquina.numero} - ${maquina.modelo}` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2">Data</Label>
                  <p className="text-lg font-medium">
                    {format(new Date(agendamento.data_agendamento), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Horário
                  </Label>
                  <p className="text-lg font-medium">
                    {agendamento.hora_inicio} - {agendamento.hora_fim}
                  </p>
                </div>
                
                <div>
                  <Label className="mb-2">Duração</Label>
                  <p className="text-lg font-medium">
                    {Math.floor((agendamento.duracao_minutos || 240) / 60)}h {(agendamento.duracao_minutos || 240) % 60}min
                  </p>
                </div>
              </div>

              {/* Turno */}
              <div>
                <Label className="mb-2">Turno</Label>
                <p className="text-lg font-medium">
                  {turno ? `${turno.nome} (${turno.hora_inicio} - ${turno.hora_fim})` : 'N/A'}
                </p>
              </div>

              {/* Observações */}
              {agendamento.observacoes && (
                <div>
                  <Label className="mb-2">Observações</Label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {agendamento.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          {modo === 'editar' && (
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Paciente */}
              <div className="space-y-2">
                <Label htmlFor="paciente" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Paciente
                </Label>
                <Select
                  options={pacienteOptions}
                  value={formData.pacienteId}
                  onChange={(value) => handleInputChange('pacienteId', value)}
                  placeholder="Selecione um paciente"
                  error={errors.pacienteId}
                  searchable
                />
              </div>

              {/* Máquina */}
              <div className="space-y-2">
                <Label htmlFor="maquina" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Máquina
                </Label>
                <Select
                  options={maquinaOptions}
                  value={formData.maquinaId}
                  onChange={(value) => handleInputChange('maquinaId', value)}
                  placeholder="Selecione uma máquina"
                  error={errors.maquinaId}
                />
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  options={turnoOptions}
                  value={formData.turnoId}
                  onChange={(value) => handleInputChange('turnoId', value)}
                  placeholder="Selecione um turno"
                  error={errors.turnoId}
                />
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.dataAgendamento}
                    onChange={(e) => handleInputChange('dataAgendamento', e.target.value)}
                    error={errors.dataAgendamento}
                    min={isClient ? format(new Date(), 'yyyy-MM-dd') : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horario" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário
                  </Label>
                  <Select
                    options={horarioOptions}
                    value={formData.horaInicio}
                    onChange={(value) => handleInputChange('horaInicio', value)}
                    placeholder="Selecione um horário"
                    error={errors.horaInicio}
                    disabled={!formData.turnoId}
                  />
                </div>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração</Label>
                <Select
                  options={duracaoOptions}
                  value={formData.duracaoMinutos.toString()}
                  onChange={(value) => handleInputChange('duracaoMinutos', parseInt(value))}
                  error={errors.duracaoMinutos}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                />
              </div>

              {/* Alertas de Conflitos */}
              {conflitos && (conflitos.conflitoPaciente || conflitos.conflitoMaquina) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Conflitos Detectados</h4>
                      {conflitos.conflitoPaciente && (
                        <p className="text-sm text-red-700">
                          O paciente já possui um agendamento neste horário.
                        </p>
                      )}
                      {conflitos.conflitoMaquina && (
                        <p className="text-sm text-red-700">
                          A máquina já está ocupada neste horário.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmação sem conflitos */}
              {conflitos && !conflitos.conflitoPaciente && !conflitos.conflitoMaquina && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700">
                      Horário disponível para alteração.
                    </p>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModo('visualizar')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loading || isValidating}
                  disabled={Boolean(conflitos && (conflitos.conflitoPaciente || conflitos.conflitoMaquina))}
                >
                  {loading ? 'Salvando...' : isValidating ? 'Validando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          )}

          {modo === 'cancelar' && (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Confirmar Cancelamento</h4>
                    <p className="text-sm text-red-700">
                      Esta ação não pode ser desfeita. O agendamento será marcado como cancelado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
                <Textarea
                  id="motivo"
                  value={motivoCancelamento}
                  onChange={(e) => {
                    setMotivoCancelamento(e.target.value);
                    if (errors.motivoCancelamento) {
                      setErrors(prev => ({ ...prev, motivoCancelamento: '' }));
                    }
                  }}
                  placeholder="Informe o motivo do cancelamento"
                  error={errors.motivoCancelamento}
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModo('visualizar')}
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  loading={loading}
                  disabled={!motivoCancelamento.trim()}
                >
                  Confirmar Cancelamento
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Modal>
  );
};

export default EditarAgendamento;