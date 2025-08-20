import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is required but not defined');
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Supabase URL not configured' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase URL not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase URL not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase URL not configured' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase URL not configured' } })
      }),
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase URL not configured' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase URL not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }

  if (!supabaseAnonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not defined');
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Supabase anon key not configured' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase anon key not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase anon key not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase anon key not configured' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase anon key not configured' } })
      }),
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase anon key not configured' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase anon key not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }

  try {
    const cookieStore = cookies();

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase server client' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase server client' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase server client' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase server client' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase server client' } })
      }),
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Failed to create Supabase server client' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Failed to create Supabase server client' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }
}
