'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { createSessao } from '../_actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Calendar, User, Monitor, Clock, Weight, Activity, FileText, Loader2 } from 'lucide-react';

interface Paciente {
  id: string;
  nome_completo: string;
  registro: string;
}

interface Maquina {
  id: string;
  identificador: string;
}

export default function NovaSessaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    paciente_id: '',
    maquina_id: '',
    data_sessao: '',
    hora_inicio: '',
    peso_pre: '',
    pressao_arterial_pre: '',
    ultrafiltracao_prescrita: '',
    observacoes: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        const [{ data: pacientesData }, { data: maquinasData }] = await Promise.all([
          supabase
            .from('pacientes')
            .select('id, nome_completo, registro')
            .eq('ativo', true)
            .order('nome_completo'),
          supabase
            .from('maquinas')
            .select('id, identificador')
            .eq('ativa', true)
            .order('identificador'),
        ]);
        
        setPacientes(pacientesData || []);
        setMaquinas(maquinasData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErrors({ geral: 'Erro ao carregar dados necessários' });
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      await createSessao(formData);
      // A função createSessao faz redirect automaticamente em caso de sucesso
    } catch (error) {
      setErrors({ submit: 'Erro ao agendar sessão. Tente novamente.' });
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/sessoes');
  };

  // Preparar opções para os selects
  const pacienteOptions = pacientes.map(p => ({
    value: p.id,
    label: `${p.nome_completo}${p.registro ? ` - ${p.registro}` : ''}`
  }));

  const maquinaOptions = maquinas.map(m => ({
    value: m.id,
    label: m.identificador
  }));

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          Nova Sessão de Hemodiálise
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Agende uma nova sessão para um paciente</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4" />
                Paciente
              </Label>
              <Select
                options={pacienteOptions}
                value={formData.paciente_id}
                onChange={(value) => setFormData(prev => ({ ...prev, paciente_id: value }))}
                placeholder="Selecione um paciente"
                error={errors.paciente_id}
                variant="medical"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Monitor className="h-4 w-4" />
                Máquina
              </Label>
              <Select
                options={maquinaOptions}
                value={formData.maquina_id}
                onChange={(value) => setFormData(prev => ({ ...prev, maquina_id: value }))}
                placeholder="Selecione uma máquina"
                error={errors.maquina_id}
                variant="medical"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_sessao" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data da Sessão *
              </Label>
              <Input
                id="data_sessao"
                name="data_sessao"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                error={errors.data_sessao}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Início *
              </Label>
              <Input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                defaultValue="07:00"
                error={errors.hora_inicio}
                required
              />
            </div>
          </div>

          {/* Dados Pré-Diálise */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dados Pré-Diálise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="peso_pre" className="flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Peso Pré (kg)
                </Label>
                <Input
                  id="peso_pre"
                  name="peso_pre"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70.5"
                  error={errors.peso_pre}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pressao_arterial_pre" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Pressão Arterial Pré
                </Label>
                <Input
                  id="pressao_arterial_pre"
                  name="pressao_arterial_pre"
                  type="text"
                  placeholder="Ex: 120/80"
                  error={errors.pressao_arterial_pre}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultrafiltracao_prescrita" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Ultrafiltração Prescrita (ml)
                </Label>
                <Input
                  id="ultrafiltracao_prescrita"
                  name="ultrafiltracao_prescrita"
                  type="number"
                  placeholder="Ex: 2000"
                  error={errors.ultrafiltracao_prescrita}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="border-t pt-6">
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações
              </Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                rows={4}
                placeholder="Observações sobre a sessão, condições do paciente, etc."
                error={errors.observacoes}
              />
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
              {loading ? 'Agendando...' : 'Agendar Sessão'}
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
                onClick={() => router.push('/sessoes')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Nova Sessão
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Modal isOpen={isModalOpen} onClose={handleClose} size="xl">
          {formContent}
        </Modal>
      </div>
    </div>
  );
}