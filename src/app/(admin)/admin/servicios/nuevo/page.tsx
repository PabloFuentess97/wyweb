import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Info } from 'lucide-react';
import { getActiveCustomersForSelect } from '@/lib/db/queries/services-admin';
import { ServiceForm } from '../service-form';

export const metadata: Metadata = {
  title: 'Nuevo servicio · Backoffice',
  robots: { index: false, follow: false },
};

type SearchParams = { customer?: string };

export default async function NuevoServicioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { customer } = await searchParams;
  const customers = await getActiveCustomersForSelect();

  const defaultCustomerId = customer && customers.some((c) => c.id === customer)
    ? customer
    : '';

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <Link
        href="/admin/servicios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Servicios
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVO SERVICIO
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Crear servicio
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          El código se genera automáticamente con formato{' '}
          <span className="font-mono">SVC-AÑO-NNN</span>.
        </p>
      </header>

      {customers.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-6 flex items-start gap-3">
          <Info
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              SIN CLIENTES ACTIVOS
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              No hay clientes en estado activo. Crea uno antes de añadir un servicio en{' '}
              <Link
                href="/admin/clientes/nuevo"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                Nuevo cliente
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <ServiceForm
          mode="create"
          customers={customers}
          defaults={{ customerId: defaultCustomerId }}
        />
      )}
    </div>
  );
}
