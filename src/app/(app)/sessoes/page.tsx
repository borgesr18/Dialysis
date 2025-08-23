export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingStates';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';

export default async function SessoesPage() {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  if (!clinica_id) {
    redirect('/dashboard?error=' + encodeURIComponent('Clínica não encontrada'));
  }

  const hoje = new Date().toISOString().split('T')[0];

  const [{ data: sessoesHoje }, { data: contagem }] = await Promise.all([
    supabase
      .from('sessoes_hemodialise')
      .select(`id, paciente_id, maquina_id, data_sessao, hora_inicio, hora_fim, status, observacoes,
        pacientes!inner(id, nome_completo, registro),
        maquinas!inner(id, identificador)
      `)
      .eq('data_sessao', hoje)
      .order('hora_inicio', { ascending: true }),
    supabase
      .from('sessoes_hemodialise')
      .select('status')
      .gte('data_sessao', hoje)
  ]);

  const totalHoje = sessoesHoje?.length ?? 0;
  const emAndamento = sessoesHoje?.filter(s => s.status === 'EM_ANDAMENTO').length ?? 0;
  const agendadas = sessoesHoje?.filter(s => s.status === 'AGENDADA').length ?? 0;
  const concluidas = sessoesHoje?.filter(s => s.status === 'CONCLUIDA').length ?? 0;

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
              <p className="text-2xl font-bold text-gray-900">{totalHoje}</p>
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
              <p className="text-2xl font-bold text-gray-900">{emAndamento}</p>
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
              <p className="text-2xl font-bold text-gray-900">{agendadas}</p>
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
              <p className="text-2xl font-bold text-gray-900">{concluidas}</p>
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
              {totalHoje === 0 ? (
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
              ) : (
                <div className="divide-y">
                  {sessoesHoje?.map((s: any) => (
                    <Link key={s.id} href={`/sessoes/${s.id}`} className="block py-4 hover:bg-gray-50 rounded-lg px-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{s.pacientes?.nome_completo ?? 'Paciente'}</p>
                          <p className="text-sm text-gray-600">Máquina {s.maquinas?.identificador ?? ''} — {s.hora_inicio}{s.hora_fim ? ` - ${s.hora_fim}` : ''}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{s.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </Card>
    </div>
  );
}