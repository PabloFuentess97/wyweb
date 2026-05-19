import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getActiveCustomersForSelect } from '@/lib/db/queries/services-admin';
import { getSettings, previewInvoiceNumber } from '@/lib/db/queries/settings';
import { NewInvoiceForm } from './new-invoice-form';

export const metadata: Metadata = {
  title: 'Nueva factura · Backoffice',
  robots: { index: false, follow: false },
};

export default async function NuevaFacturaPage() {
  const [customers, settings] = await Promise.all([
    getActiveCustomersForSelect(),
    getSettings(),
  ]);

  const nextNumberPreview = previewInvoiceNumber({
    invoicePrefix: settings.invoicePrefix,
    invoiceSeries: settings.invoiceSeries,
    invoiceNextNumber: settings.invoiceNextNumber,
    invoiceNumberPadding: settings.invoiceNumberPadding,
  });

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <Link
        href="/admin/facturas"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Facturas
      </Link>

      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVA FACTURA
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Crear factura
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Se creará en estado <strong>borrador</strong>. Podrás emitirla desde el
          detalle — la emisión asigna número correlativo y genera el PDF.
        </p>
      </header>

      <NewInvoiceForm
        customers={customers}
        defaultVatRate={Number(settings.invoiceDefaultVatRate)}
        nextNumberPreview={nextNumberPreview}
      />
    </div>
  );
}
