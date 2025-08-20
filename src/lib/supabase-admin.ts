import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is required but not defined');
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Admin client not configured' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Admin client not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Admin client not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Admin client not configured' } })
      })
    } as any;
  }

  if (!supabaseServiceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required but not defined. Admin operations will not work.');
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Service role key not configured' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Service role key not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Service role key not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Service role key not configured' } })
      })
    } as any;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (error) {
    console.error('Failed to create admin client:', error);
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Failed to create admin client' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Failed to create admin client' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Failed to create admin client' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Failed to create admin client' } })
      })
    } as any;
  }
}
