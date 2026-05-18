'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, FileText, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import type { AdminUserListItem } from '@/lib/db/queries/users-admin';

const ROLE_LABELS: Record<string, string> = {
  staff_admin: 'Staff · Admin',
  staff_agent: 'Staff · Agente',
  client_admin: 'Cliente · Admin',
  client_user: 'Cliente · Usuario',
};

const ROLE_BADGE: Record<
  string,
  'accent' | 'info' | 'success' | 'outline'
> = {
  staff_admin: 'accent',
  staff_agent: 'info',
  client_admin: 'success',
  client_user: 'outline',
};

const columns: ColumnDef<AdminUserListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <Link
        href={`/admin/usuarios/${row.original.id}`}
        className="font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 group"
      >
        <span className="truncate max-w-[200px]">{row.original.name}</span>
        {row.original.deletedAt && (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-danger)] border border-[var(--color-danger)] rounded-[var(--radius-1)] px-1 py-0.5">
            ELIM
          </span>
        )}
        <ExternalLink
          className="h-3 w-3 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="font-mono text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] truncate max-w-[220px] inline-block"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Rol',
    cell: ({ row }) => (
      <Badge variant={ROLE_BADGE[row.original.role] ?? 'default'} dot>
        {ROLE_LABELS[row.original.role] ?? row.original.role}
      </Badge>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.includes(row.getValue(columnId) as string);
    },
    size: 160,
  },
  {
    id: 'customers',
    header: 'Clientes',
    accessorFn: (r) => r.customersCount,
    cell: ({ row }) => {
      const count = row.original.customersCount;
      if (count === 0) {
        return <span className="text-[var(--color-fg-subtle)] text-xs">—</span>;
      }
      const first = row.original.customerNames[0];
      return (
        <span className="text-sm text-[var(--color-fg)] truncate max-w-[180px] inline-block">
          {first ?? '—'}
          {count > 1 && (
            <span className="text-[var(--color-fg-subtle)] text-xs ml-1.5">
              +{count - 1}
            </span>
          )}
        </span>
      );
    },
    size: 180,
  },
  {
    id: 'security',
    header: 'Seguridad',
    accessorFn: (r) => (r.hasPassword ? 'set' : 'pending'),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.hasPassword ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-success)] inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
            PWD
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
            PENDIENTE
          </span>
        )}
        {row.original.twoFactorEnabled && (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-accent)]">
            2FA
          </span>
        )}
      </div>
    ),
    filterFn: (row, _columnId, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      const status = row.original.hasPassword ? 'set' : 'pending';
      return value.includes(status);
    },
    size: 130,
  },
  {
    accessorKey: 'createdAt',
    header: 'Alta',
    cell: ({ row }) => (
      <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
        {formatDateShort(row.original.createdAt)}
      </span>
    ),
    size: 110,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem asChild>
          <Link href={`/admin/usuarios/${row.original.id}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ver detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`mailto:${row.original.email}`}>
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            Enviar email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem destructive disabled>
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          {row.original.deletedAt ? 'Restaurar (en detalle)' : 'Eliminar (en detalle)'}
        </DropdownMenuItem>
      </RowActions>
    ),
    size: 48,
  },
];

const filters: FilterChip[] = [
  {
    columnId: 'role',
    label: 'Rol',
    options: [
      { value: 'staff_admin', label: 'Staff Admin' },
      { value: 'staff_agent', label: 'Staff Agente' },
      { value: 'client_admin', label: 'Cliente Admin' },
      { value: 'client_user', label: 'Cliente' },
    ],
  },
  {
    columnId: 'security',
    label: 'Contraseña',
    options: [
      { value: 'set', label: 'Configurada' },
      { value: 'pending', label: 'Pendiente' },
    ],
  },
];

export function UsersTable({ data }: { data: ReadonlyArray<AdminUserListItem> }) {
  return (
    <DataTable<AdminUserListItem>
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Buscar por nombre…"
      filters={filters}
      enableSelection
      getRowId={(r) => r.id}
      pageSize={25}
      emptyState={{
        title: 'Sin usuarios',
        description: 'No hay usuarios registrados.',
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
