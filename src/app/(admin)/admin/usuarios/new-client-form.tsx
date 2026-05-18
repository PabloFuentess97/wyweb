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
import { createClientUserAction, type ActionState } from './actions';

const initial: ActionState = { status: 'idle' };

type CustomerOption = { id: string; legalName: string; cif: string };

type Props = {
  customers: ReadonlyArray<CustomerOption>;
  defaultCustomerId?: string;
};

export function NewClientForm({ customers, defaultCustomerId }: Props) {
  const [state, formAction] = useActionState(createClientUserAction, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        id="customerId"
        label="Cliente"
        required
        error={fieldErrors?.customerId}
        hint="El usuario tendrá acceso solo a los datos de este cliente."
      >
        <Select
          name="customerId"
          defaultValue={defaultCustomerId ?? ''}
          required
        >
          <SelectTrigger id="customerId">
            <SelectValue placeholder="Selecciona un cliente activo" />
          </SelectTrigger>
          <SelectContent>
            {customers.length === 0 ? (
              <SelectItem value="__none__" disabled>
                Sin clientes activos
              </SelectItem>
            ) : (
              customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="font-mono text-xs tnum text-[var(--color-fg-muted)] mr-2">
                    {c.cif}
                  </span>
                  {c.legalName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field id="name" label="Nombre completo" required error={fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Marta Ruiz"
            invalid={!!fieldErrors?.name}
          />
        </Field>

        <Field id="email" label="Email" required error={fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="contacto@empresa.com"
            invalid={!!fieldErrors?.email}
          />
        </Field>

        <Field id="role" label="Rol del usuario" required error={fieldErrors?.role}>
          <Select name="role" defaultValue="client_user">
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client_user">
                Cliente · Usuario
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                  VER, ABRIR TICKETS
                </span>
              </SelectItem>
              <SelectItem value="client_admin">
                Cliente · Admin
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                  + INVITAR USUARIOS (F3)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          id="customerRole"
          label="Rol en el cliente"
          required
          error={fieldErrors?.customerRole}
          hint="Solo afecta a la vinculación con este customer."
        >
          <Select name="customerRole" defaultValue="viewer">
            <SelectTrigger id="customerRole">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="admin">Admin del cliente</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

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
        {pending ? 'Creando…' : 'Crear cliente y enviar invitación'}
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
