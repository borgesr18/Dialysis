// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient({
    cookies: () => cookieStore,
  });
};
