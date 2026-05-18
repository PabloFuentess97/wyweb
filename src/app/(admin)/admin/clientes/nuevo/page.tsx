import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { CustomerForm } from '../customer-form';
import { getAdminLeadById } from '@/lib/db/queries/leads-admin';

export const metadata: Metadata = {
  title: 'Nuevo cliente · Backoffice',
  robots: { index: false, follow: false },
};

type SearchParams = { fromLead?: string };

export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fromLead } = await searchParams;

  let leadDefaults:
    | {
        legalName: string;
        tradeName: string;
        emailBilling: string;
        phone: string;
        notes: string;
      }
    | null = null;
  let leadName: string | null = null;

  if (fromLead) {
    const detail = await getAdminLeadById(fromLead);
    if (detail) {
      leadName = detail.lead.name;
      leadDefaults = {
        legalName: detail.lead.company ?? '',
        tradeName: '',
        emailBilling: detail.lead.email,
        phone: detail.lead.phone ?? '',
        notes: [
          `Convertido desde lead recibido el ${new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(detail.lead.createdAt)}.`,
          `Origen: ${detail.lead.source}.`,
          `Contacto: ${detail.lead.name} <${detail.lead.email}>`,
          '',
          '— Mensaje original —',
          detail.lead.message,
        ].join('\n'),
      };
    }
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <Link
        href={fromLead ? `/admin/leads/${fromLead}` : '/admin/clientes'}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        {fromLead ? 'Volver al lead' : 'Clientes'}
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVO CLIENTE
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Crear cliente
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Datos fiscales y de contacto. Los servicios y usuarios se asocian después
          desde el detalle del cliente.
        </p>
      </header>

      {fromLead && leadDefaults && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-accent)_4%,var(--color-surface))] p-4"
          role="status"
        >
          <Sparkles
            className="h-5 w-5 text-[var(--color-accent)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-accent)]">
              CONVERSIÓN DESDE LEAD
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Pre-rellenado a partir del lead de{' '}
              <strong className="text-[var(--color-fg-strong)]">{leadName}</strong>.
              Completa el CIF, dirección y datos bancarios. Al crear el cliente, el lead
              se marcará como <strong>convertido</strong> automáticamente.
            </p>
          </div>
        </aside>
      )}

      <CustomerForm
        mode="create"
        defaults={leadDefaults ?? undefined}
        fromLeadId={fromLead}
      />
    </div>
  );
}
