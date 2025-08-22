import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Tipo para cliente mock admin
type MockSupabaseAdminClient = {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: null; error: { message: string } }>;
    insert: (data: any) => Promise<{ data: null; error: { message: string } }>;
    update: (data: any) => Promise<{ data: null; error: { message: string } }>;
    delete: () => Promise<{ data: null; error: { message: string } }>;
    upsert: (data: any) => Promise<{ data: null; error: { message: string } }>;
  };
  auth: {
    admin: {
      createUser: (userData: any) => Promise<{ data: { user: null }; error: { message: string } }>;
      deleteUser: (userId: string) => Promise<{ data: null; error: { message: string } }>;
      updateUserById: (userId: string, userData: any) => Promise<{ data: { user: null }; error: { message: string } }>;
      listUsers: () => Promise<{ data: { users: [] }; error: { message: string } }>;
    };
  };
};

// Função para criar cliente mock admin
function createMockAdminClient(errorMessage: string): MockSupabaseAdminClient {
  const mockError = { message: errorMessage };
  
  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: mockError }),
      insert: () => Promise.resolve({ data: null, error: mockError }),
      update: () => Promise.resolve({ data: null, error: mockError }),
      delete: () => Promise.resolve({ data: null, error: mockError }),
      upsert: () => Promise.resolve({ data: null, error: mockError })
    }),
    auth: {
      admin: {
        createUser: () => Promise.resolve({ data: { user: null }, error: mockError }),
        deleteUser: () => Promise.resolve({ data: null, error: mockError }),
        updateUserById: () => Promise.resolve({ data: { user: null }, error: mockError }),
        listUsers: () => Promise.resolve({ data: { users: [] }, error: mockError })
      }
    }
  };
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validação de variáveis de ambiente
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL é obrigatória mas não está definida');
    return createMockAdminClient('URL do Supabase não configurada para cliente admin');
  }

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY é obrigatória para operações administrativas');
    return createMockAdminClient('Chave de service role não configurada');
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: { 
        persistSession: false, 
        autoRefreshToken: false 
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-admin-client'
        }
      }
    });
  } catch (error) {
    console.error('❌ Falha ao criar cliente admin:', error);
    return createMockAdminClient('Falha ao criar cliente administrativo do Supabase');
  }
}

// Instância singleton do cliente admin
let adminClientInstance: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient() {
  if (!adminClientInstance) {
    adminClientInstance = createAdminClient();
  }
  return adminClientInstance;
}

// Função utilitária para verificar se o cliente admin está configurado corretamente
export function isAdminClientConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

