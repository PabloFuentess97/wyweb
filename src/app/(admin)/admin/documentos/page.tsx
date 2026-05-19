import Link from 'next/link';
import type { Metadata } from 'next';
import { FolderOpen, HardDrive, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getAdminDocumentsList,
  getAdminDocumentsStats,
} from '@/lib/db/queries/documents';
import { DocumentsTable } from './documents-table';

export const metadata: Metadata = {
  title: 'Documentos · Backoffice',
  robots: { index: false, follow: false },
};

export default async function DocumentosAdminPage() {
  const [data, stats] = await Promise.all([
    getAdminDocumentsList(),
    getAdminDocumentsStats(),
  ]);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
              BACKOFFICE · DOCUMENTOS
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
              Documentos
            </h1>
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Sube contratos, certificados o informes y asígnalos a un cliente.
              Los marcados como visibles aparecen en su área cliente.
            </p>
          </div>
          <Button asChild variant="accent" size="md" className="shrink-0">
            <Link href="/admin/documentos/nuevo">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Subir documento
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total documentos" value={String(stats.total)} icon={<FolderOpen strokeWidth={1.5} />} />
          <Stat label="Visibles al cliente" value={String(stats.visibleCount)} />
          <Stat
            label="Espacio usado"
            value={formatBytes(stats.totalSizeBytes)}
            icon={<HardDrive strokeWidth={1.5} />}
          />
        </div>
      </header>

      <DocumentsTable data={data} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold inline-flex items-center gap-1.5">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3 inline-flex items-center text-[var(--color-fg-subtle)]">
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}
