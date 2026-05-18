'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, FileText, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import {
  SERVICE_CATEGORY_LABEL,
  SERVICE_STATUS_BADGE,
  SERVICE_STATUS_LABEL,
  SLA_TIER_LABEL,
} from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';
import type { AdminServiceListItem } from '@/lib/db/queries/services-admin';

const columns: ColumnDef<AdminServiceListItem>[] = [
  {
    accessorKey: 'code',
    header: 'Código',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {row.original.code}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: 'name',
    header: 'Servicio',
    cell: ({ row }) => (
      <Link
        href={`/admin/servicios/${row.original.id}`}
        className="font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group"
      >
        <span className="truncate max-w-[300px]">{row.original.name}</span>
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Cliente',
    cell: ({ row }) => (
      <Link
        href={`/admin/clientes/${row.original.customerId}`}
        className="text-sm text-[var(--color-fg)] hover:text-[var(--color-accent)] truncate max-w-[200px] inline-block"
      >
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Categoría',
    cell: ({ row }) => (
      <Badge variant="outline">
        {SERVICE_CATEGORY_LABEL[row.original.category]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={SERVICE_STATUS_BADGE[row.original.status]} dot>
        {SERVICE_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'slaTier',
    header: 'SLA',
    cell: ({ row }) =>
      row.original.slaTier === 'none' ? (
        <span className="text-[var(--color-fg-subtle)] text-xs">—</span>
      ) : (
        <Badge variant="accent">{SLA_TIER_LABEL[row.original.slaTier]}</Badge>
      ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 100,
  },
  {
    accessorKey: 'monthlyFeeCents',
    header: 'Cuota',
    cell: ({ row }) =>
      row.original.monthlyFeeCents === null || row.original.monthlyFeeCents === 0 ? (
        <span className="text-[var(--color-fg-subtle)] text-xs">—</span>
      ) : (
        <span className="font-mono text-sm tnum font-medium">
          {formatEuros(row.original.monthlyFeeCents)}
          <span className="text-[var(--color-fg-muted)] text-xs font-normal ml-0.5">
            /mes
          </span>
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
          <Link href={`/admin/servicios/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/servicios/${row.original.id}?edit=1`}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Editar
          </Link>
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
      { value: 'pending', label: 'Pendiente' },
      { value: 'suspended', label: 'Suspendido' },
      { value: 'terminated', label: 'Terminado' },
    ],
  },
  {
    columnId: 'category',
    label: 'Categoría',
    options: [
      { value: 'web-design', label: 'Diseño web' },
      { value: 'saas', label: 'SaaS a medida' },
      { value: 'ecommerce', label: 'Ecommerce' },
      { value: 'seo', label: 'SEO' },
      { value: 'maintenance', label: 'Mantenimiento' },
      { value: 'branding', label: 'Branding' },
    ],
  },
  {
    columnId: 'slaTier',
    label: 'SLA',
    options: [
      { value: 'none', label: 'Sin SLA' },
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' },
    ],
  },
];

export function ServicesTable({
  data,
}: {
  data: ReadonlyArray<AdminServiceListItem>;
}) {
  return (
    <DataTable<AdminServiceListItem>
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Buscar por nombre…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      emptyState={{
        title: 'Sin servicios',
        description: 'No hay servicios registrados.',
      }}
    />
  );
}
