import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Info } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getActiveCustomersForUserAssignment } from '@/lib/db/queries/users-admin';
import { NewClientForm } from '../new-client-form';

export const metadata: Metadata = {
  title: 'Nuevo cliente · Backoffice',
  robots: { index: false, follow: false },
};

type SearchParams = { customer?: string };

export default async function NuevoClienteUserPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const { customer } = await searchParams;
  const customers = await getActiveCustomersForUserAssignment();
  const defaultCustomerId =
    customer && customers.some((c) => c.id === customer) ? customer : undefined;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Usuarios
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVO USUARIO CLIENTE
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Crear acceso de cliente
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Para que un contacto del cliente pueda acceder al área cliente. Recibirá un
          email para fijar contraseña.
        </p>
      </header>

      {customers.length === 0 ? (
        <aside
          className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-6 flex items-start gap-3"
          role="status"
        >
          <Info
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              SIN CLIENTES ACTIVOS
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Crea un cliente antes de añadir un usuario.{' '}
              <Link
                href="/admin/clientes/nuevo"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                Crear cliente
              </Link>
              .
            </p>
          </div>
        </aside>
      ) : (
        <NewClientForm customers={customers} defaultCustomerId={defaultCustomerId} />
      )}
    </div>
  );
}
