import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminServicesList } from '@/lib/db/queries/services-admin';
import { ServicesTable } from './services-table';

export const metadata: Metadata = {
  title: 'Servicios · Backoffice',
  robots: { index: false, follow: false },
};

export default async function ServiciosAdminPage() {
  const data = await getAdminServicesList();
  const total = data.length;
  const active = data.filter((s) => s.status === 'active').length;
  const mrr = data
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (s.monthlyFeeCents ?? 0), 0);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · SERVICIOS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Servicios
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            {total === 0
              ? 'Aún no hay servicios desplegados.'
              : `${total} servicio${total === 1 ? '' : 's'} · ${active} activo${active === 1 ? '' : 's'}${mrr > 0 ? ` · MRR ${(mrr / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €` : ''}.`}
          </p>
        </div>

        <Button asChild variant="accent" size="md">
          <Link href="/admin/servicios/nuevo">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nuevo servicio
          </Link>
        </Button>
      </header>

      <ServicesTable data={data} />
    </div>
  );
}
