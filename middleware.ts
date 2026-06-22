import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const privateRoutes = ['/dashboard', '/calendario', '/tarefas', '/lembretes', '/categorias', '/configuracoes'];
const authRoutes = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some((route) => path.startsWith(route));
  const isAuth = authRoutes.some((route) => path.startsWith(route));

  if (isPrivate && !user) return NextResponse.redirect(new URL('/login', request.url));
  if (isAuth && user) return NextResponse.redirect(new URL('/dashboard', request.url));
  if (path === '/') return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url));

  return response;
}

export const config = { matcher: ['/', '/dashboard/:path*', '/calendario/:path*', '/tarefas/:path*', '/lembretes/:path*', '/categorias/:path*', '/configuracoes/:path*', '/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'] };
