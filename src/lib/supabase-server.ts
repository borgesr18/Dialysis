import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Tipo para cliente mock do servidor
type MockSupabaseServerClient = {
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

// Função para criar cliente mock do servidor
function createMockServerClient(errorMessage: string): MockSupabaseServerClient {
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
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida no servidor');
    return createMockServerClient('Supabase URL não configurada no servidor');
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida no servidor');
    return createMockServerClient('Chave anônima do Supabase não configurada no servidor');
  }

  try {
    const cookieStore = cookies();

    return createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // O método `setAll` foi chamado de um Server Component.
              // Isso pode ser ignorado se você tiver middleware atualizando
              // as sessões do usuário.
              console.warn('⚠️ Tentativa de definir cookies em Server Component:', error);
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('❌ Falha ao criar cliente Supabase do servidor:', error);
    return createMockServerClient('Falha ao criar cliente Supabase do servidor');
  }
}

// Função para criar cliente com refresh de sessão
export function createClientWithRefresh() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockServerClient('Configuração do Supabase incompleta');
  }

  try {
    const cookieStore = cookies();

    return createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Configurações otimizadas para cookies de sessão
                const cookieOptions = {
                  ...options,
                  httpOnly: false, // Permite acesso via JavaScript para refresh
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                };
                cookieStore.set(name, value, cookieOptions);
              });
            } catch (error) {
              console.warn('⚠️ Não foi possível definir cookies:', error);
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('❌ Falha ao criar cliente com refresh:', error);
    return createMockServerClient('Falha ao criar cliente com refresh');
  }
}

