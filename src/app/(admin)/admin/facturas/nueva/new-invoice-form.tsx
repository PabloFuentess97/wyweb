'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, FilePlus2, Plus, Trash2 } from 'lucide-react';
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
import { formatEuros } from '@/lib/utils';
import { createDraftInvoiceAction, type ActionState } from '../actions';

type Customer = { id: string; legalName: string; cif: string };

type Props = {
  customers: ReadonlyArray<Customer>;
  defaultVatRate: number;
  nextNumberPreview: string;
};

type Line = {
  description: string;
  quantity: string;
  unitPriceEuros: string; // input en euros, lo pasamos a cents en submit (campo hidden)
  vatRate: string;
  irpfRate: string;
};

const emptyLine = (defaultVat: number): Line => ({
  description: '',
  quantity: '1',
  unitPriceEuros: '',
  vatRate: String(defaultVat),
  irpfRate: '0',
});

const initial: ActionState = { status: 'idle' };

export function NewInvoiceForm({
  customers,
  defaultVatRate,
  nextNumberPreview,
}: Props) {
  const [state, formAction] = useActionState(
    createDraftInvoiceAction,
    initial,
  );
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  const [lines, setLines] = useState<Line[]>([emptyLine(defaultVatRate)]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let vat = 0;
    let irpf = 0;
    for (const l of lines) {
      const qty = Number(l.quantity) || 0;
      const unit = Math.round((Number(l.unitPriceEuros) || 0) * 100);
      const lineSubtotal = Math.round(qty * unit);
      subtotal += lineSubtotal;
      vat += Math.round((lineSubtotal * (Number(l.vatRate) || 0)) / 100);
      irpf += Math.round((lineSubtotal * (Number(l.irpfRate) || 0)) / 100);
    }
    return {
      subtotalCents: subtotal,
      vatCents: vat,
      irpfCents: irpf,
      totalCents: subtotal + vat - irpf,
    };
  }, [lines]);

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(defaultVatRate)]);
  }

  function removeLine(idx: number) {
    setLines((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {/* Cliente + Preview número */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label
            htmlFor="customerId"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Cliente <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Select name="customerId">
            <SelectTrigger
              id="customerId"
              aria-invalid={fe?.customerId ? true : undefined}
            >
              <SelectValue placeholder="Selecciona un cliente activo" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.legalName}
                  <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                    {c.cif}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fe?.customerId && (
            <p className="text-xs text-[var(--color-danger)] font-medium">
              {fe.customerId}
            </p>
          )}
          {customers.length === 0 && (
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              No hay clientes activos. Crea uno en{' '}
              <a
                href="/admin/clientes/nuevo"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                /admin/clientes/nuevo
              </a>
              .
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-muted)]">
            Próximo número
          </p>
          <p className="font-mono text-xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)]">
            {nextNumberPreview}
          </p>
          <p className="text-[10px] text-[var(--color-fg-subtle)] leading-snug">
            Se asigna al emitir, no al guardar el borrador.
          </p>
        </div>
      </section>

      {/* Líneas */}
      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
            Líneas
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLine}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Añadir línea
          </Button>
        </header>

        {fe?.lines && (
          <p className="text-xs text-[var(--color-danger)] font-medium">
            {fe.lines}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {lines.map((line, idx) => {
            const qty = Number(line.quantity) || 0;
            const unitCents = Math.round(
              (Number(line.unitPriceEuros) || 0) * 100,
            );
            const lineSubtotalCents = Math.round(qty * unitCents);
            return (
              <article
                key={idx}
                className="grid grid-cols-12 gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="col-span-12 md:col-span-5 flex flex-col gap-1.5">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
                    htmlFor={`line-desc-${idx}`}
                  >
                    Descripción <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <Input
                    id={`line-desc-${idx}`}
                    name={`lines[${idx}][description]`}
                    value={line.description}
                    onChange={(e) =>
                      updateLine(idx, { description: e.target.value })
                    }
                    placeholder="Diseño web corporativa…"
                    maxLength={500}
                    invalid={!!fe?.[`lines.${idx}.description`]}
                    required
                  />
                </div>

                <div className="col-span-4 md:col-span-1 flex flex-col gap-1.5">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
                    htmlFor={`line-qty-${idx}`}
                  >
                    Cant.
                  </label>
                  <Input
                    id={`line-qty-${idx}`}
                    name={`lines[${idx}][quantity]`}
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(idx, { quantity: e.target.value })
                    }
                    className="font-mono tnum"
                    invalid={!!fe?.[`lines.${idx}.quantity`]}
                  />
                </div>

                <div className="col-span-4 md:col-span-2 flex flex-col gap-1.5">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
                    htmlFor={`line-price-${idx}`}
                  >
                    Precio ud. (€)
                  </label>
                  <Input
                    id={`line-price-${idx}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.unitPriceEuros}
                    onChange={(e) =>
                      updateLine(idx, { unitPriceEuros: e.target.value })
                    }
                    placeholder="0.00"
                    className="font-mono tnum"
                    invalid={!!fe?.[`lines.${idx}.unitPriceCents`]}
                  />
                  {/* Campo hidden con el valor en céntimos para enviar al server */}
                  <input
                    type="hidden"
                    name={`lines[${idx}][unitPriceCents]`}
                    value={unitCents}
                  />
                </div>

                <div className="col-span-4 md:col-span-1 flex flex-col gap-1.5">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
                    htmlFor={`line-vat-${idx}`}
                  >
                    IVA %
                  </label>
                  <Input
                    id={`line-vat-${idx}`}
                    name={`lines[${idx}][vatRate]`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={line.vatRate}
                    onChange={(e) =>
                      updateLine(idx, { vatRate: e.target.value })
                    }
                    className="font-mono tnum"
                    invalid={!!fe?.[`lines.${idx}.vatRate`]}
                  />
                </div>

                <div className="col-span-6 md:col-span-1 flex flex-col gap-1.5">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
                    htmlFor={`line-irpf-${idx}`}
                  >
                    IRPF %
                  </label>
                  <Input
                    id={`line-irpf-${idx}`}
                    name={`lines[${idx}][irpfRate]`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={line.irpfRate}
                    onChange={(e) =>
                      updateLine(idx, { irpfRate: e.target.value })
                    }
                    className="font-mono tnum"
                  />
                </div>

                <div className="col-span-4 md:col-span-1 flex flex-col gap-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none">
                    Subtotal
                  </p>
                  <p className="font-mono text-sm tnum font-semibold text-[var(--color-fg-strong)] h-10 inline-flex items-center">
                    {formatEuros(lineSubtotalCents)}
                  </p>
                </div>

                <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length === 1}
                    aria-label="Eliminar línea"
                    className="text-[var(--color-danger)] disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Totales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label
            htmlFor="notes"
            className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
          >
            Notas internas (opcional)
          </label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="Notas o referencias para esta factura…"
          />
        </div>

        <aside className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-2">
          <Row label="Base imponible" value={totals.subtotalCents} />
          <Row label="IVA" value={totals.vatCents} />
          {totals.irpfCents > 0 && (
            <Row label="IRPF retenido" value={-totals.irpfCents} />
          )}
          <div className="border-t border-[var(--color-fg-strong)] pt-3 mt-1 flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-strong)]">
              TOTAL
            </span>
            <span className="font-mono text-2xl tnum font-bold text-[var(--color-fg-strong)] leading-none">
              {formatEuros(totals.totalCents)}
            </span>
          </div>
        </aside>
      </section>

      <Feedback state={state} />

      <footer className="flex flex-wrap items-center justify-end gap-3">
        <Button asChild variant="ghost" size="md">
          <a href="/admin/facturas">Cancelar</a>
        </Button>
        <SubmitButton hasCustomers={customers.length > 0} />
      </footer>
    </form>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span className="font-mono tnum text-[var(--color-fg)]">
        {formatEuros(value)}
      </span>
    </div>
  );
}

function SubmitButton({ hasCustomers }: { hasCustomers: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="md"
      loading={pending}
      disabled={pending || !hasCustomers}
    >
      {!pending && <FilePlus2 className="h-4 w-4" strokeWidth={1.5} />}
      {pending ? 'Creando…' : 'Crear borrador'}
    </Button>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (state.status !== 'error' || state.fieldErrors) return null;
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
