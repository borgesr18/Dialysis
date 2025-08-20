import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingStates';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function SessoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessões de Hemodiálise</h1>
          <p className="text-gray-600 mt-1">Gerencie as sessões de hemodiálise dos pacientes</p>
        </div>
        <Link href="/sessoes/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agendadas</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sessões List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessões de Hoje</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="space-y-4">
              {/* Placeholder para lista de sessões */}
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma sessão encontrada</p>
                <p className="text-sm">Comece criando uma nova sessão de hemodiálise</p>
                <Link href="/sessoes/new" className="mt-4 inline-block">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Sessão
                  </Button>
                </Link>
              </div>
            </div>
          </Suspense>
        </div>
      </Card>
    </div>
  );
}