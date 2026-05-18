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
  createServiceAction,
  updateServiceAction,
  type ActionState,
} from './actions';

const initial: ActionState = { status: 'idle' };

type Defaults = {
  customerId: string;
  name: string;
  description: string;
  category: 'web-design' | 'saas' | 'ecommerce' | 'seo' | 'maintenance' | 'branding';
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  slaTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  startedAt: string;
  endedAt: string;
  monthlyFee: string; // mostrado en € (no cents)
  metadata: string;
};

const EMPTY: Defaults = {
  customerId: '',
  name: '',
  description: '',
  category: 'web-design',
  status: 'pending',
  slaTier: 'none',
  startedAt: '',
  endedAt: '',
  monthlyFee: '',
  metadata: '',
};

type CustomerOption = { id: string; legalName: string; cif: string };

type Props = {
  mode: 'create' | 'edit';
  customers: ReadonlyArray<CustomerOption>;
  defaults?: Partial<Defaults>;
  serviceId?: string;
  /** Estado actual del servicio en edit, para narrowing del Select de status. */
  currentStatus?: 'active' | 'pending' | 'suspended' | 'terminated';
};

export function ServiceForm({
  mode,
  customers,
  defaults,
  serviceId,
  currentStatus,
}: Props) {
  const action =
    mode === 'edit' && serviceId
      ? updateServiceAction.bind(null, serviceId)
      : createServiceAction;
  const [state, formAction] = useActionState(action, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const d = { ...EMPTY, ...defaults };

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {/* Cliente + identificación */}
      <Section title="Identificación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="customerId"
            label="Cliente"
            required
            error={fieldErrors?.customerId}
            className="md:col-span-2"
          >
            <Select name="customerId" defaultValue={d.customerId} required>
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

          <Field
            id="name"
            label="Nombre del servicio"
            required
            error={fieldErrors?.name}
            className="md:col-span-2"
          >
            <Input
              id="name"
              name="name"
              required
              defaultValue={d.name}
              invalid={!!fieldErrors?.name}
              placeholder="Fibra empresarial 1Gbps"
            />
          </Field>

          <Field
            id="description"
            label="Descripción"
            error={fieldErrors?.description}
            className="md:col-span-2"
          >
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={d.description}
              invalid={!!fieldErrors?.description}
              placeholder="Detalles técnicos, alcance, condiciones específicas…"
            />
          </Field>
        </div>
      </Section>

      {/* Categoría + SLA + Status */}
      <Section title="Configuración">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            id="category"
            label="Categoría"
            required
            error={fieldErrors?.category}
          >
            <Select name="category" defaultValue={d.category}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web-design">Diseño web</SelectItem>
                <SelectItem value="saas">SaaS a medida</SelectItem>
                <SelectItem value="ecommerce">Ecommerce</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field id="slaTier" label="SLA" error={fieldErrors?.slaTier}>
            <Select name="slaTier" defaultValue={d.slaTier}>
              <SelectTrigger id="slaTier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin SLA</SelectItem>
                <SelectItem value="bronze">Bronze · 8×5 / 8h</SelectItem>
                <SelectItem value="silver">Silver · 8×5 / 4h</SelectItem>
                <SelectItem value="gold">Gold · 24×7 / 2h</SelectItem>
                <SelectItem value="platinum">Platinum · 24×7 / 30 min</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="status"
            label="Estado"
            error={fieldErrors?.status}
            hint={
              mode === 'edit' && currentStatus
                ? `Actual: ${currentStatus}`
                : undefined
            }
          >
            <Select name="status" defaultValue={d.status}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
                <SelectItem value="terminated">Terminado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Vigencia + facturación */}
      <Section title="Vigencia y facturación">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            id="startedAt"
            label="Fecha inicio"
            error={fieldErrors?.startedAt}
          >
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              defaultValue={d.startedAt}
              invalid={!!fieldErrors?.startedAt}
              className="font-mono"
            />
          </Field>

          <Field
            id="endedAt"
            label="Fecha fin"
            error={fieldErrors?.endedAt}
          >
            <Input
              id="endedAt"
              name="endedAt"
              type="date"
              defaultValue={d.endedAt}
              invalid={!!fieldErrors?.endedAt}
              className="font-mono"
            />
          </Field>

          <Field
            id="monthlyFeeCents"
            label="Cuota mensual (€)"
            error={fieldErrors?.monthlyFeeCents}
            hint="Ingresar en céntimos. 29900 = 299€/mes"
          >
            <Input
              id="monthlyFeeCents"
              name="monthlyFeeCents"
              type="number"
              min={0}
              max={10_000_000}
              step={1}
              defaultValue={d.monthlyFee}
              invalid={!!fieldErrors?.monthlyFeeCents}
              placeholder="29900"
              className="font-mono tnum"
            />
          </Field>
        </div>
      </Section>

      {/* Metadata */}
      <Section title="Metadata técnica (JSON)">
        <Field
          id="metadata"
          label="Metadata"
          error={fieldErrors?.metadata}
          hint='Datos específicos por categoría. Ej: {"router_id":"abc","sensor_count":24}'
        >
          <Textarea
            id="metadata"
            name="metadata"
            rows={5}
            defaultValue={d.metadata}
            invalid={!!fieldErrors?.metadata}
            placeholder="{}"
            className="font-mono text-xs"
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
  return (
    <div className="flex items-center justify-end">
      <Button
        type="submit"
        variant="accent"
        size="md"
        loading={pending}
        disabled={pending}
      >
        {!pending &&
          (mode === 'create' ? (
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
          ))}
        {pending
          ? 'Guardando…'
          : mode === 'create'
            ? 'Crear servicio'
            : 'Guardar cambios'}
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
