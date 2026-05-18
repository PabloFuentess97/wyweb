import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Info } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getServicesByCustomer } from '@/lib/db/queries/services';
import { NewTicketForm } from './new-ticket-form';

export const metadata: Metadata = {
  title: 'Nuevo ticket',
  robots: { index: false, follow: false },
};

type SearchParams = { service?: string };

export default async function NuevoTicketPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const { service } = await searchParams;

  const services = await getServicesByCustomer(session.user.customerIds);
  const activeServices = services
    .filter((s) => s.status === 'active' || s.status === 'pending')
    .map((s) => ({ id: s.id, code: s.code, name: s.name }));

  // Validar que el servicio del query string es del cliente
  const defaultServiceId =
    service && activeServices.some((s) => s.id === service) ? service : undefined;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Link
        href="/area-cliente/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Tickets
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA CLIENTE · NUEVO TICKET
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Cuéntanos qué pasa
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Lo recibe el equipo de soporte de Wyweb. Te respondemos según el SLA del
          servicio implicado.
        </p>
      </header>

      {session.user.customerIds.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-6 flex items-start gap-3">
          <Info
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              CUENTA SIN ASOCIAR
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Tu cuenta aún no está vinculada a un cliente. Contacta con soporte en{' '}
              <a
                href="mailto:hola@wyweb.es"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                hola@wyweb.es
              </a>{' '}
              para activar tu acceso.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
          <NewTicketForm
            services={activeServices}
            defaultServiceId={defaultServiceId}
          />
        </div>
      )}
    </div>
  );
}
