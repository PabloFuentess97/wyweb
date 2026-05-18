import type { NextAuthConfig } from 'next-auth';

/**
 * Configuración Auth.js compatible con Edge runtime.
 * Es la base que importa el middleware. NO tiene providers (los Credentials
 * necesitan DB y Argon2, que requieren runtime Node) ni adapters.
 *
 * Toda la lógica de session/JWT que se ejecuta en cada request vive aquí.
 */
export const authConfigEdge = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' as const, maxAge: 30 * 24 * 60 * 60 }, // 30 días
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  providers: [], // se rellena en config.ts (Node)
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? token.sub ?? '';
        token.role = user.role;
        token.themePreference = user.themePreference;
        token.densityPreference = user.densityPreference;
        token.language = user.language;
        token.customerIds = user.customerIds;
      }
      if (trigger === 'update' && session) {
        if (session.themePreference) token.themePreference = session.themePreference;
        if (session.densityPreference)
          token.densityPreference = session.densityPreference;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.themePreference = token.themePreference;
        session.user.densityPreference = token.densityPreference;
        session.user.language = token.language;
        session.user.customerIds = token.customerIds;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      const isClientArea = pathname.startsWith('/area-cliente');
      const isAdminArea = pathname.startsWith('/admin');

      if (!isClientArea && !isAdminArea) return true;

      if (!auth) return false;

      if (isClientArea && role && role.startsWith('client_')) return true;
      if (isAdminArea && role && role.startsWith('staff_')) return true;

      return false;
    },
  },
} satisfies NextAuthConfig;
