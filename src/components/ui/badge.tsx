import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badge = cva(
  'inline-flex items-center gap-2 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] rounded-[var(--radius-2)] border whitespace-nowrap leading-[1.4]',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)]',
        outline:
          'border-[var(--color-border)] bg-transparent text-[var(--color-fg-muted)]',
        accent:
          'border-[color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] text-[var(--color-accent)] bg-[var(--color-surface)]',
        solid:
          'border-[var(--color-fg-strong)] bg-[var(--color-fg-strong)] text-[var(--color-bg)]',
        success:
          'border-[color-mix(in_oklab,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-surface))] text-[var(--color-success)]',
        warning:
          'border-[color-mix(in_oklab,var(--color-warning)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_8%,var(--color-surface))] text-[var(--color-warning)]',
        danger:
          'border-[color-mix(in_oklab,var(--color-danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_8%,var(--color-surface))] text-[var(--color-danger)]',
        info:
          'border-[color-mix(in_oklab,var(--color-info)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-info)_8%,var(--color-surface))] text-[var(--color-info)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge> & {
    dot?: boolean;
  };

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ variant }), className)} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current shrink-0"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
