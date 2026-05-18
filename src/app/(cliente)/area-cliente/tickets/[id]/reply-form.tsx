'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addTicketMessageAction, type ActionState } from '../actions';

const initial: ActionState = { status: 'idle' };

type Props = {
  ticketId: string;
  disabled?: boolean;
};

export function ReplyForm({ ticketId, disabled }: Props) {
  const action = addTicketMessageAction.bind(null, ticketId);
  const [state, formAction] = useActionState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'idle' && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  if (disabled) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-1">
          TICKET CERRADO
        </p>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Este ticket está cerrado y no admite respuestas.{' '}
          <Link
            href="/area-cliente/tickets/nuevo"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Abre uno nuevo
          </Link>{' '}
          si necesitas seguir.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      noValidate
    >
      <Textarea
        name="body"
        rows={5}
        required
        minLength={2}
        maxLength={10_000}
        placeholder="Escribe tu respuesta…"
        invalid={state.status === 'error' && !!state.fieldErrors?.body}
        className="resize-y"
      />

      {state.status === 'error' && (
        <div
          className="flex items-start gap-2 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 mt-0.5"
            strokeWidth={1.5}
            aria-hidden
          />
          <p>{state.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          Cmd/Ctrl + Enter para enviar
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="sm"
      loading={pending}
      disabled={pending}
    >
      {!pending && <Send className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {pending ? 'Enviando…' : 'Enviar respuesta'}
    </Button>
  );
}
