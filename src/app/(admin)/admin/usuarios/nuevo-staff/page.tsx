import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Info } from 'lucide-react';
import { auth } from '@/lib/auth';
import { NewStaffForm } from '../new-staff-form';

export const metadata: Metadata = {
  title: 'Nuevo staff · Backoffice',
  robots: { index: false, follow: false },
};

export default async function NuevoStaffPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Usuarios
      </Link>

      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · NUEVO STAFF
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Crear cuenta staff
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Para miembros del equipo de Wyweb. La cuenta se crea sin contraseña — el
          usuario recibe un email para fijar la suya en 7 días.
        </p>
      </header>

      <aside
        className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4"
        role="status"
      >
        <Info
          className="h-5 w-5 text-[var(--color-fg-muted)] shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <p className="text-sm text-[var(--color-fg)] leading-relaxed">
          <strong className="text-[var(--color-fg-strong)]">Staff · Admin</strong> tiene
          acceso completo: usuarios, auditoría, ajustes y todas las operaciones.{' '}
          <strong className="text-[var(--color-fg-strong)]">Staff · Agente</strong>{' '}
          gestiona clientes, tickets y leads pero no usuarios ni configuración global.
        </p>
      </aside>

      <NewStaffForm />
    </div>
  );
}
