import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ComponentType, SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  /** Número de servicio "01", "02"… mostrado como índice editorial. */
  index: string;
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<
    SVGAttributes<SVGSVGElement> & {
      title?: string;
      strokeWidth?: number;
    }
  >;
  /** Tags cortos opcionales (ej. "Fibra", "4G", "VPN"). */
  tags?: readonly string[];
  className?: string;
};

export function ServiceCard({
  index,
  title,
  description,
  href,
  Icon,
  tags,
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors duration-200 hover:border-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
        className,
      )}
    >
      <header className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
          {index}
        </span>
        <Icon className="h-6 w-6 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-accent)]" />
      </header>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{description}</p>
      </div>

      {tags && tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors">
        Ver servicio
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </span>
    </Link>
  );
}
