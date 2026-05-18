import type { Metadata } from 'next';
import {
  getAdminLeadsList,
  getLeadsAggregateStats,
} from '@/lib/db/queries/leads-admin';
import { LeadsTable } from './leads-table';

export const metadata: Metadata = {
  title: 'Leads · Backoffice',
  robots: { index: false, follow: false },
};

export default async function LeadsAdminPage() {
  const [data, stats] = await Promise.all([
    getAdminLeadsList(),
    getLeadsAggregateStats(),
  ]);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · LEADS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Leads
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Solicitudes de contacto recibidas desde el sitio público. Asigna agente,
            actualiza el estado o convierte directamente en cliente.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Stat label="Total" value={String(stats.total)} />
          <Stat label="Nuevos" value={String(stats.newCount)} tone={stats.newCount > 0 ? 'accent' : 'default'} />
          <Stat label="Contactados" value={String(stats.contacted)} />
          <Stat label="Cualificados" value={String(stats.qualified)} />
          <Stat label="Convertidos" value={String(stats.converted)} tone={stats.converted > 0 ? 'success' : 'default'} />
        </div>
      </header>

      <LeadsTable data={data} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'success';
}) {
  return (
    <article
      className={`flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border bg-[var(--color-surface)] ${
        tone === 'accent'
          ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-accent)]'
          : tone === 'success'
            ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-success)]'
            : 'border-[var(--color-border)]'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}
