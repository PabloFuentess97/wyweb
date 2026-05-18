import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ChevronLeft,
  ChevronRight,
  HeadphonesIcon,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  getTicketsByCustomer,
  type Priority,
  type TicketListFilters,
  type TicketStatus,
} from '@/lib/db/queries/tickets';
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Tickets',
  robots: { index: false, follow: false },
};

type SearchParams = {
  estado?: string;
  prioridad?: string;
  q?: string;
  page?: string;
};

const STATUS_FILTERS: ReadonlyArray<{
  value: 'all' | 'open-all' | TicketStatus;
  label: string;
}> = [
  { value: 'open-all', label: 'Abiertos' },
  { value: 'all', label: 'Todos' },
  { value: 'resolved', label: 'Resueltos' },
  { value: 'closed', label: 'Cerrados' },
];

function buildHref(current: SearchParams, patch: Partial<SearchParams>) {
  const merged: Record<string, string | undefined> = { ...current, ...patch };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `/area-cliente/tickets?${q}` : '/area-cliente/tickets';
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const params = await searchParams;

  const filters: TicketListFilters = {
    status: (params.estado as TicketStatus | 'open-all' | 'all' | undefined) ?? 'open-all',
    priority: (params.prioridad as Priority | 'all' | undefined) ?? 'all',
    search: params.q,
  };
  const page = Number.parseInt(params.page ?? '1', 10);

  const result = await getTicketsByCustomer(
    session.user.customerIds,
    filters,
    page,
  );
  const { items, total, totalPages } = result;
  const hasFilters =
    filters.search ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.status && filters.status !== 'open-all');

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            ÁREA CLIENTE · TICKETS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Mis tickets
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Consultas y solicitudes a soporte. Cada ticket queda registrado y con SLA
            según el servicio.
          </p>
        </div>

        <Button asChild variant="accent" size="md">
          <Link href="/area-cliente/tickets/nuevo">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nuevo ticket
          </Link>
        </Button>
      </header>

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <nav className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((s) => {
            const isActive = (filters.status ?? 'open-all') === s.value;
            return (
              <Link
                key={s.value}
                href={buildHref(params, {
                  estado: s.value,
                  page: undefined,
                })}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] border text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-fg-strong)] text-[var(--color-bg)] border-[var(--color-fg-strong)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]',
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>

        <form method="get" className="relative lg:ml-auto">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-fg-subtle)] pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            name="q"
            placeholder="Buscar por asunto o nº"
            defaultValue={filters.search ?? ''}
            className="h-9 pl-8 w-full lg:w-72 text-sm"
          />
          {filters.status && (
            <input type="hidden" name="estado" value={filters.status} />
          )}
          {filters.priority && filters.priority !== 'all' && (
            <input type="hidden" name="prioridad" value={filters.priority} />
          )}
        </form>
      </div>

      {/* LISTING */}
      {items.length === 0 ? (
        <EmptyState
          icon={<HeadphonesIcon strokeWidth={1.5} />}
          title={hasFilters ? 'Sin resultados' : 'Sin tickets'}
          description={
            hasFilters
              ? 'Ningún ticket coincide con los filtros seleccionados.'
              : 'No tienes tickets aún. Cuando abras uno aparecerá aquí.'
          }
          action={
            hasFilters ? (
              <Button asChild variant="secondary" size="sm">
                <Link href="/area-cliente/tickets">Quitar filtros</Link>
              </Button>
            ) : (
              <Button asChild variant="accent" size="sm">
                <Link href="/area-cliente/tickets/nuevo">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Abrir primer ticket
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/area-cliente/tickets/${t.id}`}
                className="group flex items-start gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-5 hover:border-[var(--color-fg-muted)] transition-colors"
              >
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                      {t.number}
                    </span>
                    <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
                      {TICKET_STATUS_LABEL[t.status]}
                    </Badge>
                    <Badge variant={PRIORITY_BADGE[t.priority]}>
                      {PRIORITY_LABEL[t.priority]}
                    </Badge>
                    {t.serviceCode && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5">
                        {t.serviceCode}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-medium tracking-[-0.01em] text-[var(--color-fg-strong)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                    {t.subject}
                  </h2>
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                    <span className="tnum">{formatRelative(t.updatedAt)}</span>
                    {t.messageCount > 1 && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                        <span className="tnum">{t.messageCount} MENSAJES</span>
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-[var(--color-fg-subtle)] shrink-0 self-center"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-between gap-4"
          aria-label="Paginación"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
            PÁGINA {page} / {totalPages} · {total} TICKETS
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildHref(params, { page: String(page - 1) })}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm hover:border-[var(--color-fg-muted)] transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                Anterior
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm text-[var(--color-fg-subtle)] opacity-45">
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                Anterior
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={buildHref(params, { page: String(page + 1) })}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm hover:border-[var(--color-fg-muted)] transition-colors"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm text-[var(--color-fg-subtle)] opacity-45">
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
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
    year: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
