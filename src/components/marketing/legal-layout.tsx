import Link from 'next/link';
import { Calendar, FileText } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type Props = {
  number: string;
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  lastUpdated: string;
  children: React.ReactNode;
  /** Otras páginas legales para navegación lateral. */
  related: ReadonlyArray<{ href: string; label: string; current?: boolean }>;
};

export function LegalLayout({
  number,
  eyebrow,
  title,
  intro,
  lastUpdated,
  children,
  related,
}: Props) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] pt-8 md:pt-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/legal/aviso-legal">Legal</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-12 md:py-16 max-w-3xl flex flex-col gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
            <span>{number}</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
            <span>{eyebrow}</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.05]">
            {title}
          </h1>
          <p className="text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
            {intro}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold flex items-center gap-1.5">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            <span>ÚLTIMA ACTUALIZACIÓN · {lastUpdated.toUpperCase()}</span>
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative pb-20 md:pb-24">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar nav */}
          <aside className="lg:col-span-3 lg:sticky lg:top-20 self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-3">
              DOCUMENTOS LEGALES
            </p>
            <nav className="flex flex-col gap-1" aria-label="Documentos legales">
              {related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={r.current ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-2)] text-sm transition-colors ${
                    r.current
                      ? 'bg-[var(--color-bg-subtle)] text-[var(--color-fg-strong)] font-medium border-l-2 border-l-[var(--color-accent)] pl-[10px]'
                      : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  <span>{r.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Body */}
          <article
            className="lg:col-span-9 max-w-[var(--container-prose)] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-[var(--color-fg-strong)] [&_h2]:leading-tight [&_h2]:scroll-mt-24 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--color-fg-strong)] [&_h3]:leading-snug [&_p]:my-3 [&_p]:text-[var(--color-fg)] [&_p]:leading-relaxed [&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:marker:text-[var(--color-fg-subtle)] [&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:marker:text-[var(--color-fg-subtle)] [&_li]:my-1 [&_li]:text-[var(--color-fg)] [&_li]:leading-relaxed [&_a]:text-[var(--color-accent)] [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-[var(--color-fg-strong)] [&_address]:not-italic [&_address]:font-normal [&_dl]:my-4 [&_dt]:font-mono [&_dt]:text-[10px] [&_dt]:uppercase [&_dt]:tracking-[0.16em] [&_dt]:text-[var(--color-fg-muted)] [&_dt]:font-semibold [&_dt]:mt-3 [&_dd]:text-[var(--color-fg)] [&_dd]:mb-1"
          >
            {children}
          </article>
        </div>
      </section>
    </>
  );
}

export const legalNav = [
  { href: '/legal/aviso-legal', label: 'Aviso legal' },
  { href: '/legal/privacidad', label: 'Política de privacidad' },
  { href: '/legal/cookies', label: 'Política de cookies' },
] as const;
