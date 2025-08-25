'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { X, Save, AlertTriangle } from 'lucide-react';

interface Paciente {
  id: string;
  nome: string;
  registro: string;
}

interface Sala {
  id: string;
  nome: string;
  descricao: string;
}

interface Turno {
  id: string;
  nome: string;
  hora_inicio: string;
  hora_fim: string;
}

interface Maquina {
  id: string;
  numero: string;
  sala_id: string;
  status: boolean;
  modelo?: string;
}

interface EscalaPaciente {
  id?: string;
  paciente_id: string;
  sala_id: string;
  turno_id: string;
  maquina_id: string;
  dias_semana: number[];
  observacoes?: string;
}

interface FormularioEscalaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingItem?: EscalaPaciente | null;
  pacientes: Paciente[];
  salas: Sala[];
  turnos: Turno[];
  maquinas: Maquina[];
}

const DIAS_SEMANA = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export default function FormularioEscala({
  isOpen,
  onClose,
  onSave,
  editingItem,
  pacientes,
  salas,
  turnos,
  maquinas
}: FormularioEscalaProps) {
  const [formData, setFormData] = useState<EscalaPaciente>({
    paciente_id: '',
    sala_id: '',
    turno_id: '',
    maquina_id: '',
    dias_semana: [],
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflitos, setConflitos] = useState<string[]>([]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        id: editingItem.id,
        paciente_id: editingItem.paciente_id,
        sala_id: editingItem.sala_id,
        turno_id: editingItem.turno_id,
        maquina_id: editingItem.maquina_id,
        dias_semana: editingItem.dias_semana || [],
        observacoes: editingItem.observacoes || ''
      });
    } else {
      setFormData({
        paciente_id: '',
        sala_id: '',
        turno_id: '',
        maquina_id: '',
        dias_semana: [],
        observacoes: ''
      });
    }
    setErrors({});
    setConflitos([]);
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (formData.paciente_id && formData.turno_id) {
      verificarConflitos();
    }
  }, [formData.paciente_id, formData.turno_id]);

  const supabase = createClient();
  const { clinicId } = useAuth();

  const verificarConflitos = async () => {
    try {
      if (!clinicId) return;
      
      const { data, error } = await supabase
        .from('escala_pacientes')
        .select(`
          id,
          paciente_id,
          turno_id,
          dias_semana,
          paciente:pacientes(nome_completo),
          turno:turnos(nome)
        `)
        .eq('paciente_id', formData.paciente_id)
        .eq('turno_id', formData.turno_id)
        .eq('clinica_id', clinicId)
        .neq('id', formData.id || '');

      if (error) throw error;

      if (data && data.length > 0) {
        const conflitosEncontrados = data.map((item: any) => 
          `Paciente já agendado no turno ${item.turno.nome}`
        );
        setConflitos(conflitosEncontrados);
      } else {
        setConflitos([]);
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    }
  };

  const maquinasDisponiveis = maquinas.filter(maquina => 
    maquina.sala_id === formData.sala_id && maquina.status === true
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente_id) {
      newErrors.paciente_id = 'Selecione um paciente';
    }
    if (!formData.sala_id) {
      newErrors.sala_id = 'Selecione uma sala';
    }
    if (!formData.turno_id) {
      newErrors.turno_id = 'Selecione um turno';
    }
    if (!formData.maquina_id) {
      newErrors.maquina_id = 'Selecione uma máquina';
    }
    if (formData.dias_semana.length === 0) {
      newErrors.dias_semana = 'Selecione pelo menos um dia da semana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (conflitos.length > 0) {
      toast.error('Resolva os conflitos antes de salvar');
      return;
    }

    setLoading(true);
    
    try {
      if (!clinicId) {
        toast.error('Erro: Usuário não possui clínica associada');
        return;
      }
      
      const dataToSave = {
        paciente_id: formData.paciente_id,
        sala_id: formData.sala_id,
        turno_id: formData.turno_id,
        maquina_id: formData.maquina_id,
        dias_semana: formData.dias_semana,
        observacoes: formData.observacoes || null,
        clinica_id: clinicId
      };

      let result;
      if (editingItem?.id) {
        result = await supabase
          .from('escala_pacientes')
          .update(dataToSave)
          .eq('id', editingItem.id);
      } else {
        result = await supabase
          .from('escala_pacientes')
          .insert([dataToSave]);
      }

      if (result.error) throw result.error;

      toast.success(
        editingItem ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!'
      );
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDiaChange = (dia: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        dias_semana: [...prev.dias_semana, dia]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dias_semana: prev.dias_semana.filter(d => d !== dia)
      }));
    }
  };

  const handleDelete = async () => {
    if (!editingItem?.id) return;
    
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('escala_pacientes')
        .delete()
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Agendamento excluído com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingItem ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conflitos */}
          {conflitos.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Conflitos encontrados:</span>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {conflitos.map((conflito, index) => (
                  <li key={index}>• {conflito}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paciente *
              </label>
              <Select
                options={pacientes.map(paciente => ({
                  value: paciente.id,
                  label: paciente.nome
                }))}
                value={formData.paciente_id}
                onChange={(value: string) => setFormData(prev => ({ ...prev, paciente_id: value }))}
                placeholder="Selecione um paciente"
                error={errors.paciente_id}
                searchable
              />
              {errors.paciente_id && (
                <p className="text-red-500 text-sm mt-1">{errors.paciente_id}</p>
              )}
            </div>

            {/* Sala */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sala *
              </label>
              <Select
                options={salas.map(sala => ({
                  value: sala.id,
                  label: sala.nome
                }))}
                value={formData.sala_id}
                onChange={(value: string) => {
                  setFormData(prev => ({ ...prev, sala_id: value, maquina_id: '' }));
                }}
                placeholder="Selecione uma sala"
                error={errors.sala_id}
                searchable
              />
              {errors.sala_id && (
                <p className="text-red-500 text-sm mt-1">{errors.sala_id}</p>
              )}
            </div>

            {/* Turno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Turno *
              </label>
              <Select
                options={turnos.map(turno => ({
                  value: turno.id,
                  label: `${turno.nome} (${turno.hora_inicio} - ${turno.hora_fim})`
                }))}
                value={formData.turno_id}
                onChange={(value: string) => setFormData(prev => ({ ...prev, turno_id: value }))}
                placeholder="Selecione um turno"
                error={errors.turno_id}
                searchable
              />
              {errors.turno_id && (
                <p className="text-red-500 text-sm mt-1">{errors.turno_id}</p>
              )}
            </div>

            {/* Máquina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máquina *
              </label>
              <Select
                options={maquinasDisponiveis.map(maquina => ({
                  value: maquina.id,
                  label: `Máquina ${maquina.numero}`
                }))}
                value={formData.maquina_id}
                onChange={(value: string) => setFormData(prev => ({ ...prev, maquina_id: value }))}
                placeholder="Selecione uma máquina"
                error={errors.maquina_id}
                disabled={!formData.sala_id}
                searchable
              />
              {errors.maquina_id && (
                <p className="text-red-500 text-sm mt-1">{errors.maquina_id}</p>
              )}
            </div>
          </div>

          {/* Dias da Semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Dias da Semana *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIAS_SEMANA.map(dia => (
                <Checkbox
                  key={dia.value}
                  id={String(dia.value)}
                  checked={formData.dias_semana.includes(dia.value)}
                  onChange={(checked: boolean) => handleDiaChange(dia.value, checked)}
                  label={dia.label}
                />
              ))}
            </div>
            {errors.dias_semana && (
              <p className="text-red-500 text-sm mt-1">{errors.dias_semana}</p>
            )}
          </div>

          {/* Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observação
            </label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {editingItem && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Excluir
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
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
                disabled={loading || conflitos.length > 0}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}