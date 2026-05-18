'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import zxcvbn from 'zxcvbn';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { restablecerAction, type RestablecerState } from './actions';
import { cn } from '@/lib/utils';

const initial: RestablecerState = { status: 'idle' };

const SCORE_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'] as const;
const SCORE_COLORS = [
  'bg-[var(--color-danger)]',
  'bg-[var(--color-warning)]',
  'bg-[var(--color-warning)]',
  'bg-[var(--color-success)]',
  'bg-[var(--color-success)]',
];

const MIN_SCORE = 3;

type Props = {
  token: string;
  email: string;
};

export function RestablecerForm({ token, email }: Props) {
  const [state, formAction] = useActionState(restablecerAction, initial);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  const strength = useMemo(() => {
    if (!password) return { score: 0, feedback: '' };
    const result = zxcvbn(password, [email.split('@')[0] ?? '', 'uxea', 'soluciones']);
    return {
      score: result.score,
      feedback:
        result.feedback.warning ||
        result.feedback.suggestions.join(' ') ||
        SCORE_LABELS[result.score],
    };
  }, [password, email]);

  const tooShort = password.length > 0 && password.length < 12;
  const passwordsMatch = confirm.length === 0 || password === confirm;
  const canSubmit =
    password.length >= 12 &&
    strength.score >= MIN_SCORE &&
    passwordsMatch &&
    confirm.length > 0;

  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-surface))] p-6">
        <div className="flex items-center gap-2.5">
          <CheckCircle2
            className="h-5 w-5 text-[var(--color-success)]"
            strokeWidth={1.5}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-success)] font-semibold">
            CONTRASEÑA ACTUALIZADA
          </p>
        </div>
        <p className="text-sm text-[var(--color-fg)] leading-relaxed">
          Tu contraseña se ha guardado correctamente. Ya puedes iniciar sesión con ella.
        </p>
        <Button asChild variant="accent" size="md" className="w-fit">
          <Link href="/login">
            Iniciar sesión
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Button>
      </div>
    );
  }

  if (state.status === 'error' && state.code === 'TOKEN_INVALID') {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-6">
        <div className="flex items-center gap-2.5">
          <AlertCircle
            className="h-5 w-5 text-[var(--color-danger)]"
            strokeWidth={1.5}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-danger)] font-semibold">
            ENLACE NO VÁLIDO
          </p>
        </div>
        <p className="text-sm text-[var(--color-fg)] leading-relaxed">{state.message}</p>
        <Button asChild variant="secondary" size="md" className="w-fit">
          <Link href="/recuperar">Solicitar nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor="password"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Nueva contraseña
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <>
                <EyeOff className="h-3 w-3" strokeWidth={1.5} />
                OCULTAR
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" strokeWidth={1.5} />
                MOSTRAR
              </>
            )}
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 12 caracteres"
          invalid={!!fieldErrors?.password || tooShort}
        />
        {/* Strength meter */}
        {password.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1.5">
            <div
              className="grid grid-cols-4 gap-1"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={strength.score}
              aria-label="Fuerza de la contraseña"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 rounded-full transition-colors duration-150',
                    i < strength.score
                      ? SCORE_COLORS[strength.score]
                      : 'bg-[var(--color-border)]',
                  )}
                />
              ))}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
                FUERZA · {SCORE_LABELS[strength.score]}
              </span>
              {strength.score < MIN_SCORE && (
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
                  REQUIERE BUENA O MEJOR
                </span>
              )}
            </div>
            {strength.feedback && strength.score < MIN_SCORE && (
              <p className="text-xs text-[var(--color-fg-muted)] leading-snug">
                {strength.feedback}
              </p>
            )}
          </div>
        )}
        {fieldErrors?.password && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
        >
          Repite la contraseña
        </label>
        <Input
          id="confirm"
          name="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repítela igual"
          invalid={!!fieldErrors?.confirm || !passwordsMatch}
        />
        {(!passwordsMatch || fieldErrors?.confirm) && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors?.confirm ?? 'Las contraseñas no coinciden'}
          </p>
        )}
      </div>

      {state.status === 'error' && !fieldErrors && state.code !== 'TOKEN_INVALID' && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
          <p>{state.message}</p>
        </div>
      )}

      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="lg"
      loading={pending}
      disabled={disabled || pending}
    >
      {pending ? 'Guardando…' : 'Guardar contraseña'}
      {!pending && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}
