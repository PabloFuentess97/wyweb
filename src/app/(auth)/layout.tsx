import Link from 'next/link';
import { EngineeredGrid } from '@/components/marketing/engineered-grid';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MarkerWyweb } from '@/components/icons/marker-wyweb';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--color-bg)]">
      <EngineeredGrid variant="lines" density="lg" fade="all" className="fixed inset-0" />

      <header className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 -m-1 p-1 rounded-[var(--radius-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
          >
            <MarkerWyweb className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="font-mono text-sm tracking-[0.16em] uppercase font-semibold text-[var(--color-fg-strong)]">
              WYWEB
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex-1 flex items-start md:items-center justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>

      <footer className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-6 flex items-center justify-between text-sm gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold">
            WYWEB · AGENCIA WEB Y SAAS · ES
          </p>
          <nav className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
            <Link
              href="/legal/privacidad"
              className="hover:text-[var(--color-fg-strong)] transition-colors"
            >
              PRIVACIDAD
            </Link>
            <Link
              href="/legal/cookies"
              className="hover:text-[var(--color-fg-strong)] transition-colors"
            >
              COOKIES
            </Link>
            <Link
              href="/contacto"
              className="hover:text-[var(--color-fg-strong)] transition-colors"
            >
              SOPORTE
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
