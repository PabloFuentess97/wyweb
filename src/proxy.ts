import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfigEdge } from '@/lib/auth/config.edge';

const { auth } = NextAuth(authConfigEdge);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  const isAuthPath =
    pathname === '/login' ||
    pathname === '/recuperar' ||
    pathname.startsWith('/restablecer/');
  const isClientArea = pathname.startsWith('/area-cliente');
  const isAdminArea = pathname.startsWith('/admin');

  // Si está logueado e intenta acceder a /login → redirige a su área
  if (isAuthPath && session?.user) {
    const home = session.user.role.startsWith('staff_') ? '/admin' : '/area-cliente';
    return NextResponse.redirect(new URL(home, req.nextUrl));
  }

  // Rutas privadas: si no hay sesión → /login con returnTo
  if ((isClientArea || isAdminArea) && !session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname + search);
    return NextResponse.redirect(url);
  }

  // Rol incorrecto: cliente que pisa /admin o staff que pisa /area-cliente
  if (session?.user) {
    const role = session.user.role;
    if (isAdminArea && !role.startsWith('staff_')) {
      const url = req.nextUrl.clone();
      url.pathname = '/area-cliente';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
    if (isClientArea && !role.startsWith('client_')) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Todo excepto _next/* (statics), api/auth (handler), favicon, og imgs.
    '/((?!_next|api/auth|favicon|sitemap|robots|manifest|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|css|js|map)).*)',
  ],
};
