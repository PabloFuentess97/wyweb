'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import { INVOICE_STATUS_BADGE, INVOICE_STATUS_LABEL } from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';
import type { AdminInvoiceListItem } from '@/lib/db/queries/invoices-admin';

const columns: ColumnDef<AdminInvoiceListItem>[] = [
  {
    accessorKey: 'number',
    header: 'Número',
    cell: ({ row }) => (
      <Link
        href={`/admin/facturas/${row.original.id}`}
        className="font-mono text-sm tnum font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group"
      >
        {row.original.number}
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
    size: 140,
  },
  {
    accessorKey: 'customerName',
    header: 'Cliente',
    cell: ({ row }) => (
      <Link
        href={`/admin/clientes/${row.original.customerId}`}
        className="text-sm text-[var(--color-fg)] hover:text-[var(--color-accent)] truncate max-w-[260px] inline-block"
      >
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: 'issuedAt',
    header: 'Emisión',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {row.original.issuedAt ? formatDate(row.original.issuedAt) : '—'}
      </span>
    ),
    size: 110,
    sortingFn: (a, b) => {
      const av = a.original.issuedAt?.getTime() ?? 0;
      const bv = b.original.issuedAt?.getTime() ?? 0;
      return av - bv;
    },
  },
  {
    accessorKey: 'dueAt',
    header: 'Vencimiento',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {row.original.dueAt ? formatDate(row.original.dueAt) : '—'}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={INVOICE_STATUS_BADGE[row.original.status]} dot>
        {INVOICE_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'totalCents',
    header: 'Total',
    cell: ({ row }) => (
      <span className="font-mono text-sm tnum font-medium">
        {formatEuros(row.original.totalCents)}
      </span>
    ),
    size: 120,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem asChild>
          <Link href={`/admin/facturas/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!row.original.hasPdf}>
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          Descargar PDF
        </DropdownMenuItem>
      </RowActions>
    ),
    size: 48,
  },
];

const filters: FilterChip[] = [
  {
    columnId: 'status',
    label: 'Estado',
    options: [
      { value: 'draft', label: 'Borrador' },
      { value: 'issued', label: 'Emitida' },
      { value: 'paid', label: 'Pagada' },
      { value: 'overdue', label: 'Vencida' },
      { value: 'cancelled', label: 'Cancelada' },
    ],
  },
];

export function InvoicesTable({
  data,
}: {
  data: ReadonlyArray<AdminInvoiceListItem>;
}) {
  return (
    <DataTable<AdminInvoiceListItem>
      data={data}
      columns={columns}
      searchKey="number"
      searchPlaceholder="Buscar por nº de factura…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      emptyState={{
        title: 'Sin facturas',
        description:
          'Aún no hay facturas. Empieza creando una nueva — la primera se numerará automáticamente.',
        action: (
          <Button asChild variant="accent" size="sm">
            <Link href="/admin/facturas/nueva">Crear primera factura</Link>
          </Button>
        ),
      }}
    />
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
