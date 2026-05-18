'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, FileText, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { computeSlaState } from '@/lib/sla';
import type { AdminTicketListItem } from '@/lib/db/queries/tickets-admin';
import { cn } from '@/lib/utils';

const columns: ColumnDef<AdminTicketListItem>[] = [
  {
    accessorKey: 'number',
    header: 'Número',
    cell: ({ row }) => (
      <Link
        href={`/admin/tickets/${row.original.id}`}
        className="font-mono text-xs tnum text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group font-medium"
      >
        {row.original.number}
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
    size: 130,
  },
  {
    accessorKey: 'subject',
    header: 'Asunto',
    cell: ({ row }) => (
      <Link
        href={`/admin/tickets/${row.original.id}`}
        className="text-sm text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] truncate max-w-[280px] inline-block"
      >
        {row.original.subject}
      </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Cliente',
    cell: ({ row }) => (
      <Link
        href={`/admin/clientes/${row.original.customerId}`}
        className="text-sm text-[var(--color-fg)] hover:text-[var(--color-accent)] truncate max-w-[180px] inline-block"
      >
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={TICKET_STATUS_BADGE[row.original.status]} dot>
        {TICKET_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 130,
  },
  {
    accessorKey: 'priority',
    header: 'Prioridad',
    cell: ({ row }) => (
      <Badge variant={PRIORITY_BADGE[row.original.priority]}>
        {PRIORITY_LABEL[row.original.priority]}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 110,
  },
  {
    id: 'sla',
    header: 'SLA',
    accessorFn: (r) =>
      computeSlaState(r.serviceSlaTier ?? 'none', r.slaDueAt, r.firstResponseAt)
        .state,
    cell: ({ row }) => {
      const sla = computeSlaState(
        row.original.serviceSlaTier ?? 'none',
        row.original.slaDueAt,
        row.original.firstResponseAt,
      );
      if (sla.state === 'none') {
        return <span className="text-[var(--color-fg-subtle)] text-xs">—</span>;
      }
      const tone =
        sla.state === 'breach'
          ? 'text-[var(--color-danger)]'
          : sla.state === 'risk'
            ? 'text-[var(--color-warning)]'
            : sla.state === 'ok'
              ? 'text-[var(--color-success)]'
              : 'text-[var(--color-fg-muted)]';
      return (
        <span
          className={cn(
            'font-mono text-[10px] uppercase tracking-[0.08em] tnum font-semibold inline-flex items-center gap-1.5',
            tone,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
          {sla.label}
        </span>
      );
    },
    filterFn: (row, _columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      const sla = computeSlaState(
        row.original.serviceSlaTier ?? 'none',
        row.original.slaDueAt,
        row.original.firstResponseAt,
      );
      return value.includes(sla.state);
    },
    size: 180,
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
    size: 150,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem asChild>
          <Link href={`/admin/tickets/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/tickets/${row.original.id}#asignar`}>
            <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            Asignar
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
      { value: 'open', label: 'Abierto' },
      { value: 'in_progress', label: 'En proceso' },
      { value: 'waiting_customer', label: 'Esperando' },
      { value: 'resolved', label: 'Resuelto' },
      { value: 'closed', label: 'Cerrado' },
    ],
  },
  {
    columnId: 'priority',
    label: 'Prioridad',
    options: [
      { value: 'critical', label: 'Crítica' },
      { value: 'high', label: 'Alta' },
      { value: 'normal', label: 'Normal' },
      { value: 'low', label: 'Baja' },
    ],
  },
  {
    columnId: 'sla',
    label: 'SLA',
    options: [
      { value: 'breach', label: 'Vencido' },
      { value: 'risk', label: 'En riesgo' },
      { value: 'ok', label: 'En plazo' },
      { value: 'none', label: 'Sin SLA' },
    ],
  },
];

export function TicketsTable({
  data,
}: {
  data: ReadonlyArray<AdminTicketListItem>;
}) {
  return (
    <DataTable<AdminTicketListItem>
      data={data}
      columns={columns}
      searchKey="subject"
      searchPlaceholder="Buscar por asunto…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      emptyState={{
        title: 'Sin tickets',
        description: 'No hay tickets registrados en el sistema.',
      }}
    />
  );
}
