'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { addAdminMessageAction, type ActionState } from '../actions';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const initial: ActionState = { status: 'idle' };

type Props = {
  ticketId: string;
  disabled?: boolean;
};

export function AdminReplyForm({ ticketId, disabled }: Props) {
  const action = addAdminMessageAction.bind(null, ticketId);
  const [state, formAction] = useActionState(action, initial);
  const [isInternal, setIsInternal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success' && formRef.current) {
      formRef.current.reset();
      setIsInternal(false);
    }
  }, [state]);

  if (disabled) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-1">
          TICKET CERRADO
        </p>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Reabre el ticket cambiando el estado para responder.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4',
        isInternal
          ? 'border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_4%,var(--color-surface))]'
          : 'border-[var(--color-border)]',
      )}
      noValidate
    >
      <div className="flex items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-strong)]">
          {isInternal ? 'Nota interna' : 'Responder al cliente'}
        </h3>
        {isInternal && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
            <Lock className="h-3 w-3" strokeWidth={1.5} />
            INVISIBLE PARA EL CLIENTE
          </span>
        )}
      </div>

      <Textarea
        name="body"
        rows={5}
        required
        minLength={2}
        maxLength={10_000}
        placeholder={
          isInternal
            ? 'Notas privadas del equipo (no las verá el cliente)…'
            : 'Respuesta pública al cliente. Disparará email de notificación.'
        }
        invalid={state.status === 'error' && !!state.fieldErrors?.body}
        className="resize-y"
      />

      {state.status === 'error' && (
        <div className="flex items-start gap-2 text-sm text-[var(--color-danger)]" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
          <p>{state.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <Checkbox
            name="isInternal"
            checked={isInternal}
            onCheckedChange={(v) => setIsInternal(v === true)}
          />
          <span className="text-sm text-[var(--color-fg)] select-none">
            Nota interna
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
            (NO ENVIAR EMAIL)
          </span>
        </label>
        <SubmitButton isInternal={isInternal} />
      </div>
    </form>
  );
}

function SubmitButton({ isInternal }: { isInternal: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={isInternal ? 'secondary' : 'accent'}
      size="sm"
      loading={pending}
      disabled={pending}
    >
      {!pending && (isInternal ? <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Send className="h-3.5 w-3.5" strokeWidth={1.5} />)}
      {pending
        ? 'Enviando…'
        : isInternal
          ? 'Guardar nota'
          : 'Enviar respuesta'}
    </Button>
  );
}
