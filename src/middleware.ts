import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Evita quebrar em Preview sem envs
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  // Supabase usa 'sb-access-token' e 'sb-refresh-token'
  const access = req.cookies.get('sb-access-token');
  const refresh = req.cookies.get('sb-refresh-token');
  const isAuthenticated = Boolean(access || refresh);

  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/(app)')) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/(app)(.*)'] };
