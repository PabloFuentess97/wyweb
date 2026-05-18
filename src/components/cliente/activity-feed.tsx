import Link from 'next/link';
import { ArrowRight, HeadphonesIcon, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';

type Ticket = {
  id: string;
  number: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: Date;
};

type Invoice = {
  id: string;
  number: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  totalCents: number;
  issuedAt: Date | null;
};

type Props = {
  tickets: ReadonlyArray<Ticket>;
  invoices: ReadonlyArray<Invoice>;
};

export function ActivityFeed({ tickets, invoices }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <Panel
        title="Tickets recientes"
        href="/area-cliente/tickets"
        cta="Ver todos"
        empty={
          <EmptyState
            icon={<HeadphonesIcon strokeWidth={1.5} />}
            title="Sin tickets"
            description="No tienes tickets aún. Cuando abras uno aparecerá aquí."
          />
        }
        items={tickets}
        renderItem={(t) => (
          <Link
            href={`/area-cliente/tickets/${t.id}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                  {t.number}
                </span>
                <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
                  {TICKET_STATUS_LABEL[t.status]}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-fg-strong)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                {t.subject}
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] shrink-0 hidden sm:inline">
              {formatRelativeShort(t.createdAt)}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
              strokeWidth={1.5}
            />
          </Link>
        )}
      />

      <Panel
        title="Facturas recientes"
        href="/area-cliente/facturas"
        cta="Ver todas"
        empty={
          <EmptyState
            icon={<Receipt strokeWidth={1.5} />}
            title="Sin facturas"
            description="Aún no tienes facturas emitidas."
          />
        }
        items={invoices}
        renderItem={(inv) => (
          <Link
            href={`/area-cliente/facturas/${inv.id}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-fg-strong)] tnum font-medium">
                  {inv.number}
                </span>
                <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
                  {INVOICE_STATUS_LABEL[inv.status]}
                </Badge>
              </div>
              <p className="font-mono text-xs text-[var(--color-fg-muted)] tnum">
                {inv.issuedAt ? formatDateShort(inv.issuedAt) : '—'}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold tnum text-[var(--color-fg-strong)] shrink-0">
              {formatEuros(inv.totalCents)}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
              strokeWidth={1.5}
            />
          </Link>
        )}
      />
    </div>
  );
}

function Panel<T>({
  title,
  href,
  cta,
  empty,
  items,
  renderItem,
}: {
  title: string;
  href: string;
  cta: string;
  empty: React.ReactNode;
  items: ReadonlyArray<T>;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          {cta}
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </header>
      {items.length === 0 ? (
        <div className="p-6">{empty}</div>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {items.map((item, i) => (
            <li key={i}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function formatRelativeShort(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'AHORA';
  if (diffMin < 60) return `HACE ${diffMin} M`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `HACE ${diffH} H`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `HACE ${diffD} D`;
  return formatDateShort(date);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
