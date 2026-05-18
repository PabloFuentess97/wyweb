import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAdminUserById } from '@/lib/db/queries/users-admin';
import { UserActions } from './user-actions';

const ROLE_LABELS: Record<string, string> = {
  staff_admin: 'Staff · Admin',
  staff_agent: 'Staff · Agente',
  client_admin: 'Cliente · Admin',
  client_user: 'Cliente · Usuario',
};

const ROLE_BADGE: Record<
  string,
  'accent' | 'info' | 'success' | 'outline'
> = {
  staff_admin: 'accent',
  staff_agent: 'info',
  client_admin: 'success',
  client_user: 'outline',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminUserById(id);
  if (!detail) return { title: 'Usuario · Backoffice' };
  return {
    title: `${detail.user.name} · Usuario`,
    robots: { index: false, follow: false },
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const { id } = await params;
  const detail = await getAdminUserById(id);
  if (!detail) notFound();
  const { user, customers } = detail;
  const isSelf = user.id === session.user.id;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Usuarios
      </Link>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="text-base">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · USUARIO
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight inline-flex items-center gap-2 flex-wrap">
            {user.name}
            {isSelf && (
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
                (TÚ)
              </span>
            )}
          </h1>
          <a
            href={`mailto:${user.email}`}
            className="font-mono text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 w-fit"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            {user.email}
          </a>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={ROLE_BADGE[user.role]} dot>
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
            {user.deletedAt && (
              <Badge variant="danger" dot>
                Eliminado
              </Badge>
            )}
            {!user.hasPassword && !user.deletedAt && (
              <Badge variant="warning" dot>
                Pendiente setup
              </Badge>
            )}
            {user.hasPassword && (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-success)] inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
                CONTRASEÑA
              </span>
            )}
            {user.twoFactorEnabled && (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-accent)] inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
                2FA
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Avisos */}
      {user.deletedAt && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <AlertCircle
            className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-danger)]">
              USUARIO ELIMINADO (SOFT DELETE)
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Esta cuenta no puede iniciar sesión. Eliminada el{' '}
              {formatDate(user.deletedAt)}. Puedes restaurarla desde el panel de
              acciones.
            </p>
          </div>
        </aside>
      )}

      {!user.hasPassword && !user.deletedAt && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <AlertCircle
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              CONTRASEÑA NO CONFIGURADA
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Este usuario aún no ha fijado su contraseña. Si el email de bienvenida
              caducó, reenvíalo desde el panel de acciones.
            </p>
          </div>
        </aside>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 flex flex-col gap-4">
          <DataCard title="Identidad">
            <DataRow label="Nombre">{user.name}</DataRow>
            <DataRow label="Email">{user.email}</DataRow>
            <DataRow label="Rol">{ROLE_LABELS[user.role] ?? user.role}</DataRow>
            <DataRow label="Email verificado">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                  {formatDate(user.emailVerified)}
                </span>
              ) : (
                <span className="text-[var(--color-fg-subtle)]">No verificado</span>
              )}
            </DataRow>
          </DataCard>

          <DataCard title="Preferencias">
            <DataRow label="Tema">{user.themePreference}</DataRow>
            <DataRow label="Densidad">{user.densityPreference}</DataRow>
            <DataRow label="Idioma">{user.language}</DataRow>
          </DataCard>

          {user.role.startsWith('client_') && (
            <DataCard title={`Clientes asociados · ${customers.length}`}>
              {customers.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-muted)]">
                  Este usuario tiene rol cliente pero no está vinculado a ningún
                  customer. No podrá ver datos en el área cliente.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {customers.map((c) => (
                    <li key={c.customerId}>
                      <Link
                        href={`/admin/clientes/${c.customerId}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-2)] border border-[var(--color-border)] hover:border-[var(--color-fg-muted)] transition-colors group"
                      >
                        <Building2
                          className="h-3.5 w-3.5 text-[var(--color-fg-muted)] shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[var(--color-fg-strong)] group-hover:text-[var(--color-accent)] transition-colors block truncate">
                            {c.customerName}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] tnum">
                            {c.cif}
                          </span>
                        </span>
                        <Badge variant={c.customerRole === 'admin' ? 'accent' : 'outline'}>
                          {c.customerRole === 'admin' ? 'Admin' : 'Viewer'}
                        </Badge>
                        <ExternalLink
                          className="h-3 w-3 text-[var(--color-fg-subtle)] shrink-0"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </DataCard>
          )}

          {user.role.startsWith('staff_') && customers.length > 0 && (
            <DataCard title={`Vinculaciones legacy · ${customers.length}`}>
              <p className="text-xs text-[var(--color-fg-muted)] mb-2">
                Este usuario es staff pero tiene vinculaciones a clientes (probablemente
                cambió de rol).
              </p>
              <ul className="flex flex-col gap-1">
                {customers.map((c) => (
                  <li
                    key={c.customerId}
                    className="font-mono text-[11px] tnum text-[var(--color-fg-muted)]"
                  >
                    · {c.customerName}
                  </li>
                ))}
              </ul>
            </DataCard>
          )}

          <DataCard title="Auditoría">
            <DataRow label="Creado" icon={<Calendar strokeWidth={1.5} />}>
              <span className="font-mono text-xs tnum">
                {formatDateLong(user.createdAt)}
              </span>
            </DataRow>
            <DataRow label="Actualizado" icon={<Calendar strokeWidth={1.5} />}>
              <span className="font-mono text-xs tnum">
                {formatDateLong(user.updatedAt)}
              </span>
            </DataRow>
            <DataRow label="ID" icon={<UserIcon strokeWidth={1.5} />}>
              <span className="font-mono text-[10px] tnum text-[var(--color-fg-muted)] truncate block">
                {user.id}
              </span>
            </DataRow>
          </DataCard>
        </section>

        <aside className="lg:col-span-4 lg:sticky lg:top-20 self-start">
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <header className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Acciones
              </h3>
            </header>
            <div className="px-4 py-3">
              <UserActions
                userId={user.id}
                currentRole={user.role}
                isDeleted={!!user.deletedAt}
                isSelf={isSelf}
                hasPassword={user.hasPassword}
              />
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

function DataCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h3>
      </header>
      <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
    </article>
  );
}

function DataRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold whitespace-nowrap inline-flex items-center gap-1">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3 inline-flex items-center text-[var(--color-fg-subtle)]">
            {icon}
          </span>
        )}
        {label}
      </span>
      <span className="text-[var(--color-fg)] text-right truncate min-w-0 flex-1">
        {children}
      </span>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? 'UX').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
