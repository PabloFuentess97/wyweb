'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Download,
  Eye,
  EyeOff,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  RowActions,
  type FilterChip,
} from '@/components/admin/data-table';
import { toast } from '@/components/ui/toaster';
import type { AdminDocumentItem } from '@/lib/db/queries/documents';
import {
  deleteDocumentAction,
  toggleDocumentVisibilityAction,
} from './actions';

const CATEGORY_LABEL: Record<string, string> = {
  contract: 'Contrato',
  certificate: 'Certificado',
  report: 'Informe',
  other: 'Otro',
};

const CATEGORY_TONE: Record<
  string,
  'accent' | 'info' | 'success' | 'warning' | 'default' | 'outline'
> = {
  contract: 'accent',
  certificate: 'success',
  report: 'info',
  other: 'outline',
};

function getMimeIcon(mime: string) {
  if (mime.startsWith('image/')) return ImageIcon;
  if (mime === 'application/pdf' || mime.includes('document')) return FileText;
  return File;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(d)
    .toUpperCase()
    .replace(/\./g, '');
}

const filters: FilterChip[] = [
  {
    columnId: 'category',
    label: 'Categoría',
    options: [
      { value: 'contract', label: 'Contratos' },
      { value: 'certificate', label: 'Certificados' },
      { value: 'report', label: 'Informes' },
      { value: 'other', label: 'Otros' },
    ],
  },
  {
    columnId: 'visibleToClient',
    label: 'Visibilidad',
    options: [
      { value: 'true', label: 'Visible al cliente' },
      { value: 'false', label: 'Solo interno' },
    ],
  },
];

export function DocumentsTable({
  data,
}: {
  data: ReadonlyArray<AdminDocumentItem>;
}) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const r = await toggleDocumentVisibilityAction(id);
      if (r.status === 'success') toast.success(r.message ?? 'Visibilidad actualizada');
      else if (r.status === 'error') toast.error(r.message);
      setBusyId(null);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      !confirm(
        `¿Eliminar "${name}"? Se borra de MinIO y de la BD. No se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusyId(id);
    startTransition(async () => {
      const r = await deleteDocumentAction(id);
      if (r.status === 'success') toast.success(r.message ?? 'Documento eliminado');
      else if (r.status === 'error') toast.error(r.message);
      setBusyId(null);
    });
  };

  const columns: ColumnDef<AdminDocumentItem>[] = [
    {
      accessorKey: 'name',
      header: 'Documento',
      cell: ({ row }) => {
        const Icon = getMimeIcon(row.original.mimeType);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-[var(--color-fg-strong)] truncate max-w-[300px]">
                {row.original.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                {row.original.mimeType.split('/').pop()?.toUpperCase()} ·{' '}
                {formatBytes(row.original.sizeBytes)}
              </span>
            </div>
          </div>
        );
      },
      size: 380,
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge variant={CATEGORY_TONE[row.original.category] ?? 'outline'}>
          {CATEGORY_LABEL[row.original.category] ?? row.original.category}
        </Badge>
      ),
      filterFn: (row, columnId, value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.getValue(columnId) as string);
      },
      size: 130,
    },
    {
      id: 'customerName',
      accessorFn: (r) => r.customerName,
      header: 'Cliente',
      cell: ({ row }) => (
        <Link
          href={`/admin/clientes/${row.original.customerId}`}
          className="flex flex-col gap-0.5 min-w-0 hover:text-[var(--color-accent)]"
        >
          <span className="text-sm text-[var(--color-fg)] truncate max-w-[200px]">
            {row.original.customerName}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
            {row.original.customerCif}
          </span>
        </Link>
      ),
      size: 200,
    },
    {
      accessorKey: 'visibleToClient',
      header: 'Visible',
      cell: ({ row }) =>
        row.original.visibleToClient ? (
          <Badge variant="success" dot>
            Visible
          </Badge>
        ) : (
          <Badge variant="outline">Oculto</Badge>
        ),
      filterFn: (row, columnId, value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) return true;
        return value.includes(
          String(row.getValue(columnId) as boolean),
        );
      },
      size: 110,
    },
    {
      accessorKey: 'createdAt',
      header: 'Subido',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
            {formatDate(row.original.createdAt)}
          </span>
          {row.original.uploadedByName && (
            <span className="text-[10px] text-[var(--color-fg-subtle)]">
              por {row.original.uploadedByName}
            </span>
          )}
        </div>
      ),
      sortingFn: (a, b) => a.original.createdAt.getTime() - b.original.createdAt.getTime(),
      size: 160,
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const d = row.original;
        const isBusy = busyId === d.id && pending;
        return (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" aria-label="Descargar">
              <a
                href={`/api/documentos/${d.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </a>
            </Button>
            <RowActions>
              <DropdownMenuItem onClick={() => handleToggle(d.id)}>
                {d.visibleToClient ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Ocultar al cliente
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Mostrar al cliente
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(d.id, d.name)}
                className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Eliminar
              </DropdownMenuItem>
            </RowActions>
          </div>
        );
      },
      size: 110,
    },
  ];

  return (
    <DataTable<AdminDocumentItem>
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Buscar por nombre…"
      filters={filters}
      getRowId={(r) => r.id}
      emptyState={{
        title: 'Sin documentos',
        description:
          'Aún no hay documentos. Sube el primero y asígnalo a un cliente.',
        action: (
          <Button asChild variant="accent" size="sm">
            <Link href="/admin/documentos/nuevo">Subir documento</Link>
          </Button>
        ),
      }}
    />
  );
}
