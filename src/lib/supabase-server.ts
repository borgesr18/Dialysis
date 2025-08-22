import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validação de variáveis de ambiente
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida no servidor');
    throw new Error('Supabase URL não configurada no servidor');
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida no servidor');
    throw new Error('Chave anônima do Supabase não configurada no servidor');
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
    throw new Error('Falha ao criar cliente Supabase do servidor');
  }
}

// Função para criar cliente com refresh de sessão
export function createClientWithRefresh() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração do Supabase incompleta');
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
    throw new Error('Falha ao criar cliente com refresh');
  }
}
