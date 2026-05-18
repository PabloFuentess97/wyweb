import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Trend = {
  value: string;
  direction: 'up' | 'down';
  period: string;
  /** Si subir es bueno (revenue) o malo (errores). Por defecto up=success. */
  positiveDirection?: 'up' | 'down';
};

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  trend?: Trend;
  icon?: React.ReactNode;
  /** Hover variant para cards clickables. */
  href?: never; // se usa Link externo en su lugar
  variant?: 'default' | 'accent' | 'warning' | 'danger';
  className?: string;
};

export function KpiCard({
  label,
  value,
  unit,
  hint,
  trend,
  icon,
  variant = 'default',
  className,
}: Props) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;
  const trendIsPositive = trend
    ? trend.direction === (trend.positiveDirection ?? 'up')
    : null;

  return (
    <article
      className={cn(
        'flex flex-col gap-1 p-5 bg-[var(--color-surface)] border rounded-[var(--radius-card)]',
        variant === 'default' && 'border-[var(--color-border)]',
        variant === 'accent' &&
          'border-[var(--color-border)] border-l-2 border-l-[var(--color-accent)]',
        variant === 'warning' &&
          'border-[var(--color-border)] border-l-2 border-l-[var(--color-warning)]',
        variant === 'danger' &&
          'border-[var(--color-border)] border-l-2 border-l-[var(--color-danger)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] leading-tight font-semibold">
          {label}
        </p>
        {icon && (
          <span className="text-[var(--color-fg-muted)] [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
      </div>

      <p className="font-mono text-3xl md:text-[31px] font-semibold leading-none tnum text-[var(--color-fg-strong)] mt-2">
        {value}
        {unit && (
          <span className="text-base text-[var(--color-fg-muted)] ml-1 font-normal">
            {unit}
          </span>
        )}
      </p>

      {trend && (
        <p
          className={cn(
            'font-mono text-xs flex items-center gap-1.5 mt-1.5',
            trendIsPositive
              ? 'text-[var(--color-success)]'
              : 'text-[var(--color-danger)]',
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="tnum font-medium">{trend.value}</span>
          <span className="text-[var(--color-fg-subtle)] ml-0.5">{trend.period}</span>
        </p>
      )}

      {hint && !trend && (
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] mt-1.5">
          {hint}
        </p>
      )}
    </article>
  );
}
