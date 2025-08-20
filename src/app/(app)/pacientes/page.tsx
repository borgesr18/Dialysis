'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Users, Filter, UserPlus, Activity } from 'lucide-react';
import { pacientesService } from '@/services/pacientes';
import { useAuth } from '@/hooks/useAuth';
import { Paciente } from '@/types/database';
import { toast } from 'sonner';

export default function PacientesPage() {
  const { user, clinicId, loading: authLoading } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !clinicId) return;
    
    const fetchPacientes = async () => {
      try {
        const { data, error } = await pacientesService.listarPacientes(clinicId);
        if (error) {
          console.error('Erro ao carregar pacientes:', error);
          setError('Erro ao carregar pacientes');
          toast.error('Erro ao carregar pacientes');
          return;
        }
        setPacientes(data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setError('Erro inesperado ao carregar pacientes');
        toast.error('Erro inesperado ao carregar pacientes');
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [authLoading, clinicId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando pacientes...</div>
        </div>
      </div>
    );
  }

  const handleDeletePaciente = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este paciente?')) return;
    if (!clinicId) return;
    
    try {
      const { error } = await pacientesService.desativarPaciente(id, clinicId);
      if (error) {
        toast.error('Erro ao desativar paciente');
        return;
      }
      
      setPacientes(prev => prev.map(p => p.id === id ? { ...p, ativo: false } : p));
      toast.success('Paciente desativado com sucesso');
    } catch (error) {
      toast.error('Erro inesperado ao desativar paciente');
    }
  };

  const handleToggleStatus = async (paciente: Paciente) => {
    if (!clinicId) return;
    
    try {
      if (paciente.ativo) {
        const { error } = await pacientesService.desativarPaciente(paciente.id, clinicId);
        if (error) {
          toast.error('Erro ao desativar paciente');
          return;
        }
        toast.success('Paciente desativado com sucesso');
      } else {
        // Para reativar, podemos usar a mesma função ou criar uma nova
        // Por enquanto, vamos comentar esta funcionalidade
        toast.info('Funcionalidade de reativação em desenvolvimento');
        return;
      }
      
      // Atualizar lista
      setPacientes(prev => 
        prev.map(p => 
          p.id === paciente.id 
            ? { ...p, ativo: !p.ativo }
            : p
        )
      );
    } catch (error) {
      toast.error('Erro inesperado ao alterar status do paciente');
    }
  };

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    const matchesSearch = 
      paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paciente.cpf && paciente.cpf.includes(searchTerm)) ||
      (paciente.rg && paciente.rg.includes(searchTerm));
    
    const matchesStatus = 
      filtroStatus === 'todos' ||
      (filtroStatus === 'ativo' && paciente.ativo) ||
      (filtroStatus === 'inativo' && !paciente.ativo);
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">Gerencie os pacientes da clínica</p>
          </div>
        </div>
        <Link href="/pacientes/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou RG..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroStatus === 'todos' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('todos')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filtroStatus === 'ativo' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('ativo')}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={filtroStatus === 'inativo' ? 'primary' : 'outline'}
                onClick={() => setFiltroStatus('inativo')}
                size="sm"
              >
                Inativos
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista */}
      {(!pacientesFiltrados || pacientesFiltrados.length === 0) ? (
        <Card variant="elevated" className="p-12">
          <EmptyState
            title={searchTerm || filtroStatus !== 'todos' ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            description={searchTerm || filtroStatus !== 'todos' ? 
              'Tente ajustar os filtros de busca.' : 
              'Comece adicionando o primeiro paciente ao sistema.'
            }
            action={{
              label: "Adicionar Paciente",
              href: "/pacientes/novo"
            }}
            icon={<Users className="h-12 w-12" />}
          />
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Lista de Pacientes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pacientesFiltrados.length} paciente(s) encontrado(s)
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {paciente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {paciente.nome}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Data não informada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        CPF: {paciente.cpf}
                      </div>
                      {paciente.rg && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          RG: {paciente.rg}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {paciente.telefone && (
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {paciente.telefone}
                        </div>
                      )}
                      {paciente.email && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {paciente.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={paciente.ativo ? 'success' : 'neutral'}>
                        <Activity className="w-3 h-3 mr-1" />
                        {paciente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link href={`/pacientes/${paciente.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(paciente)}
                          className={paciente.ativo ? 
                            'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400' : 
                            'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                          }
                        >
                          {paciente.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}


