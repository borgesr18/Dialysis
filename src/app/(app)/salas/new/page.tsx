'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSala } from '../_actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Building, ArrowLeft, FileText } from 'lucide-react';

export default function NovaSalaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      await createSala(formData);
      // A função createSala faz redirect automaticamente em caso de sucesso
    } catch (error) {
      setErrors({ submit: 'Erro ao criar sala. Tente novamente.' });
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/salas');
  };

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary-600" />
          Nova Sala
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
              {loading ? 'Criando...' : 'Criar Sala'}
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
                Nova Sala
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
