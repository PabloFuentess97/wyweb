import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-button)] border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg-strong)] placeholder:text-[var(--color-fg-subtle)] transition-colors duration-150',
        'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] focus-visible:border-[var(--color-accent)]',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        invalid &&
          'border-[var(--color-danger)] focus-visible:[box-shadow:0_0_0_3px_color-mix(in_oklab,var(--color-danger)_35%,transparent)] focus-visible:border-[var(--color-danger)]',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
