import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = new Set<string>([
  '/',           // se quiser pública
  '/login',
  '/reset-password',
  '/icon.svg',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // permite estáticos e public paths
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/public/')) {
    return NextResponse.next();
  }

  // cria cliente SSR com cookies do request
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => res.cookies.set({ name: key, value, ...options }),
        remove: (key, options) => res.cookies.set({ name: key, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};

