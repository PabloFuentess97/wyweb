import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCustomersList } from '@/lib/db/queries/customers';
import { CustomersTable } from './customers-table';

export const metadata: Metadata = {
  title: 'Clientes · Backoffice',
  robots: { index: false, follow: false },
};

export default async function ClientesAdminPage() {
  const customers = await getCustomersList();
  const total = customers.length;
  const active = customers.filter((c) => c.status === 'active').length;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · CLIENTES
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Clientes
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            {total === 0
              ? 'Aún no hay clientes registrados.'
              : `${total} cliente${total === 1 ? '' : 's'} · ${active} activo${active === 1 ? '' : 's'}.`}
          </p>
        </div>

        <Button asChild variant="accent" size="md">
          <Link href="/admin/clientes/nuevo">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nuevo cliente
          </Link>
        </Button>
      </header>

      <CustomersTable data={customers} />
    </div>
  );
}
