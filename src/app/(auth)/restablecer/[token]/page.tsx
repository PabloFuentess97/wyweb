import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyResetToken } from '@/lib/auth/password-reset';
import { RestablecerForm } from './restablecer-form';

export const metadata: Metadata = {
  title: 'Fijar nueva contraseña',
  description: 'Establece una nueva contraseña para tu cuenta de Wyweb.',
  robots: { index: false, follow: false },
};

export default async function RestablecerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const status = await verifyResetToken(token);

  if (!status.ok) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-danger)]">
            ÁREA PRIVADA · ENLACE NO VÁLIDO
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.1]">
            Este enlace no es válido.
          </h1>
        </header>

        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              {status.reason === 'EXPIRED'
                ? 'El enlace ha caducado. Los enlaces de recuperación duran 7 días.'
                : status.reason === 'USED'
                  ? 'Este enlace ya se ha utilizado para fijar una contraseña.'
                  : 'No reconocemos este enlace. Comprueba que has copiado la URL completa.'}
            </p>
          </div>
          <Button asChild variant="accent" size="md" className="w-fit">
            <Link href="/recuperar">Solicitar nuevo enlace</Link>
          </Button>
        </div>

        <footer className="text-center">
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            ← VOLVER AL INICIO DE SESIÓN
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA PRIVADA · NUEVA CONTRASEÑA
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.1]">
          Fija tu nueva contraseña
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Cuenta: <strong className="text-[var(--color-fg-strong)]">{status.email}</strong>
          .<br />
          Mínimo 12 caracteres. Te recomendamos un gestor de contraseñas.
        </p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
        <RestablecerForm token={token} email={status.email} />
      </div>

      <footer className="text-center">
        <Link
          href="/login"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
        >
          ← VOLVER AL INICIO DE SESIÓN
        </Link>
      </footer>
    </div>
  );
}
