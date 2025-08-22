import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Tipo para cliente mock
type MockSupabaseClient = {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: null; error: { message: string } }>;
    insert: (data: any) => Promise<{ data: null; error: { message: string } }>;
    update: (data: any) => Promise<{ data: null; error: { message: string } }>;
    delete: () => Promise<{ data: null; error: { message: string } }>;
    upsert: (data: any) => Promise<{ data: null; error: { message: string } }>;
  };
  auth: {
    signUp: (credentials: any) => Promise<{ data: { user: null; session: null }; error: { message: string } }>;
    signInWithPassword: (credentials: any) => Promise<{ data: { user: null; session: null }; error: { message: string } }>;
    signOut: () => Promise<{ error: null }>;
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    getUser: () => Promise<{ data: { user: null }; error: null }>;
    onAuthStateChange: (callback: any) => { data: { subscription: { unsubscribe: () => void } } };
  };
};

// Função para criar cliente mock
function createMockClient(errorMessage: string): MockSupabaseClient {
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
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validação de variáveis de ambiente
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida');
    return createMockClient('Supabase URL não configurada');
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
    return createMockClient('Chave anônima do Supabase não configurada');
  }

  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('❌ Falha ao criar cliente Supabase:', error);
    return createMockClient('Falha ao criar cliente Supabase');
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

