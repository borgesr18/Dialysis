import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validação de variáveis de ambiente
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida');
    throw new Error('Supabase URL não configurada');
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
    throw new Error('Chave anônima do Supabase não configurada');
  }

  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('❌ Falha ao criar cliente Supabase:', error);
    throw new Error('Falha ao criar cliente Supabase');
  }
}

// Instância singleton do cliente para uso em componentes
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}
