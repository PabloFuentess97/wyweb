import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Activity, Info } from 'lucide-react';
import { auth } from '@/lib/auth';
import {
  getAuditDistinctActions,
  getAuditLogList,
  getAuditLogStats,
} from '@/lib/db/queries/audit';
import type { FilterChip } from '@/components/admin/data-table';
import { AuditTable } from './audit-table';

export const metadata: Metadata = {
  title: 'Auditoría · Backoffice',
  robots: { index: false, follow: false },
};

const ENTITY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'customer', label: 'Customer' },
  { value: 'service', label: 'Service' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'lead', label: 'Lead' },
  { value: 'user', label: 'User' },
  { value: 'document', label: 'Document' },
];

export default async function AuditoriaPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const [items, stats, distinctActions] = await Promise.all([
    getAuditLogList({ limit: 500 }),
    getAuditLogStats(),
    getAuditDistinctActions(),
  ]);

  // Construir filter chips dinámicos
  const actionFilter: FilterChip = {
    columnId: 'action',
    label: 'Acción',
    options: distinctActions.map((a) => ({ value: a, label: a })),
  };
  const entityFilter: FilterChip = {
    columnId: 'entityType',
    label: 'Entidad',
    options: ENTITY_OPTIONS,
  };
  const filters: FilterChip[] = [actionFilter, entityFilter];

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · AUDITORÍA
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Log de auditoría
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Registro inmutable de operaciones críticas. Read-only · acceso solo a{' '}
            <span className="font-mono text-[var(--color-fg-strong)]">staff_admin</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Eventos totales" value={String(stats.total)} icon={<Activity strokeWidth={1.5} />} />
          <Stat label="Últimas 24h" value={String(stats.last24h)} />
          <Stat label="Últimos 7d" value={String(stats.last7d)} />
          <Stat label="Tipos de entidad" value={String(stats.uniqueEntityTypes)} />
        </div>
      </header>

      <aside
        className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-4"
        role="status"
      >
        <Info
          className="h-5 w-5 text-[var(--color-fg-muted)] shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <p className="text-sm text-[var(--color-fg)] leading-relaxed">
          Mostrando los últimos <strong>500 eventos</strong>. Pulsa{' '}
          <span className="font-mono text-xs">Ver diff</span> para inspeccionar el
          cambio JSON completo registrado.
        </p>
      </aside>

      <AuditTable data={items} filters={filters} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
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
