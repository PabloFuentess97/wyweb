import type { Metadata } from 'next';
import { AlertTriangle, Info } from 'lucide-react';
import {
  getAdminInvoicesList,
  getInvoicesAggregateStats,
} from '@/lib/db/queries/invoices-admin';
import { formatEuros } from '@/lib/utils';
import { InvoicesTable } from './invoices-table';

export const metadata: Metadata = {
  title: 'Facturas · Backoffice',
  robots: { index: false, follow: false },
};

export default async function FacturasAdminPage() {
  const [data, stats] = await Promise.all([
    getAdminInvoicesList(),
    getInvoicesAggregateStats(),
  ]);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · FACTURAS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Facturas
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Vista de solo lectura. La emisión y la generación de PDFs llegan en F4.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total facturas" value={String(stats.total)} />
          <Stat
            label="Facturado"
            value={
              stats.totalIssuedCents === 0
                ? '—'
                : formatEuros(stats.totalIssuedCents)
            }
          />
          <Stat
            label="Pendiente cobro"
            value={
              stats.pendingCents === 0
                ? '—'
                : formatEuros(stats.pendingCents)
            }
          />
          <Stat
            label="Vencidas"
            value={String(stats.overdueCount)}
            tone={stats.overdueCount > 0 ? 'danger' : 'default'}
          />
        </div>
      </header>

      {/* Aviso F3 */}
      <aside
        className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-4"
        role="status"
      >
        <Info
          className="h-5 w-5 text-[var(--color-fg-muted)] shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)]">
            FASE 3 · SOLO LECTURA
          </p>
          <p className="text-sm text-[var(--color-fg)] leading-relaxed max-w-3xl">
            En esta fase del producto el módulo de facturas es de consulta. Las facturas
            se importan o se cargan vía SQL. La emisión, generación de PDF y export AEAT
            se activan en F4 (decisión BillingProvider self-built vs Holded/Quaderno).
          </p>
        </div>
      </aside>

      <InvoicesTable data={data} />
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
  tone?: 'default' | 'danger';
}) {
  return (
    <article
      className={`flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border bg-[var(--color-surface)] ${
        tone === 'danger'
          ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-danger)]'
          : 'border-[var(--color-border)]'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold flex items-center gap-1.5">
        {tone === 'danger' && (
          <AlertTriangle
            className="h-3 w-3 text-[var(--color-danger)]"
            strokeWidth={1.5}
          />
        )}
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}
