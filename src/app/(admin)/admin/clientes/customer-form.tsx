'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createCustomerAction,
  updateCustomerAction,
  type ActionState,
} from './actions';

const initial: ActionState = { status: 'idle' };

type Defaults = {
  cif: string;
  legalName: string;
  tradeName: string;
  emailBilling: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  iban: string;
  status: 'active' | 'suspended' | 'archived';
  notes: string;
};

const EMPTY_DEFAULTS: Defaults = {
  cif: '',
  legalName: '',
  tradeName: '',
  emailBilling: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  province: '',
  country: 'ES',
  iban: '',
  status: 'active',
  notes: '',
};

type Props = {
  mode: 'create' | 'edit';
  defaults?: Partial<Defaults>;
  customerId?: string;
  /** Si se crea a partir de un lead, se vincula al éxito. */
  fromLeadId?: string;
};

export function CustomerForm({ mode, defaults, customerId, fromLeadId }: Props) {
  const action = mode === 'edit' && customerId
    ? updateCustomerAction.bind(null, customerId)
    : createCustomerAction;
  const [state, formAction] = useActionState(action, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const d = { ...EMPTY_DEFAULTS, ...defaults };

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {fromLeadId && <input type="hidden" name="fromLeadId" value={fromLeadId} />}
      {/* Identificación */}
      <Section title="Identificación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="cif"
            label="CIF / NIF"
            required
            error={fieldErrors?.cif}
            hint="Ej. B18000001"
          >
            <Input
              id="cif"
              name="cif"
              required
              defaultValue={d.cif}
              invalid={!!fieldErrors?.cif}
              placeholder="B12345678"
              className="font-mono tnum"
            />
          </Field>

          <Field
            id="status"
            label="Estado"
            required
            error={fieldErrors?.status}
          >
            <Select name="status" defaultValue={d.status}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="legalName"
            label="Razón social"
            required
            error={fieldErrors?.legalName}
            className="md:col-span-2"
          >
            <Input
              id="legalName"
              name="legalName"
              required
              defaultValue={d.legalName}
              invalid={!!fieldErrors?.legalName}
              placeholder="Cerámicas Granadinas SL"
            />
          </Field>

          <Field
            id="tradeName"
            label="Nombre comercial"
            error={fieldErrors?.tradeName}
            className="md:col-span-2"
          >
            <Input
              id="tradeName"
              name="tradeName"
              defaultValue={d.tradeName}
              invalid={!!fieldErrors?.tradeName}
              placeholder="(Opcional)"
            />
          </Field>
        </div>
      </Section>

      {/* Contacto */}
      <Section title="Contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="emailBilling"
            label="Email de facturación"
            required
            error={fieldErrors?.emailBilling}
          >
            <Input
              id="emailBilling"
              name="emailBilling"
              type="email"
              required
              defaultValue={d.emailBilling}
              invalid={!!fieldErrors?.emailBilling}
              placeholder="facturacion@empresa.com"
            />
          </Field>

          <Field
            id="phone"
            label="Teléfono"
            error={fieldErrors?.phone}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={d.phone}
              invalid={!!fieldErrors?.phone}
              placeholder="+34 958 000 000"
            />
          </Field>
        </div>
      </Section>

      {/* Dirección */}
      <Section title="Dirección fiscal">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Field
            id="addressLine1"
            label="Dirección"
            required
            error={fieldErrors?.addressLine1}
            className="md:col-span-6"
          >
            <Input
              id="addressLine1"
              name="addressLine1"
              required
              defaultValue={d.addressLine1}
              invalid={!!fieldErrors?.addressLine1}
              placeholder="Calle, número"
            />
          </Field>

          <Field
            id="addressLine2"
            label="Complemento"
            error={fieldErrors?.addressLine2}
            className="md:col-span-6"
          >
            <Input
              id="addressLine2"
              name="addressLine2"
              defaultValue={d.addressLine2}
              invalid={!!fieldErrors?.addressLine2}
              placeholder="Piso, puerta, polígono…"
            />
          </Field>

          <Field
            id="postalCode"
            label="CP"
            required
            error={fieldErrors?.postalCode}
            className="md:col-span-1"
          >
            <Input
              id="postalCode"
              name="postalCode"
              required
              defaultValue={d.postalCode}
              invalid={!!fieldErrors?.postalCode}
              placeholder="18016"
              className="font-mono tnum"
            />
          </Field>

          <Field
            id="city"
            label="Ciudad"
            required
            error={fieldErrors?.city}
            className="md:col-span-2"
          >
            <Input
              id="city"
              name="city"
              required
              defaultValue={d.city}
              invalid={!!fieldErrors?.city}
              placeholder="Granada"
            />
          </Field>

          <Field
            id="province"
            label="Provincia"
            required
            error={fieldErrors?.province}
            className="md:col-span-2"
          >
            <Input
              id="province"
              name="province"
              required
              defaultValue={d.province}
              invalid={!!fieldErrors?.province}
              placeholder="Granada"
            />
          </Field>

          <Field
            id="country"
            label="País"
            required
            error={fieldErrors?.country}
            className="md:col-span-1"
          >
            <Input
              id="country"
              name="country"
              required
              defaultValue={d.country}
              invalid={!!fieldErrors?.country}
              maxLength={2}
              className="uppercase font-mono tnum"
            />
          </Field>
        </div>
      </Section>

      {/* Datos bancarios */}
      <Section title="Datos bancarios">
        <Field
          id="iban"
          label="IBAN"
          error={fieldErrors?.iban}
          hint="ES + 22 dígitos. Encriptado en BD."
        >
          <Input
            id="iban"
            name="iban"
            defaultValue={d.iban}
            invalid={!!fieldErrors?.iban}
            placeholder="ES00 0000 0000 0000 0000 0000"
            className="font-mono tnum"
            maxLength={34}
          />
        </Field>
      </Section>

      {/* Notas */}
      <Section title="Notas internas">
        <Field id="notes" label="Notas" error={fieldErrors?.notes}>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={d.notes}
            invalid={!!fieldErrors?.notes}
            placeholder="Visibles solo para el equipo Wyweb. Contexto, decisiones, contactos relevantes…"
            maxLength={5000}
          />
        </Field>
      </Section>

      <Feedback state={state} />

      <SubmitButton mode={mode} />
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h2>
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
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

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  const label = mode === 'create' ? 'Crear cliente' : 'Guardar cambios';
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="submit"
        variant="accent"
        size="md"
        loading={pending}
        disabled={pending}
      >
        {!pending && (mode === 'create' ? <ArrowRight className="h-4 w-4" strokeWidth={1.5} /> : <Save className="h-3.5 w-3.5" strokeWidth={1.5} />)}
        {pending ? 'Guardando…' : label}
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
