'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createMaquina } from '../_actions';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Monitor, ArrowLeft, Building, Hash, Tag, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

interface Sala {
  id: string;
  nome: string;
}

export default function NewMaquinaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loadingSalas, setLoadingSalas] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    identificador: '',
    modelo: '',
    numero_serie: '',
    sala_id: '',
    ativa: 'true'
  });
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Carregar salas
  useEffect(() => {
    async function loadSalas() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('salas')
          .select('id, nome')
          .order('nome');

        if (error) {
          console.error('Erro ao carregar salas:', error);
          return;
        }

        setSalas(data || []);
      } catch (error) {
        console.error('Erro ao carregar salas:', error);
      } finally {
        setLoadingSalas(false);
      }
    }

    loadSalas();
  }, []);

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
      
      await createMaquina(formData);
    } catch (error) {
      console.error('Erro ao criar máquina:', error);
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

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary-600" />
          Nova Máquina
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
                error={errors.identificador}
                required
              />
            </div>

            {/* Sala */}
            <div className="space-y-2">
              <Label htmlFor="sala_id" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Sala
              </Label>
              <Select
                placeholder="Selecione uma sala"
                options={salaOptions}
                loading={loadingSalas}
                value={formData.sala_id}
                onChange={(value) => setFormData(prev => ({ ...prev, sala_id: value }))}
                error={errors.sala_id}
              />
              <input type="hidden" name="sala_id" value={formData.sala_id} />
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
                value={formData.ativa}
                onChange={(value) => setFormData(prev => ({ ...prev, ativa: value }))}
                error={errors.ativa}
              />
              <input type="hidden" name="ativa" value={formData.ativa} />
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
              {loading ? 'Criando...' : 'Criar Máquina'}
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
                Nova Máquina
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
