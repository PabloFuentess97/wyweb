'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import zxcvbn from 'zxcvbn';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePasswordAction, type ActionState } from './actions';
import { cn } from '@/lib/utils';

const initial: ActionState = { status: 'idle' };

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
  email: string;
};

export function PasswordForm({ email }: Props) {
  const [state, formAction] = useActionState(changePasswordAction, initial);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === 'success' && formRef.current) {
      formRef.current.reset();
      setNewPassword('');
      setConfirm('');
    }
  }, [state]);

  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, feedback: '' };
    const r = zxcvbn(newPassword, [email.split('@')[0] ?? '', 'uxea', 'soluciones']);
    return {
      score: r.score,
      feedback:
        r.feedback.warning ||
        r.feedback.suggestions.join(' ') ||
        SCORE_LABELS[r.score],
    };
  }, [newPassword, email]);

  const tooShort = newPassword.length > 0 && newPassword.length < 12;
  const passwordsMatch = confirm.length === 0 || newPassword === confirm;
  const canSubmit =
    newPassword.length >= 12 &&
    strength.score >= MIN_SCORE &&
    passwordsMatch &&
    confirm.length > 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="currentPassword"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
        >
          Contraseña actual<span className="text-[var(--color-danger)] ml-1">*</span>
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          invalid={!!fieldErrors?.currentPassword}
        />
        {fieldErrors?.currentPassword && (
          <p className="text-xs text-[var(--color-danger)] font-medium">
            {fieldErrors.currentPassword}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor="newPassword"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
          >
            Nueva contraseña<span className="text-[var(--color-danger)] ml-1">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
            aria-pressed={showNew}
          >
            {showNew ? (
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
          id="newPassword"
          name="newPassword"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo 12 caracteres"
          invalid={!!fieldErrors?.newPassword || tooShort}
        />
        {newPassword.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
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
              <p className="text-xs text-[var(--color-fg-muted)]">
                {strength.feedback}
              </p>
            )}
          </div>
        )}
        {fieldErrors?.newPassword && (
          <p className="text-xs text-[var(--color-danger)] font-medium">
            {fieldErrors.newPassword}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
        >
          Repite la nueva<span className="text-[var(--color-danger)] ml-1">*</span>
        </label>
        <Input
          id="confirm"
          name="confirm"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          invalid={!!fieldErrors?.confirm || !passwordsMatch}
        />
        {(fieldErrors?.confirm || !passwordsMatch) && (
          <p className="text-xs text-[var(--color-danger)] font-medium">
            {fieldErrors?.confirm ?? 'Las contraseñas no coinciden'}
          </p>
        )}
      </div>

      <Feedback state={state} />

      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end">
      <Button
        type="submit"
        variant="accent"
        size="md"
        loading={pending}
        disabled={disabled || pending}
      >
        {!pending && <Save className="h-3.5 w-3.5" strokeWidth={1.5} />}
        {pending ? 'Guardando…' : 'Cambiar contraseña'}
      </Button>
    </div>
  );
}

function Feedback({ state }: { state: ActionState }) {
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
        <p>{state.message ?? 'Contraseña actualizada.'}</p>
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
