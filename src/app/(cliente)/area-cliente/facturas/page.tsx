import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Receipt,
  Search,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  getInvoicesByCustomer,
  type InvoiceListFilters,
  type InvoiceStatus,
} from '@/lib/db/queries/invoices';
import { INVOICE_STATUS_BADGE, INVOICE_STATUS_LABEL } from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Facturas',
  robots: { index: false, follow: false },
};

type SearchParams = {
  estado?: string;
  año?: string;
  q?: string;
  page?: string;
};

const STATUS_FILTERS: ReadonlyArray<{
  value: 'all' | InvoiceStatus;
  label: string;
}> = [
  { value: 'all', label: 'Todas' },
  { value: 'issued', label: 'Pendientes' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

function buildHref(base: string, current: SearchParams, patch: Partial<SearchParams>) {
  const merged: Record<string, string | undefined> = { ...current, ...patch };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== 'all') sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `${base}?${q}` : base;
}

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const params = await searchParams;

  const filters: InvoiceListFilters = {
    status: (params.estado as InvoiceStatus | undefined) ?? 'all',
    year: params.año ? Number.parseInt(params.año, 10) : undefined,
    search: params.q,
  };
  const page = Number.parseInt(params.page ?? '1', 10);

  const result = await getInvoicesByCustomer(
    session.user.customerIds,
    filters,
    page,
  );
  const { items, total, totalPages, availableYears } = result;
  const hasFilters =
    (filters.status && filters.status !== 'all') || filters.year || !!filters.search;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA CLIENTE · FACTURAS
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Facturas
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Histórico de facturas emitidas a tu cuenta. Pulsa una para ver el detalle y
          descargar el PDF.
        </p>
      </header>

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        {/* Status chips */}
        <nav className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((s) => {
            const isActive = (filters.status ?? 'all') === s.value;
            return (
              <Link
                key={s.value}
                href={buildHref('/area-cliente/facturas', params, {
                  estado: s.value === 'all' ? undefined : s.value,
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

        <div className="flex items-center gap-2 lg:ml-auto">
          {/* Year filter */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-1">
              {filters.year ? (
                <Link
                  href={buildHref('/area-cliente/facturas', params, {
                    año: undefined,
                    page: undefined,
                  })}
                  className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] border border-[var(--color-fg-strong)] bg-[var(--color-fg-strong)] text-[var(--color-bg)] text-sm font-medium font-mono tnum gap-1.5"
                >
                  AÑO {filters.year}
                  <span aria-hidden>×</span>
                </Link>
              ) : (
                availableYears.map((y) => (
                  <Link
                    key={y}
                    href={buildHref('/area-cliente/facturas', params, {
                      año: String(y),
                      page: undefined,
                    })}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] text-xs font-mono tnum hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
                  >
                    {y}
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Search */}
          <form method="get" className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-fg-subtle)] pointer-events-none"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              name="q"
              placeholder="Buscar nº factura"
              defaultValue={filters.search ?? ''}
              className="h-9 pl-8 w-full lg:w-56 text-sm"
            />
            {filters.status && filters.status !== 'all' && (
              <input type="hidden" name="estado" value={filters.status} />
            )}
            {filters.year && <input type="hidden" name="año" value={filters.year} />}
          </form>
        </div>
      </div>

      {/* TABLA */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Receipt strokeWidth={1.5} />}
          title={hasFilters ? 'Sin resultados' : 'Sin facturas'}
          description={
            hasFilters
              ? 'Ninguna factura coincide con los filtros seleccionados.'
              : 'Aún no tienes facturas emitidas en tu cuenta.'
          }
          action={
            hasFilters ? (
              <Button asChild variant="secondary" size="sm">
                <Link href="/area-cliente/facturas">Quitar filtros</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="md:hidden flex flex-col gap-3">
            {items.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/area-cliente/facturas/${inv.id}`}
                  className="group flex items-center gap-3 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-fg-muted)] transition-colors"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm tracking-[0.04em] text-[var(--color-fg-strong)] tnum font-medium">
                        {inv.number}
                      </span>
                      <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </Badge>
                    </div>
                    <p className="font-mono text-[11px] text-[var(--color-fg-muted)] tnum">
                      {inv.issuedAt ? formatDateLong(inv.issuedAt) : '—'}
                    </p>
                  </div>
                  <span className="font-mono text-base font-semibold tnum text-[var(--color-fg-strong)] shrink-0">
                    {formatEuros(inv.totalCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                  <Th>Número</Th>
                  <Th>Emisión</Th>
                  <Th>Vencimiento</Th>
                  <Th>Estado</Th>
                  <Th align="right">Total</Th>
                  <Th align="right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <Td>
                      <Link
                        href={`/area-cliente/facturas/${inv.id}`}
                        className="font-mono tnum font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5"
                      >
                        {inv.number}
                        <ExternalLink
                          className="h-3 w-3 text-[var(--color-fg-subtle)]"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                        {inv.issuedAt ? formatDate(inv.issuedAt) : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                        {inv.dueAt ? formatDate(inv.dueAt) : '—'}
                      </span>
                    </Td>
                    <Td>
                      <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <span className="font-mono text-sm font-semibold tnum text-[var(--color-fg-strong)]">
                        {formatEuros(inv.totalCents)}
                      </span>
                    </Td>
                    <Td align="right">
                      <Button
                        asChild={inv.hasPdf}
                        variant="ghost"
                        size="sm"
                        disabled={!inv.hasPdf}
                        title={
                          inv.hasPdf ? 'Descargar PDF' : 'PDF en preparación'
                        }
                      >
                        {inv.hasPdf ? (
                          <a href={`/area-cliente/facturas/${inv.id}/pdf`}>
                            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span className="hidden lg:inline">PDF</span>
                          </a>
                        ) : (
                          <span>
                            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span className="hidden lg:inline">PDF</span>
                          </span>
                        )}
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-6 flex items-center justify-between gap-4"
              aria-label="Paginación"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                PÁGINA {page} / {totalPages} · {total} FACTURAS
              </p>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={buildHref('/area-cliente/facturas', params, {
                      page: String(page - 1),
                    })}
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
                    href={buildHref('/area-cliente/facturas', params, {
                      page: String(page + 1),
                    })}
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
        </>
      )}
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)] ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </td>
  );
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
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
