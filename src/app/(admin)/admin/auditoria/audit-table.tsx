'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DataTable,
  type FilterChip,
} from '@/components/admin/data-table';
import type { AuditLogItem } from '@/lib/db/queries/audit';

const ENTITY_BADGE: Record<
  string,
  'accent' | 'info' | 'success' | 'warning' | 'danger' | 'outline' | 'default'
> = {
  user: 'accent',
  customer: 'success',
  service: 'info',
  invoice: 'warning',
  ticket: 'default',
  lead: 'outline',
};

const ACTION_TONE: Record<
  string,
  'success' | 'warning' | 'danger' | 'default'
> = {
  created: 'success',
  updated: 'default',
  deleted: 'danger',
  archived: 'danger',
  restored: 'success',
  assigned: 'default',
  status_changed: 'default',
  priority_changed: 'warning',
  role_changed: 'warning',
  password_changed: 'warning',
  password_reset: 'warning',
  soft_deleted: 'danger',
  sla_breached: 'danger',
  converted: 'success',
};

function actionTone(action: string) {
  const verb = action.split('.').pop() ?? '';
  return ACTION_TONE[verb] ?? 'default';
}

type Props = {
  data: ReadonlyArray<AuditLogItem>;
  filters: ReadonlyArray<FilterChip>;
};

export function AuditTable({ data, filters }: Props) {
  const [selectedItem, setSelectedItem] = useState<AuditLogItem | null>(null);

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
      size: 160,
      sortingFn: (a, b) => a.original.createdAt.getTime() - b.original.createdAt.getTime(),
    },
    {
      accessorKey: 'action',
      header: 'Acción',
      cell: ({ row }) => {
        const tone = actionTone(row.original.action);
        return (
          <Badge variant={tone} dot={tone !== 'default'}>
            {row.original.action}
          </Badge>
        );
      },
      filterFn: (row, columnId, value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.getValue(columnId) as string);
      },
      size: 220,
    },
    {
      accessorKey: 'entityType',
      header: 'Entidad',
      cell: ({ row }) => (
        <Badge variant={ENTITY_BADGE[row.original.entityType] ?? 'outline'}>
          {row.original.entityType}
        </Badge>
      ),
      filterFn: (row, columnId, value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.getValue(columnId) as string);
      },
      size: 110,
    },
    {
      accessorKey: 'entityId',
      header: 'ID',
      cell: ({ row }) =>
        row.original.entityId ? (
          <span className="font-mono text-[10px] tnum text-[var(--color-fg-muted)]">
            {row.original.entityId.slice(0, 8)}…
          </span>
        ) : (
          <span className="text-[var(--color-fg-subtle)] text-xs">—</span>
        ),
      size: 100,
    },
    {
      accessorKey: 'actorName',
      header: 'Actor',
      cell: ({ row }) =>
        row.original.actorName ? (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm text-[var(--color-fg)] truncate max-w-[180px]">
              {row.original.actorName}
            </span>
            {row.original.actorRole && (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
                {row.original.actorRole.replace('_', ' · ').toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
            SISTEMA
          </span>
        ),
      size: 200,
    },
    {
      id: 'view',
      header: '',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedItem(row.original)}
          aria-label="Ver diff"
        >
          <Code2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden lg:inline">Ver diff</span>
          <ChevronRight
            className="h-3 w-3 hidden lg:inline"
            strokeWidth={1.5}
          />
        </Button>
      ),
      size: 130,
    },
  ];

  return (
    <>
      <DataTable<AuditLogItem>
        data={data}
        columns={columns}
        searchKey="action"
        searchPlaceholder="Buscar por acción…"
        filters={filters}
        getRowId={(r) => r.id}
        pageSize={50}
        emptyState={{
          title: 'Sin registros',
          description: 'No hay entradas en el log de auditoría.',
        }}
      />

      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        {selectedItem && <DiffContent item={selectedItem} />}
      </Dialog>
    </>
  );
}

function DiffContent({ item }: { item: AuditLogItem }) {
  const tone = actionTone(item.action);
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={tone} dot={tone !== 'default'}>
            {item.action}
          </Badge>
          <Badge variant={ENTITY_BADGE[item.entityType] ?? 'outline'}>
            {item.entityType}
          </Badge>
        </div>
        <DialogTitle className="text-lg">
          Audit log {item.id.slice(0, 8)}…
        </DialogTitle>
        <DialogDescription>
          {formatDateTime(item.createdAt)}
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <Field label="Actor">
          {item.actorName ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[var(--color-fg-strong)]">
                {item.actorName}
              </span>
              <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">
                {item.actorEmail}
              </span>
            </div>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
              SISTEMA
            </span>
          )}
        </Field>
        <Field label="Entidad">
          <span className="font-mono text-xs">
            {item.entityType}
            {item.entityId && (
              <span className="text-[var(--color-fg-muted)] ml-1">
                · {item.entityId}
              </span>
            )}
          </span>
        </Field>
        {item.ip && (
          <Field label="IP">
            <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
              {item.ip}
            </span>
          </Field>
        )}
        {item.userAgent && (
          <Field label="User-agent">
            <span className="font-mono text-[10px] text-[var(--color-fg-muted)] truncate block">
              {item.userAgent}
            </span>
          </Field>
        )}
      </dl>

      <div className="mt-2 flex flex-col gap-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
          DIFF
        </p>
        <pre className="font-mono text-xs leading-relaxed bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius-3)] p-3 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap break-all text-[var(--color-fg)]">
          {Object.keys(item.diff).length === 0
            ? '(sin cambios registrados)'
            : JSON.stringify(item.diff, null, 2)}
        </pre>
      </div>
    </DialogContent>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
