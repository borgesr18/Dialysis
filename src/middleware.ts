import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware para:
 * - Revalidar a sessão do Supabase e propagar cookies atualizados
 * - Proteger rotas privadas
 * - Liberar rotas públicas de auth/reset
 */
export async function middleware(req: NextRequest) {
  // Base response (onde vamos gravar cookies atualizados)
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Cliente SSR no middleware exige cookies.getAll / cookies.setAll
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            res.cookies.set({ name, value, ...(options ?? {}) });
          }
        },
      },
    }
  );

  const url = req.nextUrl;

  // Rotas públicas de autenticação e recuperação de senha
  const isAuthOrPasswordPage =
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/reset-password') ||
    url.pathname.startsWith('/update-password');

  // Arquivos estáticos e públicos
  const isPublicAsset =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/public') ||
    url.pathname.startsWith('/public/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/icon.svg';

  // Tudo que não for público é privado
  const isPrivateArea = !isAuthOrPasswordPage && !isPublicAsset;

  // Revalida sessão para atualizar cookies (importante no Edge)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Não autenticado tentando acessar área privada → redireciona para /login
  if (isPrivateArea && !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Já autenticado indo para /login → leva para /dashboard (UX)
  if (url.pathname.startsWith('/login') && user) {
    const nextUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(nextUrl);
  }

  // Retorna a response com cookies possivelmente atualizados
  return res;
}

export const config = {
  matcher: [
    // Evita rodar em assets estáticos e imagens
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
