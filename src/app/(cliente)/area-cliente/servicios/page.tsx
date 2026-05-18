import type { Metadata } from 'next';
import { Server } from 'lucide-react';
import { auth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ServiceCardPrivate } from '@/components/cliente/service-card-private';
import { getServicesByCustomer } from '@/lib/db/queries/services';

export const metadata: Metadata = {
  title: 'Servicios contratados',
  robots: { index: false, follow: false },
};

export default async function ServiciosPage() {
  const session = await auth();
  if (!session?.user) return null;

  const all = await getServicesByCustomer(session.user.customerIds);
  const active = all.filter((s) => s.status === 'active');
  const others = all.filter((s) => s.status !== 'active');

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 max-w-5xl">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            ÁREA CLIENTE · SERVICIOS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Servicios contratados
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            {all.length === 0
              ? 'Aún no tienes servicios activos en tu cuenta.'
              : `${active.length} activo${active.length === 1 ? '' : 's'}${
                  others.length > 0 ? ` · ${others.length} inactivo${others.length === 1 ? '' : 's'}` : ''
                }.`}
          </p>
        </div>
      </header>

      {all.length === 0 ? (
        <EmptyState
          icon={<Server strokeWidth={1.5} />}
          title="Sin servicios contratados"
          description="No vemos servicios asociados a tu cuenta. Si crees que es un error, contáctanos."
          action={
            <Button asChild variant="secondary" size="sm">
              <a href="mailto:hola@wyweb.es">Escribir a soporte</a>
            </Button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <section className="flex flex-col gap-3 mb-10">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Activos · {active.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((s) => (
                  <ServiceCardPrivate key={s.id} service={s} />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-muted)]">
                Otros · {others.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-90">
                {others.map((s) => (
                  <ServiceCardPrivate key={s.id} service={s} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
