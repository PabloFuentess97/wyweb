import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Stat = {
  value: string;
  label: string;
};

type Props = {
  industry: string;
  customer: string;
  title: string;
  quote?: string;
  /** Cargo y nombre del autor de la cita. */
  attribution?: { name: string; role: string };
  /** Métricas clave del caso. */
  stats?: readonly Stat[];
  href?: string;
  className?: string;
};

export function CaseCard({
  industry,
  customer,
  title,
  quote,
  attribution,
  stats,
  href,
  className,
}: Props) {
  return (
    <article
      className={cn(
        'group relative grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 lg:p-10',
        className,
      )}
    >
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Badge variant="accent">{industry}</Badge>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">
            CLIENTE · {customer}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
          {title}
        </h3>

        {quote && (
          <blockquote className="flex flex-col gap-3 border-l-2 border-[var(--color-accent)] pl-5 my-2">
            <p className="text-base text-[var(--color-fg)] leading-relaxed italic">
              &ldquo;{quote}&rdquo;
            </p>
            {attribution && (
              <footer className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                <span className="font-semibold text-[var(--color-fg-strong)]">
                  {attribution.name}
                </span>
                <span> · {attribution.role}</span>
              </footer>
            )}
          </blockquote>
        )}

        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors w-fit"
          >
            Leer caso completo
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-[var(--color-border)] rounded-[var(--radius-3)] overflow-hidden border border-[var(--color-border)] self-start">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 p-5 bg-[var(--color-surface)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
                {stat.label}
              </span>
              <span className="font-mono text-2xl md:text-3xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
