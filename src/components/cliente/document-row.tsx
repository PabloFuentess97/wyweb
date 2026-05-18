import { Award, Download, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DocumentItem } from '@/lib/db/queries/documents';

const CATEGORY_LABEL: Record<DocumentItem['category'], string> = {
  contract: 'Contrato',
  certificate: 'Certificado',
  report: 'Informe',
  other: 'Otro',
};

const CATEGORY_BADGE: Record<DocumentItem['category'], 'accent' | 'success' | 'info' | 'outline'> = {
  contract: 'accent',
  certificate: 'success',
  report: 'info',
  other: 'outline',
};

function pickIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('certificate') || mimeType.includes('x509')) return Award;
  return FileType;
}

type Props = {
  doc: DocumentItem;
};

export function DocumentRow({ doc }: Props) {
  const Icon = pickIcon(doc.mimeType);

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-fg-muted)]">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-[var(--color-fg-strong)] truncate">
            {doc.name}
          </p>
          <Badge variant={CATEGORY_BADGE[doc.category]}>
            {CATEGORY_LABEL[doc.category]}
          </Badge>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] tnum">
          {formatBytes(doc.sizeBytes)} · {formatDate(doc.createdAt)} ·{' '}
          {doc.mimeType.split('/').pop()?.toUpperCase()}
        </p>
      </div>

      <Button asChild variant="secondary" size="sm">
        <a href={`/api/documentos/${doc.id}/download`} download>
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Descargar</span>
        </a>
      </Button>
    </li>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
