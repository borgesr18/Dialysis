'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { updateSala } from '@/app/(app)/salas/_actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Building, ArrowLeft, FileText, Loader2 } from 'lucide-react';

interface Sala {
  id: string;
  nome: string;
  descricao: string | null;
}

export default function EditarSalaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [sala, setSala] = useState<Sala | null>(null);

  useEffect(() => {
    async function loadSala() {
      try {
        const supabase = createClient();
        
        // Validar formato UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(params.id)) {
          setErrors({ geral: 'ID inválido' });
          return;
        }

        const { data, error } = await supabase
          .from('salas')
          .select('id, nome, descricao')
          .eq('id', params.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar sala:', error);
          setErrors({ geral: 'Erro ao carregar dados da sala' });
          return;
        }

        if (!data) {
          setErrors({ geral: 'Sala não encontrada' });
          return;
        }

        setSala(data);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setErrors({ geral: 'Erro inesperado ao carregar sala' });
      } finally {
        setLoadingData(false);
      }
    }

    loadSala();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      await updateSala(params.id, formData);
      // A função updateSala faz redirect automaticamente em caso de sucesso
    } catch (error) {
      setErrors({ submit: 'Erro ao atualizar sala. Tente novamente.' });
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/salas');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados da sala...</span>
        </div>
      </div>
    );
  }

  if (errors.geral && !sala) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{errors.geral}</div>
          <Button onClick={() => router.push('/salas')}>Voltar para Salas</Button>
        </div>
      </div>
    );
  }

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary-600" />
          Editar Sala
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de campos principais */}
          <div className="grid grid-cols-1 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Nome da Sala
              </Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Sala A, Sala de Hemodiálise 1"
                defaultValue={sala?.nome || ''}
                error={errors.nome}
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descrição
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descrição opcional da sala (equipamentos, capacidade, etc.)"
                defaultValue={sala?.descricao || ''}
                rows={3}
                error={errors.descricao}
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
                onClick={() => router.push('/salas')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Editar Sala
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
