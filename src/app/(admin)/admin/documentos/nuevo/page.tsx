import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getActiveCustomersForSelect } from '@/lib/db/queries/services-admin';
import { UploadDocumentForm } from './upload-form';

export const metadata: Metadata = {
  title: 'Subir documento · Backoffice',
  robots: { index: false, follow: false },
};

export default async function NuevoDocumentoPage() {
  const customers = await getActiveCustomersForSelect();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Link
        href="/admin/documentos"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Documentos
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVO DOCUMENTO
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Subir documento
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Sube un archivo (máx 25 MB) y asígnalo a un cliente. Marca si debe ser
          visible para él en su área cliente o si es solo de uso interno.
        </p>
      </header>

      <UploadDocumentForm customers={customers} />
    </div>
  );
}
