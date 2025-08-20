'use client';

import React, { useState, useEffect } from 'react';
import { format, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { validarAgendamento, validarConflitosHorario, formatarErrosValidacao } from '@/utils/validacoes-agenda';
import { Calendar, Clock, User, Monitor, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  CriarAgendamentoRequest,
  Paciente,
  Maquina,
  Turno,
  StatusAgendamento,
  SlotDisponivel,
  ConflitosAgendamento
} from '@/shared/types';
import { cn } from '@/lib/utils';

interface FormularioAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agendamento: CriarAgendamentoRequest) => Promise<void>;
  dataInicial?: Date;
  pacientes: Paciente[];
  maquinas: Maquina[];
  turnos: Turno[];
  slotsDisponiveis: SlotDisponivel[];
  verificarConflitos: (data: Date, maquinaId: string, pacienteId: string) => Promise<ConflitosAgendamento>;
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

const FormularioAgendamento: React.FC<FormularioAgendamentoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dataInicial,
  pacientes,
  maquinas,
  turnos,
  slotsDisponiveis,
  verificarConflitos
}) => {
  const [formData, setFormData] = useState<FormData>({
    pacienteId: '',
    maquinaId: '',
    turnoId: '',
    dataAgendamento: dataInicial ? format(dataInicial, 'yyyy-MM-dd') : '',
    horaInicio: '',
    duracaoMinutos: 240, // 4 horas padrão
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [conflitos, setConflitos] = useState<ConflitosAgendamento | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
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

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        pacienteId: '',
        maquinaId: '',
        turnoId: '',
        dataAgendamento: dataInicial ? format(dataInicial, 'yyyy-MM-dd') : '',
        horaInicio: '',
        duracaoMinutos: 240,
        observacoes: ''
      });
      setErrors({});
      setConflitos(null);
    }
  }, [isOpen, dataInicial]);

  // Atualizar horários disponíveis quando turno ou data mudam
  useEffect(() => {
    if (formData.turnoId && formData.dataAgendamento) {
      const turnoSelecionado = turnos.find(t => t.id === formData.turnoId);
      if (turnoSelecionado) {
        const horarios = gerarHorariosDisponiveis(turnoSelecionado);
        setHorariosDisponiveis(horarios);
      }
    } else {
      setHorariosDisponiveis([]);
    }
  }, [formData.turnoId, formData.dataAgendamento, turnos]);

  // Verificar conflitos quando dados relevantes mudam
  useEffect(() => {
    if (formData.pacienteId && formData.maquinaId && formData.dataAgendamento && formData.horaInicio) {
      verificarConflitosAgendamento();
    }
  }, [formData.pacienteId, formData.maquinaId, formData.dataAgendamento, formData.horaInicio]);

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
    try {
      const dataHora = new Date(`${formData.dataAgendamento}T${formData.horaInicio}`);
      const conflitosEncontrados = await verificarConflitos(
        dataHora,
        formData.maquinaId,
        formData.pacienteId
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
    setIsValidating(true);
    
    try {
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
          formData.pacienteId
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    if (conflitos && (conflitos.conflitoPaciente || conflitos.conflitoMaquina)) {
      return;
    }

    setLoading(true);
    
    try {
      const dataHoraInicio = new Date(`${formData.dataAgendamento}T${formData.horaInicio}`);
      const dataHoraFim = addMinutes(dataHoraInicio, formData.duracaoMinutos);

      const agendamento: CriarAgendamentoRequest = {
        paciente_id: formData.pacienteId,
        maquina_id: formData.maquinaId,
        turno_id: formData.turnoId,
        data_agendamento: formData.dataAgendamento,
        hora_inicio: formData.horaInicio,
        hora_fim: format(dataHoraFim, 'HH:mm'),
        duracao_minutos: formData.duracaoMinutos,
        observacoes: formData.observacoes || undefined
      };

      await onSubmit(agendamento);
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setErrors({ geral: 'Erro ao criar agendamento. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Agendar Nova Sessão
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Erro geral */}
            {errors.geral && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-800 text-sm font-medium">
                  {errors.geral}
                </div>
              </div>
            )}

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
                    Horário disponível para agendamento.
                  </p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading || isValidating}
                disabled={loading || isValidating || Boolean(conflitos && (conflitos.conflitoPaciente || conflitos.conflitoMaquina))}
              >
                {loading ? 'Criando...' : isValidating ? 'Validando...' : 'Agendar Sessão'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default FormularioAgendamento;