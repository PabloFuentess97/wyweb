'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, FileText, Mail, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import { LEAD_STATUS_BADGE, LEAD_STATUS_LABEL } from '@/lib/ui-variants';
import type { AdminLeadListItem } from '@/lib/db/queries/leads-admin';

const columns: ColumnDef<AdminLeadListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Contacto',
    cell: ({ row }) => (
      <Link
        href={`/admin/leads/${row.original.id}`}
        className="font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group"
      >
        <span className="truncate max-w-[200px]">{row.original.name}</span>
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
    size: 200,
  },
  {
    accessorKey: 'company',
    header: 'Empresa',
    cell: ({ row }) =>
      row.original.company ? (
        <span className="text-sm text-[var(--color-fg)] truncate max-w-[200px] inline-block">
          {row.original.company}
        </span>
      ) : (
        <span className="text-[var(--color-fg-subtle)] text-xs">—</span>
      ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="font-mono text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] truncate max-w-[200px] inline-block"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Origen',
    cell: ({ row }) => (
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5">
        {row.original.source}
      </span>
    ),
    size: 130,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={LEAD_STATUS_BADGE[row.original.status]} dot>
        {LEAD_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'assignedToName',
    header: 'Asignado',
    cell: ({ row }) =>
      row.original.assignedToName ? (
        <span className="text-sm text-[var(--color-fg)]">
          {row.original.assignedToName}
        </span>
      ) : (
        <span className="text-[var(--color-fg-subtle)] text-xs">Sin asignar</span>
      ),
    size: 140,
  },
  {
    accessorKey: 'createdAt',
    header: 'Recibido',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {formatDateShort(row.original.createdAt)}
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
          <Link href={`/admin/leads/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`mailto:${row.original.email}?subject=Tu%20consulta%20a%20Wyweb`}>
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            Responder por email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild disabled={row.original.status === 'converted'}>
          <Link href={`/admin/clientes/nuevo?fromLead=${row.original.id}`}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            Convertir a cliente
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
      { value: 'new', label: 'Nuevo' },
      { value: 'contacted', label: 'Contactado' },
      { value: 'qualified', label: 'Cualificado' },
      { value: 'converted', label: 'Convertido' },
      { value: 'discarded', label: 'Descartado' },
    ],
  },
];

export function LeadsTable({
  data,
}: {
  data: ReadonlyArray<AdminLeadListItem>;
}) {
  return (
    <DataTable<AdminLeadListItem>
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Buscar por nombre…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      emptyState={{
        title: 'Sin leads',
        description:
          'No hay leads registrados aún. Aparecerán aquí cuando alguien rellene el formulario de contacto.',
      }}
    />
  );
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
