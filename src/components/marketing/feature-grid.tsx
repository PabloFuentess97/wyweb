import type { Feature } from '@/lib/data/services';
import { cn } from '@/lib/utils';

type Props = {
  features: readonly Feature[];
  className?: string;
};

export function FeatureGrid({ features, className }: Props) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border)]',
        className,
      )}
    >
      {features.map((feature, i) => (
        <li
          key={feature.title}
          className="relative flex flex-col gap-3 p-6 bg-[var(--color-surface)]"
        >
          <header className="flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] [&_svg]:h-4 [&_svg]:w-4">
              <feature.Icon strokeWidth={1.5} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
              {String(i + 1).padStart(2, '0')}
            </span>
          </header>
          <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            {feature.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
