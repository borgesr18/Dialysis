import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export const dynamic = 'force-dynamic';

interface Paciente {
  id: string;
  registro: string;
  nome_completo: string;
  data_nascimento: string | null;
  sexo: string | null;
  telefone: string | null;
  cidade_nome: string | null;
  codigo_ibge: number | null;
  ativo: boolean;
  alerta_texto: string | null;
  created_at: string;
  updated_at: string;
  clinica_id: string;
}

export default async function PacientesPage() {
  const supabase = createClient();
  const clinicId = await getCurrentClinicId();
  
  if (!clinicId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Clínica não encontrada. Faça login novamente.</p>
        </div>
      </div>
    );
  }
  
  let pacientes: Paciente[] = [];
  let error: string | null = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinicId)
      .eq('ativo', true)
      .order('nome_completo', { ascending: true });

    if (fetchError) {
      console.error('Erro ao buscar pacientes:', fetchError);
      error = 'Erro ao carregar pacientes. Tente novamente.';
    } else {
      pacientes = data || [];
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
    error = 'Erro inesperado ao carregar pacientes.';
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
                     {paciente.nome_completo.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                       {paciente.nome_completo}
                     </h3>
                     <div className="flex items-center space-x-4 text-sm text-gray-500">
                       <span>Registro: {paciente.registro}</span>
                       {paciente.telefone && <span>Tel: {paciente.telefone}</span>}
                       {paciente.cidade_nome && <span>Cidade: {paciente.cidade_nome}</span>}
                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         Ativo
                       </span>
                     </div>
                     {paciente.alerta_texto && (
                       <div className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                         Alerta: {paciente.alerta_texto}
                       </div>
                     )}
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


