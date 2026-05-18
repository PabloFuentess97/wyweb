import Link from 'next/link';
import type { Metadata } from 'next';
import { RecuperarForm } from './recuperar-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Solicita un enlace para fijar nueva contraseña en Wyweb.',
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA PRIVADA · RECUPERACIÓN
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.1]">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Introduce el email de tu cuenta y te enviaremos un enlace para fijar una nueva
          contraseña. El enlace caduca en 7 días.
        </p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
        <RecuperarForm />
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
