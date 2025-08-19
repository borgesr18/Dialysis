import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware responsável por:
 * 1) Revalidar o token do Supabase (getUser)
 * 2) Escrever os cookies atualizados na response (setAll manual)
 * 3) Bloquear rotas privadas quando usuário não autenticado
 *
 * Observação:
 * - Em middleware (Edge Runtime), a interface esperada pelo @supabase/ssr
 *   usa cookies.getAll() e cookies.setAll(...). Como NextResponse não tem
 *   setAll, implementamos "setAll manual" iterando e chamando res.cookies.set.
 */
export async function middleware(req: NextRequest) {
  // Cria uma response base que vamos devolver ao final
  const res = NextResponse.next({
    request: {
      // garante que cabeçalhos atualizados sigam adiante quando necessário
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê todos os cookies da request
        getAll() {
          // NextRequest#cookies.getAll() → { name, value }[]
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        // Escreve todos os cookies na response (implementação manual do setAll)
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            // ResponseCookies#set({ name, value, ...options })
            res.cookies.set({
              name,
              value,
              ...(options ?? {}),
            });
          }
        },
      },
    }
  );

  // 1) Força revalidação do usuário para atualizar sessão/cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2) Proteção de rotas privadas
  // Defina quais caminhos exigem login. Ex.: tudo dentro de /(app) exceto login e arquivos públicos.
  const url = req.nextUrl;
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth');
  const isPublicAsset =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/public') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/icon.svg';

  const isPrivateArea =
    !isAuthPage && !isPublicAsset; // ajuste a regra se quiser permitir outras rotas públicas

  if (isPrivateArea && !user) {
    // Usuário não logado tentando acessar área privada -> manda pro login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3) Se usuário já está logado e foi para /login, redireciona para /dashboard (UX melhor)
  if (isAuthPage && user) {
    const nextUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(nextUrl);
  }

  // Retorna a response com cookies atualizados
  return res;
}

/**
 * O matcher evita rodar o middleware em arquivos estáticos e imagens.
 * Ajuste a lista conforme necessário.
 */
export const config = {
  matcher: [
    // evita _next/static, _next/image, favicon e arquivos estáticos comuns
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


