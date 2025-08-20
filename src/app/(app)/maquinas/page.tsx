'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Edit, Trash2, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { maquinasService } from '@/services/maquinas';
import { salasService } from '@/services/salas';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { Maquina, Sala } from '@/types/database';

export default function MaquinasPage() {
  const { user, clinicId, loading: authLoading } = useAuth();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativa' | 'inativa' | 'manutencao'>('todos');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !clinicId) return;
    
    const fetchData = async () => {
      try {
        const [maquinasResult, salasResult] = await Promise.all([
          maquinasService.listarMaquinas(clinicId),
          salasService.listarSalasAtivas(clinicId)
        ]);
        
        if (maquinasResult.error) {
          console.error('Erro ao carregar máquinas:', maquinasResult.error);
          setError('Erro ao carregar máquinas');
          toast.error('Erro ao carregar máquinas');
          return;
        }
        
        setMaquinas(maquinasResult.data || []);
        setSalas(salasResult.data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setError('Erro inesperado ao carregar dados');
        toast.error('Erro inesperado ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, clinicId]);

  const handleDeleteMaquina = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta máquina?')) return;
    if (!clinicId) return;
    
    try {
      const { error } = await maquinasService.deletarMaquina(id, clinicId);
      if (error) {
        toast.error('Erro ao excluir máquina');
        return;
      }
      
      setMaquinas(prev => prev.filter(m => m.id !== id));
      toast.success('Máquina excluída com sucesso');
    } catch (error) {
      toast.error('Erro inesperado ao excluir máquina');
    }
  };

  // Filtrar máquinas
  const maquinasFiltradas = maquinas.filter(maquina => {
    const matchesSearch = 
      maquina.numero.toString().includes(searchTerm) ||
      maquina.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maquina.fabricante?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filtroStatus === 'todos' ||
      (filtroStatus === 'ativa' && maquina.status === 'ativa') ||
      (filtroStatus === 'inativa' && maquina.status === 'inativa') ||
      (filtroStatus === 'manutencao' && maquina.status === 'manutencao');
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando máquinas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const salaNome = new Map((salas ?? []).map((s) => [s.id, s.nome as string]));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Máquinas</h1>
            <p className="text-gray-600">Gerencie as máquinas de hemodiálise</p>
          </div>
        </div>
        <Link href="/maquinas/nova">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Máquina
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número, série ou fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroStatus === 'todos' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('todos')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filtroStatus === 'ativa' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('ativa')}
                size="sm"
              >
                Ativas
              </Button>
              <Button
                variant={filtroStatus === 'inativa' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('inativa')}
                size="sm"
              >
                Inativas
              </Button>
              <Button
                variant={filtroStatus === 'manutencao' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('manutencao')}
                size="sm"
              >
                Manutenção
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista */}
      {(!maquinasFiltradas || maquinasFiltradas.length === 0) ? (
        <Card>
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm || filtroStatus !== 'todos' ? 'Nenhuma máquina encontrada' : 'Nenhuma máquina cadastrada'}
                </h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm || filtroStatus !== 'todos' ? 
                    'Tente ajustar os filtros de busca.' : 
                    'Comece adicionando a primeira máquina da clínica.'
                  }
                </p>
              </div>
              {!searchTerm && filtroStatus === 'todos' && (
                <Link href="/maquinas/nova">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeira Máquina
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Máquina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maquinasFiltradas.map((maquina) => {
                    return (
                      <tr key={maquina.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                                {maquina.numero}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Máquina {maquina.numero}
                              </div>
                              <div className="text-sm text-gray-500">
                                {maquina.numero_serie ? `Série: ${maquina.numero_serie}` : 'Série não informada'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {maquina.fabricante ? `${maquina.fabricante}` : 'Fabricante não informado'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sala não definida
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={maquina.status === 'ativa' ? 'success' : maquina.status === 'manutencao' ? 'warning' : 'neutral'}
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            {maquina.status === 'ativa' ? 'Ativa' : maquina.status === 'manutencao' ? 'Manutenção' : 'Inativa'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/maquinas/${maquina.id}/edit`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMaquina(maquina.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
