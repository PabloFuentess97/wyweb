'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recuperarAction, type RecuperarState } from './actions';

const initial: RecuperarState = { status: 'idle' };

export function RecuperarForm() {
  const [state, formAction] = useActionState(recuperarAction, initial);

  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-surface))] p-6">
        <div className="flex items-center gap-2.5">
          <CheckCircle2
            className="h-5 w-5 text-[var(--color-success)]"
            strokeWidth={1.5}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-success)] font-semibold">
            ENLACE ENVIADO
          </p>
        </div>
        <p className="text-sm text-[var(--color-fg)] leading-relaxed">
          Si la cuenta existe, te llegará un email con el enlace para fijar nueva
          contraseña. Revisa también la carpeta de spam — el enlace caduca en 7 días.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors"
        >
          Volver al inicio de sesión
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
          invalid={state.status === 'error'}
        />
      </div>

      {state.status === 'error' && (
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
      {pending ? 'Enviando…' : 'Enviar enlace de recuperación'}
      {!pending && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}
