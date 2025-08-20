import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NovaSessaoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/sessoes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Sessão de Hemodiálise</h1>
          <p className="text-gray-600 mt-1">Agende uma nova sessão para um paciente</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <div className="p-6">
          <form className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente *</Label>
                <Select
                  placeholder="Selecione um paciente"
                  options={[
                    { value: "1", label: "João Silva - 001" },
                    { value: "2", label: "Maria Santos - 002" },
                    { value: "3", label: "Pedro Oliveira - 003" }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maquina">Máquina *</Label>
                <Select
                  placeholder="Selecione uma máquina"
                  options={[
                    { value: "1", label: "Máquina 01 - Sala A" },
                    { value: "2", label: "Máquina 02 - Sala A" },
                    { value: "3", label: "Máquina 03 - Sala B" }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_sessao">Data da Sessão *</Label>
                <Input
                  id="data_sessao"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Início *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  required
                  defaultValue="07:00"
                />
              </div>
            </div>

            {/* Dados Pré-Diálise */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pré-Diálise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="peso_pre">Peso Pré (kg)</Label>
                  <Input
                    id="peso_pre"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pressao_pre">Pressão Arterial Pré</Label>
                  <Input
                    id="pressao_pre"
                    type="text"
                    placeholder="Ex: 120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ultrafiltracao_prescrita">Ultrafiltração Prescrita (ml)</Label>
                  <Input
                    id="ultrafiltracao_prescrita"
                    type="number"
                    placeholder="Ex: 2000"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="border-t pt-6">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={4}
                  placeholder="Observações sobre a sessão, condições do paciente, etc."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/sessoes">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Agendar Sessão
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}