'use client';

import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { ActionState } from './actions';

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
      >
        {label}
        {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--color-fg-muted)] leading-snug">{hint}</p>
      )}
    </div>
  );
}

export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === 'success') {
    return (
      <div
        className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-fg)]"
        role="status"
      >
        <CheckCircle2
          className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-success)]"
          strokeWidth={1.5}
        />
        <p>{state.message ?? 'Guardado.'}</p>
      </div>
    );
  }
  if (state.status === 'error' && !state.fieldErrors) {
    return (
      <div
        className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
        <p>{state.message}</p>
      </div>
    );
  }
  return null;
}

export function SaveButton({ label = 'Guardar' }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end pt-2 border-t border-[var(--color-border)]">
      <Button
        type="submit"
        variant="accent"
        size="md"
        loading={pending}
        disabled={pending}
      >
        {!pending && <Save className="h-4 w-4" strokeWidth={1.5} />}
        {pending ? 'Guardando…' : label}
      </Button>
    </div>
  );
}

export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col gap-0.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[var(--color-fg-muted)] leading-snug">
            {description}
          </p>
        )}
      </header>
      <div className="px-5 py-5">{children}</div>
    </article>
  );
}
