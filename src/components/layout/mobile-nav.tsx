'use client';

import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MarkerWyweb } from '@/components/icons/marker-wyweb';
import type { ComponentType, SVGAttributes } from 'react';

type IconType = ComponentType<SVGAttributes<SVGSVGElement> & { title?: string }>;

type ServiceItem = {
  href: string;
  title: string;
  description: string;
  Icon: IconType;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: readonly ServiceItem[];
};

export function MobileNav({ open, onOpenChange, services }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[color-mix(in_oklab,var(--color-fg-strong)_45%,transparent)] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-3)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Menú principal</DialogPrimitive.Title>

          <div className="flex h-14 items-center justify-between px-[var(--container-padding)] border-b border-[var(--color-border)]">
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              <MarkerWyweb className="h-5 w-5 text-[var(--color-accent)]" />
              <span className="font-mono text-sm tracking-[0.16em] uppercase font-semibold text-[var(--color-fg-strong)]">
                WYWEB
              </span>
            </Link>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Cerrar menú"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-3)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </DialogPrimitive.Close>
          </div>

          <nav className="flex-1 overflow-y-auto px-[var(--container-padding)] py-6">
            <MobileLink href="/grupo" onNavigate={() => onOpenChange(false)}>
              Agencia
            </MobileLink>

            <MobileSection title="Servicios">
              {services.map((s) => (
                <MobileSubLink
                  key={s.href}
                  href={s.href}
                  title={s.title}
                  description={s.description}
                  onNavigate={() => onOpenChange(false)}
                >
                  <s.Icon className="h-4 w-4" strokeWidth={1.5} />
                </MobileSubLink>
              ))}
            </MobileSection>

            <MobileLink href="/blog" onNavigate={() => onOpenChange(false)}>
              Blog
            </MobileLink>
            <MobileLink href="/contacto" onNavigate={() => onOpenChange(false)}>
              Contacto
            </MobileLink>
          </nav>

          <div className="border-t border-[var(--color-border)] p-[var(--container-padding)] flex items-center justify-between gap-3">
            <ThemeToggle />
            <Button variant="accent" size="md" asChild className="flex-1">
              <Link href="/contacto" onClick={() => onOpenChange(false)}>
                Solicitar propuesta
              </Link>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function MobileLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between border-b border-[var(--color-border)] py-4 text-base font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors"
    >
      {children}
      <ChevronRight className="h-4 w-4 text-[var(--color-fg-subtle)]" strokeWidth={1.5} />
    </Link>
  );
}

function MobileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="border-b border-[var(--color-border)] py-2 group" open>
      <summary className="flex items-center justify-between py-2 text-base font-medium text-[var(--color-fg-strong)] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronRight
          className="h-4 w-4 text-[var(--color-fg-subtle)] transition-transform duration-200 group-open:rotate-90"
          strokeWidth={1.5}
        />
      </summary>
      <ul className="flex flex-col gap-1 pb-2">{children}</ul>
    </details>
  );
}

function MobileSubLink({
  href,
  title,
  description,
  onNavigate,
  children,
}: {
  href: string;
  title: string;
  description: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="flex gap-3 rounded-[var(--radius-3)] p-3 -mx-3 transition-colors hover:bg-[var(--color-bg-subtle)]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]">
          {children}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--color-fg-strong)] leading-tight">
            {title}
          </span>
          <span className="text-xs text-[var(--color-fg-muted)] leading-snug">
            {description}
          </span>
        </span>
      </Link>
    </li>
  );
}
