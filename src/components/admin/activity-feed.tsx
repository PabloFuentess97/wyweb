import Link from 'next/link';
import { ArrowRight, HeadphonesIcon, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  LEAD_STATUS_BADGE,
  LEAD_STATUS_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import type { AdminDashboardData } from '@/lib/db/queries/admin-dashboard';

type Props = {
  recent: AdminDashboardData['recent'];
};

export function AdminActivityFeed({ recent }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <Panel
        title="Leads sin atender"
        href="/admin/leads"
        cta="Ver todos"
        empty={
          <EmptyState
            icon={<Sparkles strokeWidth={1.5} />}
            title="Sin leads pendientes"
            description="Los nuevos leads del formulario de contacto aparecerán aquí."
          />
        }
        items={recent.leads}
        renderItem={(l) => (
          <Link
            href={`/admin/leads/${l.id}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[var(--color-fg-strong)] truncate">
                  {l.name}
                </span>
                <Badge variant={LEAD_STATUS_BADGE[l.status]} dot>
                  {LEAD_STATUS_LABEL[l.status]}
                </Badge>
              </div>
              <p className="font-mono text-xs text-[var(--color-fg-muted)] truncate">
                {l.company ?? l.email}
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] shrink-0">
              {formatRelative(l.createdAt)}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
              strokeWidth={1.5}
            />
          </Link>
        )}
      />

      <Panel
        title="Tickets activos"
        href="/admin/tickets"
        cta="Ver todos"
        empty={
          <EmptyState
            icon={<HeadphonesIcon strokeWidth={1.5} />}
            title="Sin tickets activos"
            description="No hay tickets abiertos en este momento."
          />
        }
        items={recent.tickets}
        renderItem={(t) => (
          <Link
            href={`/admin/tickets/${t.id}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                  {t.number}
                </span>
                <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
                  {TICKET_STATUS_LABEL[t.status]}
                </Badge>
                <Badge variant={PRIORITY_BADGE[t.priority]}>
                  {PRIORITY_LABEL[t.priority]}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-fg-strong)] truncate">
                {t.subject}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] truncate">
                {t.customerName}
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] shrink-0">
              {formatRelative(t.createdAt)}
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

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'AHORA';
  if (min < 60) return `HACE ${min} M`;
  const h = Math.floor(min / 60);
  if (h < 24) return `HACE ${h} H`;
  const d = Math.floor(h / 24);
  if (d < 30) return `HACE ${d} D`;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
