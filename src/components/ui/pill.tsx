import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pill = cva(
  'inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-[var(--radius-full)] border whitespace-nowrap leading-[1.4] transition-colors duration-150',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]',
        muted:
          'border-transparent bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]',
        accent:
          'border-[color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-accent)_6%,var(--color-surface))] text-[var(--color-accent)]',
      },
      interactive: {
        true: 'cursor-pointer hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]',
        false: '',
      },
    },
    defaultVariants: { variant: 'default', interactive: false },
  },
);

type PillProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof pill> & {
    onRemove?: () => void;
    removeLabel?: string;
  };

export function Pill({
  className,
  variant,
  interactive,
  onRemove,
  removeLabel = 'Quitar',
  children,
  ...props
}: PillProps) {
  return (
    <span className={cn(pill({ variant, interactive }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-current opacity-60 hover:opacity-100"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6L18 18M6 18L18 6" />
          </svg>
        </button>
      )}
    </span>
  );
}
