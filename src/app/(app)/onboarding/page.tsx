import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
// import { requireSignedIn } from '@/lib/roles'; // Temporariamente removido

export const dynamic = 'force-dynamic';

async function createClinicaAction(formData: FormData) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const nome = String(formData.get('nome') ?? '').trim();
  
  if (!nome) {
    redirect('/onboarding?error=' + encodeURIComponent('Nome da clínica é obrigatório'));
  }
  
  // Criar clínica
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinicas')
    .insert({ nome })
    .select('id')
    .single();
    
  if (clinicaError) {
    redirect('/onboarding?error=' + encodeURIComponent(clinicaError.message));
  }
  
  // Criar perfil do usuário
  const { error: perfilError } = await supabase
    .from('perfis_usuarios')
    .upsert({ id: user.id, nome: user.email?.split('@')[0] || 'Admin', papel: 'ADMIN' });
    
  if (perfilError) {
    redirect('/onboarding?error=' + encodeURIComponent(perfilError.message));
  }
  
  // Vincular usuário à clínica
  const { error: vinculoError } = await supabase
    .from('usuarios_clinicas')
    .insert({ user_id: user.id, clinica_id: clinica.id });
    
  if (vinculoError) {
    redirect('/onboarding?error=' + encodeURIComponent(vinculoError.message));
  }
  
  redirect('/dashboard');
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // const user = await requireSignedIn(); // Temporariamente removido
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const error = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Configurar Clínica</h1>
          <p className="text-sm text-neutral-500">
            Para continuar, configure sua clínica.
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={createClinicaAction} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome da Clínica
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Ex: Clínica Nefrológica São Paulo"
            />
          </div>
          


          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
          >
            Criar Clínica
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-sm mb-2">Alternativa Manual:</h3>
          <p className="text-xs text-gray-600">
            Se preferir, você pode configurar manualmente no Supabase SQL Editor usando os comandos do README.
          </p>
        </div>
      </div>
    </div>
  );
}
