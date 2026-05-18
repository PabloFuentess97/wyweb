'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
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
import { createTicketAction, type ActionState } from '../actions';

const initial: ActionState = { status: 'idle' };

type ServiceOption = {
  id: string;
  code: string;
  name: string;
};

type Props = {
  services: ReadonlyArray<ServiceOption>;
  defaultServiceId?: string;
};

export function NewTicketForm({ services, defaultServiceId }: Props) {
  const [state, formAction] = useActionState(createTicketAction, initial);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subject"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
        >
          Asunto<span className="text-[var(--color-danger)] ml-1">*</span>
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          required
          minLength={5}
          maxLength={200}
          autoFocus
          placeholder="Resume el problema en una línea"
          invalid={!!fieldErrors?.subject}
        />
        {fieldErrors?.subject && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors.subject}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="priority"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Prioridad
          </label>
          <Select name="priority" defaultValue="normal">
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja · informativa</SelectItem>
              <SelectItem value="normal">Normal · estándar</SelectItem>
              <SelectItem value="high">Alta · afecta al servicio</SelectItem>
              <SelectItem value="critical">Crítica · paro total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="serviceId"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Servicio relacionado <span className="text-[var(--color-fg-subtle)] normal-case tracking-normal text-[10px]">(opcional)</span>
          </label>
          <Select name="serviceId" defaultValue={defaultServiceId ?? '__none__'}>
            <SelectTrigger id="serviceId">
              <SelectValue placeholder="Sin servicio asociado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin servicio asociado</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="font-mono text-xs tnum text-[var(--color-fg-muted)] mr-1.5">
                    {s.code}
                  </span>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="body"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
        >
          Descripción<span className="text-[var(--color-danger)] ml-1">*</span>
        </label>
        <Textarea
          id="body"
          name="body"
          required
          minLength={10}
          maxLength={10_000}
          rows={8}
          placeholder="Cuéntanos qué pasa, cuándo empezó, qué ya has probado y qué impacto tiene. Cuanto más concreto, más rápido podemos ayudarte."
          invalid={!!fieldErrors?.body}
        />
        {fieldErrors?.body && (
          <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
            {fieldErrors.body}
          </p>
        )}
        <p className="text-xs text-[var(--color-fg-muted)]">
          Mínimo 10 caracteres. Incluye horas, IPs, máquinas afectadas o lo que sepas
          del entorno.
        </p>
      </div>

      {state.status === 'error' && !fieldErrors && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
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

      {/* Empty source for action input — server validates via session/customerIds */}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-between gap-3 mt-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold">
        RESPUESTA SEGÚN SLA · {`<24H HÁBILES POR DEFECTO`}
      </p>
      <Button
        type="submit"
        variant="accent"
        size="md"
        loading={pending}
        disabled={pending}
      >
        {pending ? 'Creando…' : 'Crear ticket'}
        {!pending && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
      </Button>
    </div>
  );
}
