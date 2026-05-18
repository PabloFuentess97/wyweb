'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction, type LoginState } from './actions';

const initial: LoginState = { status: 'idle' };

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction] = useActionState(loginAction, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          placeholder="tu@email.com"
          invalid={!!fieldErrors?.email}
        />
        {fieldErrors?.email && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor="password"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Contraseña
          </label>
          <Link
            href="/recuperar"
            className="text-xs text-[var(--color-accent)] hover:underline underline-offset-4"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          invalid={!!fieldErrors?.password}
        />
        {fieldErrors?.password && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {state.status === 'error' && !fieldErrors && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
          <p>{state.message}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" loading={pending} className="mt-2">
      {pending ? 'Entrando…' : 'Entrar'}
      {!pending && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}
