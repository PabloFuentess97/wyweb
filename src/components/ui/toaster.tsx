'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/components/providers/theme-provider';

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps['theme']) ?? 'system'}
      position="bottom-right"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] shadow-[var(--shadow-3)] font-sans',
          title: 'text-sm font-medium text-[var(--color-fg-strong)]',
          description: 'text-sm text-[var(--color-fg-muted)]',
          actionButton:
            'bg-[var(--color-fg-strong)] text-[var(--color-bg)] rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium',
          cancelButton:
            'bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium',
          success: '!border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))]',
          error: '!border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))]',
          warning: '!border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))]',
          info: '!border-[color-mix(in_oklab,var(--color-info)_30%,var(--color-border))]',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
