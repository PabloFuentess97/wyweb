import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Briefcase, Plus, Users as UsersIcon } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { getAdminUsersList } from '@/lib/db/queries/users-admin';
import { UsersTable } from './users-table';

export const metadata: Metadata = {
  title: 'Usuarios · Backoffice',
  robots: { index: false, follow: false },
};

export default async function UsuariosAdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const data = await getAdminUsersList({ includeDeleted: true });
  const staff = data.filter((u) => u.role.startsWith('staff_') && !u.deletedAt).length;
  const clients = data.filter((u) => u.role.startsWith('client_') && !u.deletedAt).length;
  const pending = data.filter((u) => !u.hasPassword && !u.deletedAt).length;
  const deleted = data.filter((u) => u.deletedAt).length;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · USUARIOS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Usuarios
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Gestión de cuentas staff y clientes. Las cuentas las creas tú aquí — no hay
            registro público.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="secondary" size="md">
            <Link href="/admin/usuarios/nuevo-cliente">
              <Briefcase className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Nuevo cliente</span>
            </Link>
          </Button>
          <Button asChild variant="accent" size="md">
            <Link href="/admin/usuarios/nuevo-staff">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nuevo staff
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Staff activo" value={String(staff)} icon={<UsersIcon strokeWidth={1.5} />} />
        <Stat label="Clientes activos" value={String(clients)} icon={<Briefcase strokeWidth={1.5} />} />
        <Stat
          label="Pendientes setup"
          value={String(pending)}
          tone={pending > 0 ? 'warning' : 'default'}
        />
        <Stat
          label="Eliminados"
          value={String(deleted)}
          tone={deleted > 0 ? 'danger' : 'default'}
        />
      </div>

      <UsersTable data={data} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'warning' | 'danger';
}) {
  return (
    <article
      className={`flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border bg-[var(--color-surface)] ${
        tone === 'danger'
          ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-danger)]'
          : tone === 'warning'
            ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-warning)]'
            : 'border-[var(--color-border)]'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold inline-flex items-center gap-1.5">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3 inline-flex items-center text-[var(--color-fg-subtle)]">
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}
