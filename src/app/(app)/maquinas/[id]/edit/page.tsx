'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMaquina } from '../../_actions';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Monitor, ArrowLeft, Building, Hash, Tag, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

interface Maquina {
  id: string;
  sala_id: string;
  identificador: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  ativa: boolean;
}

interface Sala {
  id: string;
  nome: string;
}

export default function EditarMaquinaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [maquina, setMaquina] = useState<Maquina | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Carregar dados da máquina e salas
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // Validar formato UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(params.id)) {
          setErrors({ geral: 'ID inválido' });
          return;
        }

        const [{ data: maquinaData, error: maquinaError }, { data: salasData, error: salasError }] = await Promise.all([
          supabase
            .from('maquinas')
            .select('id, sala_id, identificador, marca, modelo, numero_serie, ativa')
            .eq('id', params.id)
            .maybeSingle(),
          supabase
            .from('salas')
            .select('id, nome')
            .order('nome')
        ]);

        if (maquinaError) {
          console.error('Erro ao carregar máquina:', maquinaError);
          setErrors({ geral: 'Erro ao carregar dados da máquina' });
          return;
        }

        if (!maquinaData) {
          setErrors({ geral: 'Máquina não encontrada' });
          return;
        }

        if (salasError) {
          console.error('Erro ao carregar salas:', salasError);
        }

        setMaquina(maquinaData);
        setSalas(salasData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErrors({ geral: 'Erro inesperado ao carregar dados' });
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validação básica
      const identificador = formData.get('identificador') as string;
      const salaId = formData.get('sala_id') as string;
      const marca = formData.get('marca') as string;
      const modelo = formData.get('modelo') as string;
      const numeroSerie = formData.get('numero_serie') as string;
      const ativa = formData.get('ativa') as string;
      
      const newErrors: Record<string, string> = {};
      
      if (!identificador?.trim()) {
        newErrors.identificador = 'Identificador é obrigatório';
      }
      
      if (!salaId) {
        newErrors.sala_id = 'Sala é obrigatória';
      }
      
      if (!marca?.trim()) {
        newErrors.marca = 'Marca é obrigatória';
      }
      
      if (!modelo?.trim()) {
        newErrors.modelo = 'Modelo é obrigatório';
      }
      
      if (!numeroSerie?.trim()) {
        newErrors.numero_serie = 'Número de série é obrigatório';
      }
      
      if (!ativa) {
        newErrors.ativa = 'Status é obrigatório';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      await updateMaquina(params.id, formData);
    } catch (error) {
      console.error('Erro ao atualizar máquina:', error);
      setErrors({ geral: 'Erro interno do servidor' });
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/maquinas');
  };

  const salaOptions = salas.map(sala => ({
    value: sala.id,
    label: sala.nome
  }));

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da máquina...</p>
        </div>
      </div>
    );
  }

  if (errors.geral && !maquina) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{errors.geral}</p>
          </div>
          <Button onClick={() => router.push('/maquinas')}>
            Voltar para Máquinas
          </Button>
        </div>
      </div>
    );
  }

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary-600" />
          Editar Máquina
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de campos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identificador */}
            <div className="space-y-2">
              <Label htmlFor="identificador" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Identificador
              </Label>
              <Input
                id="identificador"
                name="identificador"
                placeholder="Ex: M001"
                defaultValue={maquina?.identificador || ''}
                error={errors.identificador}
                required
              />
            </div>

            {/* Sala */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building className="h-4 w-4" />
                Sala
              </Label>
              <Select
                placeholder="Selecione uma sala"
                options={salaOptions}
                value={maquina?.sala_id}
                onChange={(value) => setMaquina(prev => prev ? { ...prev, sala_id: value } : null)}
                error={errors.sala_id}
                variant="medical"
              />
              <input type="hidden" name="sala_id" value={maquina?.sala_id} />
            </div>
          </div>

          {/* Grid de especificações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Marca
              </Label>
              <Input
                id="marca"
                name="marca"
                placeholder="Ex: Fresenius"
                defaultValue={maquina?.marca || ''}
                error={errors.marca}
                required
              />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Modelo
              </Label>
              <Input
                id="modelo"
                name="modelo"
                placeholder="Ex: 4008S"
                defaultValue={maquina?.modelo || ''}
                error={errors.modelo}
                required
              />
            </div>
          </div>

          {/* Grid de identificação e status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número de Série */}
            <div className="space-y-2">
              <Label htmlFor="numero_serie" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Número de Série
              </Label>
              <Input
                id="numero_serie"
                name="numero_serie"
                placeholder="Ex: 123456789"
                defaultValue={maquina?.numero_serie || ''}
                error={errors.numero_serie}
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="ativa" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Status
              </Label>
              <Select
                placeholder="Selecione o status"
                options={[
                  { value: 'true', label: 'Ativa' },
                  { value: 'false', label: 'Inativa' }
                ]}
                value={maquina?.ativa?.toString()}
                onChange={(value) => setMaquina(prev => prev ? { ...prev, ativa: value === 'true' } : null)}
                error={errors.ativa}
              />
              <input type="hidden" name="ativa" value={maquina?.ativa?.toString()} />
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
                onClick={() => router.push('/maquinas')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Editar Máquina
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
