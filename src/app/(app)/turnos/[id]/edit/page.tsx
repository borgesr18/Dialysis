'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { updateTurno } from '@/app/(app)/turnos/_actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Clock, ArrowLeft, Timer, Calendar, Loader2 } from 'lucide-react';

interface Turno {
  id: string;
  nome: string;
  hora_inicio: string;
  hora_fim: string;
  dias_semana: string[] | null;
}

export default function EditarTurnoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [turno, setTurno] = useState<Turno | null>(null);

  const diasSemana = [
    { value: 'segunda', label: 'Segunda-feira', short: 'Seg' },
    { value: 'terca', label: 'Terça-feira', short: 'Ter' },
    { value: 'quarta', label: 'Quarta-feira', short: 'Qua' },
    { value: 'quinta', label: 'Quinta-feira', short: 'Qui' },
    { value: 'sexta', label: 'Sexta-feira', short: 'Sex' },
    { value: 'sabado', label: 'Sábado', short: 'Sáb' },
    { value: 'domingo', label: 'Domingo', short: 'Dom' },
  ];

  useEffect(() => {
    async function loadTurno() {
      try {
        const supabase = createClient();
        
        // Validar formato UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(params.id)) {
          setErrors({ geral: 'ID inválido' });
          return;
        }

        const { data: turnoData, error } = await supabase
          .from('turnos')
          .select('id, nome, hora_inicio, hora_fim, dias_semana')
          .eq('id', params.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar turno:', error);
          setErrors({ geral: 'Erro ao carregar dados do turno' });
          return;
        }

        if (!turnoData) {
          setErrors({ geral: 'Turno não encontrado' });
          return;
        }

        setTurno(turnoData);
        
        // Configurar dias selecionados
        if (turnoData.dias_semana && Array.isArray(turnoData.dias_semana)) {
          const diasMapeados = turnoData.dias_semana.map(dia => {
            const diaLower = dia.toLowerCase();
            switch(diaLower) {
              case 'seg': case 'segunda': return 'segunda';
              case 'ter': case 'terca': return 'terca';
              case 'qua': case 'quarta': return 'quarta';
              case 'qui': case 'quinta': return 'quinta';
              case 'sex': case 'sexta': return 'sexta';
              case 'sab': case 'sabado': return 'sabado';
              case 'dom': case 'domingo': return 'domingo';
              default: return diaLower;
            }
          }).filter(dia => diasSemana.some(d => d.value === dia));
          
          setSelectedDays(diasMapeados);
        }
      } catch (error) {
        console.error('Erro ao carregar turno:', error);
        setErrors({ geral: 'Erro inesperado ao carregar dados' });
      } finally {
        setLoadingData(false);
      }
    }

    loadTurno();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      await updateTurno(params.id, formData);
      // A função updateTurno faz redirect automaticamente em caso de sucesso
    } catch (error) {
      setErrors({ submit: 'Erro ao atualizar turno. Tente novamente.' });
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados do turno...</span>
        </div>
      </div>
    );
  }

  if (errors.geral && !turno) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{errors.geral}</div>
          <Button onClick={() => router.push('/turnos')}>Voltar para Turnos</Button>
        </div>
      </div>
    );
  }

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          Editar Turno
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
                defaultValue={turno?.nome || ''}
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
                  defaultValue={turno?.hora_inicio || ''}
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
                  defaultValue={turno?.hora_fim || ''}
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
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
                Editar Turno
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
