'use client';

import { useState } from 'react';
import { User, FileText, AlertCircle, Calendar, Phone, MapPin, CreditCard, Users, Hash, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

interface PacienteFormProps {
  action: (formData: FormData) => void;
  defaults?: {
    registro?: string;
    nomeCompleto?: string;
    alertaTexto?: string | null;
    dataNascimento?: string;
    sexo?: string;
    telefone?: string;
    endereco?: string;
    cpf?: string;
    convenio?: string;
    numeroConvenio?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  isEdit?: boolean;
}

export default function PacienteForm({
  action,
  defaults,
  isOpen = true,
  onClose,
  isEdit = false,
}: PacienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    sexo: defaults?.sexo || '',
    convenio: defaults?.convenio || ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validação básica
      const registro = formData.get('registro') as string;
      const nomeCompleto = formData.get('nome_completo') as string;
      const dataNascimento = formData.get('data_nascimento') as string;
      const sexo = formData.get('sexo') as string;
      const cpf = formData.get('cpf') as string;
      
      const newErrors: Record<string, string> = {};
      
      if (!registro?.trim()) {
        newErrors.registro = 'Registro é obrigatório';
      }
      
      if (!nomeCompleto?.trim()) {
        newErrors.nome_completo = 'Nome completo é obrigatório';
      }
      
      if (!dataNascimento?.trim()) {
        newErrors.data_nascimento = 'Data de nascimento é obrigatória';
      }
      
      if (!sexo?.trim()) {
        newErrors.sexo = 'Sexo é obrigatório';
      }
      
      if (!cpf?.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await action(formData);
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      setErrors({ geral: 'Erro ao salvar paciente. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary-600" />
          {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de campos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registro */}
            <div className="space-y-2">
              <Label htmlFor="registro" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Registro
              </Label>
              <Input
                id="registro"
                name="registro"
                defaultValue={defaults?.registro ?? ''}
                placeholder="Ex: 0001"
                error={errors.registro}
                required
              />
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome_completo" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="nome_completo"
                name="nome_completo"
                defaultValue={defaults?.nomeCompleto ?? ''}
                placeholder="Nome e sobrenome do paciente"
                error={errors.nome_completo}
                required
              />
            </div>
          </div>

          {/* Grid de dados pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CPF
              </Label>
              <Input
                id="cpf"
                name="cpf"
                defaultValue={defaults?.cpf ?? ''}
                placeholder="000.000.000-00"
                error={errors.cpf}
                required
              />
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="data_nascimento" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </Label>
              <Input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                defaultValue={defaults?.dataNascimento ?? ''}
                error={errors.data_nascimento}
                required
              />
            </div>
          </div>

          {/* Grid de contato e informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="sexo" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sexo
              </Label>
              <Select
                placeholder="Selecione o sexo"
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' }
                ]}
                value={formData.sexo}
                onChange={(value) => setFormData(prev => ({ ...prev, sexo: value }))}
                error={errors.sexo}
              />
              <input type="hidden" id="sexo" name="sexo" value={formData.sexo} />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                name="telefone"
                defaultValue={defaults?.telefone ?? ''}
                placeholder="(11) 99999-9999"
                error={errors.telefone}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="endereco"
              name="endereco"
              defaultValue={defaults?.endereco ?? ''}
              placeholder="Rua, número, bairro, cidade"
              error={errors.endereco}
            />
          </div>

          {/* Grid de convênio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Convênio */}
            <div className="space-y-2">
              <Label htmlFor="convenio" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Convênio
              </Label>
              <Select
                placeholder="Selecione o convênio"
                options={[
                  { value: 'SUS', label: 'SUS' },
                  { value: 'Particular', label: 'Particular' },
                  { value: 'Unimed', label: 'Unimed' },
                  { value: 'Bradesco Saúde', label: 'Bradesco Saúde' },
                  { value: 'Amil', label: 'Amil' },
                  { value: 'Outro', label: 'Outro' }
                ]}
                value={formData.convenio}
                onChange={(value) => setFormData(prev => ({ ...prev, convenio: value }))}
                error={errors.convenio}
              />
              <input type="hidden" id="convenio" name="convenio" value={formData.convenio} />
            </div>

            {/* Número do Convênio */}
            <div className="space-y-2">
              <Label htmlFor="numero_convenio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Número do Convênio
              </Label>
              <Input
                id="numero_convenio"
                name="numero_convenio"
                defaultValue={defaults?.numeroConvenio ?? ''}
                placeholder="Número da carteirinha"
                error={errors.numero_convenio}
              />
            </div>
          </div>

          {/* Observações/Alertas */}
          <div className="space-y-2">
            <Label htmlFor="alerta_texto" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Observações / Alertas
            </Label>
            <Textarea
              id="alerta_texto"
              name="alerta_texto"
              defaultValue={defaults?.alertaTexto ?? ''}
              placeholder="Alergias, isolamento, particularidades..."
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

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Paciente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (isOpen && onClose) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        {formContent}
      </Modal>
    );
  }

  return formContent;
}

