import { createBrowserClient } from '@supabase/ssr';

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
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase client' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase client' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase client' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase client' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Failed to create Supabase client' } })
      }),
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Failed to create Supabase client' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Failed to create Supabase client' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }
}