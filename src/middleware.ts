import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Rewrites para submissões de formulários (quando NÃO são Server Actions)
  // Mantém compatibilidade com POST direto para rotas de páginas
  try {
    if (request.method === 'POST') {
      const { pathname } = request.nextUrl;
      const isServerAction =
        request.headers.has('next-action') ||
        request.headers.has('next-router-state-tree') ||
        request.headers.get('content-type')?.includes('multipart/form-data') === true;

      if (!isServerAction) {
        if (pathname === '/pacientes/new') {
          const url = new URL('/api/pacientes/new', request.url);
          return NextResponse.rewrite(url);
        }

        const editMatch = pathname.match(/^\/pacientes\/([^/]+)\/edit$/);
        if (editMatch) {
          const id = editMatch[1];
          const url = new URL(`/api/pacientes/${id}/edit`, request.url);
          return NextResponse.rewrite(url);
        }

        if (pathname === '/pacientes') {
          const url = new URL('/api/pacientes', request.url);
          return NextResponse.rewrite(url);
        }
      }
    }
  } catch (_) {
    // Em caso de erro nos rewrites, seguir fluxo normal do middleware
  }

  // Validação de variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas no middleware');
    return NextResponse.redirect(new URL('/error?message=config', request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Configurações otimizadas para cookies de sessão
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            httpOnly: true
          };

          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: any) {
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
          };

          request.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          });
        },
      },
    }
  );

  try {
    // Refresh da sessão se necessário
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn('⚠️ Erro ao verificar usuário no middleware:', error.message);
    }

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/login', '/registro', '/register', '/reset-password', '/update-password', '/error'];
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // Rotas de API que devem ser ignoradas
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    
    // Rotas estáticas que devem ser ignoradas
    const isStaticRoute = request.nextUrl.pathname.startsWith('/_next/') ||
                         request.nextUrl.pathname.startsWith('/favicon.ico') ||
                         /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(request.nextUrl.pathname);

    // Ignorar rotas de API e estáticas
    if (isApiRoute || isStaticRoute) {
      return response;
    }

    // Se o usuário não está logado e está tentando acessar uma rota protegida
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      // Preservar a URL original para redirecionamento após login
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Se o usuário está logado e está tentando acessar login/registro
    if (user && isPublicRoute && !request.nextUrl.pathname.startsWith('/error')) {
      const url = request.nextUrl.clone();
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      url.pathname = redirectTo;
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }

    // Verificar se o usuário tem acesso a uma clínica (para rotas protegidas)
    if (user && !isPublicRoute) {
      try {
        const { data: clinicData } = await supabase
          .from('usuarios_clinicas')
          .select('clinica_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        // Se o usuário não tem clínica associada, redirecionar para onboarding
        if (!clinicData && !request.nextUrl.pathname.startsWith('/onboarding')) {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding';
          return NextResponse.redirect(url);
        }
      } catch (clinicError) {
        console.warn('⚠️ Erro ao verificar clínica do usuário:', clinicError);
        // Continuar sem bloquear o acesso em caso de erro
      }
    }

    return response;
  } catch (middlewareError) {
    console.error('❌ Erro no middleware:', middlewareError);
    // Em caso de erro, permitir acesso mas logar o problema
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto aqueles que começam com:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo favicon)
     * - arquivos de imagem (svg, png, jpg, jpeg, gif, webp)
     * - api (rotas de API)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

