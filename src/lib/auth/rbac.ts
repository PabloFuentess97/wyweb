import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from './index';
import type { Session } from 'next-auth';

export type Role = Session['user']['role'];

/**
 * Devuelve la sesión o `null` (en server components / server actions).
 */
export async function getSession() {
  return auth();
}

/**
 * Requiere sesión válida. Si no hay, redirige a `/login?from=…`.
 * Devuelve la sesión narrowed (no-null).
 */
export async function requireAuth(redirectFrom?: string) {
  const session = await auth();
  if (!session?.user) {
    const from = redirectFrom ? `?from=${encodeURIComponent(redirectFrom)}` : '';
    redirect(`/login${from}`);
  }
  return session;
}

/**
 * Requiere staff (cualquier rol staff_*). Lanza redirect si no.
 */
export async function requireStaff() {
  const session = await requireAuth();
  if (!session.user.role.startsWith('staff_')) {
    redirect('/?error=forbidden');
  }
  return session;
}

/**
 * Requiere staff_admin específicamente.
 */
export async function requireStaffAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }
  return session;
}

/**
 * Requiere cliente (client_admin o client_user). Lanza redirect si no.
 */
export async function requireClient() {
  const session = await requireAuth();
  if (!session.user.role.startsWith('client_')) {
    redirect('/?error=forbidden');
  }
  return session;
}

export function hasRole(session: Session | null, ...roles: Role[]): boolean {
  if (!session?.user) return false;
  return roles.includes(session.user.role);
}

export function isStaff(session: Session | null): boolean {
  return !!session?.user.role?.startsWith('staff_');
}

export function isClient(session: Session | null): boolean {
  return !!session?.user.role?.startsWith('client_');
}
