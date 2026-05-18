import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-[80px] w-full rounded-[var(--radius-button)] border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg-strong)] placeholder:text-[var(--color-fg-subtle)] transition-colors duration-150 resize-y',
        'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] focus-visible:border-[var(--color-accent)]',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        invalid &&
          'border-[var(--color-danger)] focus-visible:[box-shadow:0_0_0_3px_color-mix(in_oklab,var(--color-danger)_35%,transparent)] focus-visible:border-[var(--color-danger)]',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
