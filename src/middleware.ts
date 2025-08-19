import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas (ajuste conforme seu projeto)
  const publicPaths = [
    '/login',
    '/icon.svg',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Se as envs do Supabase não estão configuradas, não bloqueia
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  // Checagem simples de auth via cookies do Supabase
  const access = req.cookies.get('sb-access-token')?.value;
  const refresh = req.cookies.get('sb-refresh-token')?.value;
  const isAuthenticated = Boolean(access || refresh);

  if (!isAuthenticated) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname || '/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher: protege as áreas logadas do app
export const config = {
  matcher: [
    '/dashboard',
    '/pacientes/:path*',
    '/salas/:path*',
    '/turnos/:path*',
    '/agenda',
    '/onboarding',
  ],
};
