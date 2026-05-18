import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ComponentType, SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type Brand = 'uxea-soluciones' | 'wyweb' | 'uxea-cloud';

type Props = {
  brand: Brand;
  name: string;
  tagline: string;
  description: string;
  href: string;
  cta: string;
  external?: boolean;
  Icon: ComponentType<SVGAttributes<SVGSVGElement> & { title?: string }>;
  /** Si es la marca matriz, le da más peso visual. */
  primary?: boolean;
};

export function BrandCard({
  brand,
  name,
  tagline,
  description,
  href,
  cta,
  external,
  Icon,
  primary,
}: Props) {
  const Container = external ? 'a' : Link;
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' as const }
    : {};

  return (
    <article
      data-brand={brand}
      className={cn(
        'group relative flex flex-col gap-4 rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-6 transition-colors duration-200',
        'border-[var(--color-border)] hover:border-[var(--color-accent)]',
        primary && 'border-l-2 border-l-[var(--color-accent)]',
      )}
    >
      <header className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2)] bg-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] text-[var(--color-accent)] border border-[color-mix(in_oklab,var(--color-accent)_20%,var(--color-border))]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)]">
          {primary ? 'MATRIZ' : 'MARCA'}
        </span>
      </header>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
          {name}
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-accent)]">
          {tagline}
        </p>
      </div>

      <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed flex-1">
        {description}
      </p>

      <Container
        href={href}
        {...externalProps}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors mt-auto"
      >
        {cta}
        {external ? (
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        ) : (
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        )}
      </Container>
    </article>
  );
}
