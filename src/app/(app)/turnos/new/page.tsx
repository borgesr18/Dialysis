'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTurno } from '../_actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Clock, ArrowLeft, Timer, Calendar } from 'lucide-react';

export default function NovoTurnoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const diasSemana = [
    { value: 'segunda', label: 'Segunda-feira', short: 'Seg' },
    { value: 'terca', label: 'Terça-feira', short: 'Ter' },
    { value: 'quarta', label: 'Quarta-feira', short: 'Qua' },
    { value: 'quinta', label: 'Quinta-feira', short: 'Qui' },
    { value: 'sexta', label: 'Sexta-feira', short: 'Sex' },
    { value: 'sabado', label: 'Sábado', short: 'Sáb' },
    { value: 'domingo', label: 'Domingo', short: 'Dom' },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    // Validação básica
    const nome = formData.get('nome') as string;
    const horaInicio = formData.get('hora_inicio') as string;
    const horaFim = formData.get('hora_fim') as string;
    
    const newErrors: Record<string, string> = {};
    
    if (!nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!horaInicio) {
      newErrors.hora_inicio = 'Hora de início é obrigatória';
    }
    
    if (!horaFim) {
      newErrors.hora_fim = 'Hora de fim é obrigatória';
    }
    
    if (horaInicio && horaFim && horaInicio >= horaFim) {
      newErrors.hora_fim = 'Hora de fim deve ser posterior à hora de início';
    }
    
    if (selectedDays.length === 0) {
      newErrors.dias_semana = 'Selecione pelo menos um dia da semana';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    // Adicionar dias selecionados ao FormData
    selectedDays.forEach(day => {
      formData.append('dias_semana', day);
    });
    
    try {
      await createTurno(formData);
      // A função createTurno faz redirect automaticamente em caso de sucesso
    } catch (error) {
      setErrors({ submit: 'Erro ao criar turno. Tente novamente.' });
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/turnos');
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          Novo Turno
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de campos principais */}
          <div className="grid grid-cols-1 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nome do Turno
              </Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Manhã, Tarde, Noite"
                error={errors.nome}
                required
              />
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio" className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Hora de Início
                </Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  error={errors.hora_inicio}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_fim" className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Hora de Fim
                </Label>
                <Input
                  id="hora_fim"
                  name="hora_fim"
                  type="time"
                  error={errors.hora_fim}
                  required
                />
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dias da Semana
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {diasSemana.map((dia) => (
                  <label
                    key={dia.value}
                    className={`
                      flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                      ${
                        selectedDays.includes(dia.value)
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedDays.includes(dia.value)}
                      onChange={() => handleDayToggle(dia.value)}
                    />
                    <span className="text-sm font-medium">{dia.short}</span>
                  </label>
                ))}
              </div>
              {errors.dias_semana && (
                <div className="text-red-600 text-sm">{errors.dias_semana}</div>
              )}
            </div>
          </div>

          {/* Erro geral */}
          {errors.geral && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm font-medium">
                {errors.geral}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Turno'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/turnos')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Novo Turno
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Modal isOpen={isModalOpen} onClose={handleClose} size="lg">
          {formContent}
        </Modal>
      </div>
    </div>
  );
}
