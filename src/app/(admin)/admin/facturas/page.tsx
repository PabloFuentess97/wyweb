import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
              BACKOFFICE · FACTURAS
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
              Facturas
            </h1>
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Emite, gestiona el cobro y descarga PDFs. La numeración es correlativa y
              atómica; los PDFs se almacenan en MinIO con URLs firmadas.
            </p>
          </div>
          <Button asChild variant="accent" size="md" className="shrink-0">
            <Link href="/admin/facturas/nueva">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nueva factura
            </Link>
          </Button>
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
