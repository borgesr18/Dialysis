import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) return NextResponse.next(); // evita falha em preview

  // Exemplo: bloquear /app se não autenticado (cookie do supabase ausente)
  const hasSession = req.cookies.get('sb-access-token') || req.cookies.get('sb:token');
  if (!hasSession && req.nextUrl.pathname.startsWith('/(app)')) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/(app)(.*)'],
};
