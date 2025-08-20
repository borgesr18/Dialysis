'use client';

import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  data_nascimento: string;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  clinica_id: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data para evitar erros de permissão
    const mockPacientes: Paciente[] = [
      {
        id: '1',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        telefone: '(11) 99999-9999',
        email: 'joao@email.com',
        data_nascimento: '1980-01-01',
        endereco: 'Rua A, 123',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clinica_id: 'clinic-1'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        telefone: '(11) 88888-8888',
        email: 'maria@email.com',
        data_nascimento: '1975-05-15',
        endereco: 'Rua B, 456',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clinica_id: 'clinic-1'
      }
    ];
    
    setTimeout(() => {
      setPacientes(mockPacientes);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Carregando pacientes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Link href="/pacientes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {pacientes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum paciente encontrado</p>
          <Link href="/pacientes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Paciente
            </Button>
          </Link>
        </div>
      ) : (
         <div className="grid gap-4">
           {pacientes.map((paciente) => (
             <div key={paciente.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                     {paciente.nome.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                       {paciente.nome}
                     </h3>
                     <div className="flex items-center space-x-4 text-sm text-gray-500">
                       <span>CPF: {paciente.cpf}</span>
                       {paciente.telefone && <span>Tel: {paciente.telefone}</span>}
                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         Ativo
                       </span>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Link href={`/pacientes/${paciente.id}/edit`}>
                     <Button variant="outline" size="sm">
                       Editar
                     </Button>
                   </Link>
                   <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                     Excluir
                   </Button>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}


