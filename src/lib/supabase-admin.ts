import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validação de variáveis de ambiente
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida para admin client');
    throw new Error('Supabase URL não configurada para admin client');
  }

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não está definida para admin client');
    throw new Error('Service role key não configurada para admin client');
  }

  try {
    // Criar cliente admin usando service role key
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('❌ Falha ao criar cliente admin do Supabase:', error);
    throw new Error('Falha ao criar cliente admin do Supabase');
  }
}

// Função para verificar se o cliente admin está configurado
export function isAdminClientConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Instância singleton do cliente admin
let adminClientInstance: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient() {
  if (!adminClientInstance) {
    adminClientInstance = createAdminClient();
  }
  return adminClientInstance;
}
