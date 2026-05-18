import Link from 'next/link';
import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Acceso al área cliente y al backoffice de Wyweb.',
  robots: { index: false, follow: false },
};

type SearchParams = { from?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA PRIVADA
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.1]">
          Inicia sesión
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Acceso para clientes con servicio activo y para el equipo de Wyweb. Si necesitas
          una cuenta, escríbenos a{' '}
          <a
            href="mailto:hola@wyweb.es"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            hola@wyweb.es
          </a>
          .
        </p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
        <LoginForm from={from} />
      </div>

      <footer className="text-center">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
        >
          ← VOLVER AL SITIO
        </Link>
      </footer>
    </div>
  );
}
