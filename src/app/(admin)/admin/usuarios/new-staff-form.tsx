'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createStaffUserAction, type ActionState } from './actions';

const initial: ActionState = { status: 'idle' };

export function NewStaffForm() {
  const [state, formAction] = useActionState(createStaffUserAction, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        id="name"
        label="Nombre completo"
        required
        error={fieldErrors?.name}
      >
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Marta Castaño"
          invalid={!!fieldErrors?.name}
        />
      </Field>

      <Field
        id="email"
        label="Email corporativo"
        required
        error={fieldErrors?.email}
        hint="El usuario recibirá un email para fijar su contraseña."
      >
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="marta@wyweb.es"
          invalid={!!fieldErrors?.email}
        />
      </Field>

      <Field id="role" label="Rol" required error={fieldErrors?.role}>
        <Select name="role" defaultValue="staff_agent">
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff_agent">
              Staff · Agente
              <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                CLIENTES, TICKETS, LEADS
              </span>
            </SelectItem>
            <SelectItem value="staff_admin">
              Staff · Admin
              <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                + USUARIOS, AUDITORÍA, AJUSTES
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Feedback state={state} />

      <SubmitButton />
    </form>
  );
}

function Field({
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
  hint?: string;
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
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end mt-2">
      <Button type="submit" variant="accent" size="md" loading={pending} disabled={pending}>
        {pending ? 'Creando…' : 'Crear staff y enviar invitación'}
        {!pending && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
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
        <p>{state.message ?? 'Creado.'}</p>
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
