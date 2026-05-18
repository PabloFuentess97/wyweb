'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import type { CustomerListItem } from '@/lib/db/queries/customers';
import { formatEuros } from '@/lib/utils';

const STATUS_BADGE = {
  active: { variant: 'success' as const, label: 'Activo' },
  suspended: { variant: 'warning' as const, label: 'Suspendido' },
  archived: { variant: 'outline' as const, label: 'Archivado' },
};

const columns: ColumnDef<CustomerListItem>[] = [
  {
    accessorKey: 'cif',
    header: 'CIF',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {row.original.cif}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: 'legalName',
    header: 'Razón social',
    cell: ({ row }) => (
      <Link
        href={`/admin/clientes/${row.original.id}`}
        className="font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group"
      >
        <span className="truncate max-w-[260px]">{row.original.legalName}</span>
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
  },
  {
    accessorKey: 'city',
    header: 'Ciudad',
    cell: ({ row }) => (
      <span className="text-[var(--color-fg-muted)] text-sm">
        {row.original.city}
        <span className="text-[var(--color-fg-subtle)] text-xs ml-1">
          · {row.original.province}
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const { variant, label } = STATUS_BADGE[row.original.status];
      return (
        <Badge variant={variant} dot>
          {label}
        </Badge>
      );
    },
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'servicesCount',
    header: 'Servicios',
    cell: ({ row }) => (
      <span className="font-mono text-sm tnum">{row.original.servicesCount}</span>
    ),
    size: 100,
  },
  {
    accessorKey: 'invoicesCount',
    header: 'Facturas',
    cell: ({ row }) => (
      <span className="font-mono text-sm tnum">{row.original.invoicesCount}</span>
    ),
    size: 100,
  },
  {
    accessorKey: 'totalInvoicedCents',
    header: 'Facturado',
    cell: ({ row }) => (
      <span className="font-mono text-sm tnum font-medium">
        {row.original.totalInvoicedCents === 0
          ? '—'
          : formatEuros(row.original.totalInvoicedCents)}
      </span>
    ),
    size: 130,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem asChild>
          <Link href={`/admin/clientes/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/clientes/${row.original.id}?edit=1`}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          disabled={row.original.status === 'archived'}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Archivar
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
      { value: 'active', label: 'Activo' },
      { value: 'suspended', label: 'Suspendido' },
      { value: 'archived', label: 'Archivado' },
    ],
  },
];

export function CustomersTable({ data }: { data: ReadonlyArray<CustomerListItem> }) {
  return (
    <DataTable<CustomerListItem>
      data={data}
      columns={columns}
      searchKey="legalName"
      searchPlaceholder="Buscar por razón social…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      pageSize={20}
      emptyState={{
        title: 'Sin clientes',
        description: 'No hay clientes registrados aún.',
      }}
      bulkActions={(selected, reset) => (
        <>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-80">
            {selected.length} {selected.length === 1 ? 'CLIENTE' : 'CLIENTES'}
          </span>
          <button
            className="font-mono text-[11px] uppercase tracking-[0.08em] hover:underline"
            onClick={reset}
          >
            Cancelar
          </button>
        </>
      )}
    />
  );
}
