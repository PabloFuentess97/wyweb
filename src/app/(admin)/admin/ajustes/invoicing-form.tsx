'use client';

import { useActionState, useState } from 'react';
import { Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateInvoicingSettingsAction, type ActionState } from './actions';
import { FormCard, FormFeedback, FormField, SaveButton } from './form-bits';

const initial: ActionState = { status: 'idle' };

export type InvoicingDefaults = {
  invoicePrefix: string;
  invoiceSeries: string;
  invoiceNextNumber: number;
  invoiceNumberPadding: number;
  invoiceFooter: string | null;
  invoiceDefaultVatRate: string;
  invoiceDefaultPaymentTermsDays: number;
};

function previewNumber(opts: {
  prefix: string;
  series: string;
  next: number;
  padding: number;
}): string {
  const padded = String(opts.next).padStart(opts.padding, '0');
  return `${opts.prefix}-${opts.series}-${padded}`;
}

export function InvoicingForm({ defaults }: { defaults: InvoicingDefaults }) {
  const [state, formAction] = useActionState(updateInvoicingSettingsAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  const [prefix, setPrefix] = useState(defaults.invoicePrefix);
  const [series, setSeries] = useState(defaults.invoiceSeries);
  const [next, setNext] = useState(defaults.invoiceNextNumber);
  const [padding, setPadding] = useState(defaults.invoiceNumberPadding);

  const preview = previewNumber({ prefix, series, next, padding });

  return (
    <FormCard
      title="Numeración y facturación"
      description="Configuración usada al emitir facturas en F4. Una vez emitida la primera, no se puede bajar el contador."
    >
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        {/* Preview pegajoso */}
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-3)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-muted)]">
            Próxima factura
          </p>
          <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)]">
            {preview}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField id="invoicePrefix" label="Prefijo" required error={fe?.invoicePrefix}>
            <Input
              id="invoicePrefix"
              name="invoicePrefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              required
              maxLength={10}
              className="font-mono uppercase tnum"
              invalid={!!fe?.invoicePrefix}
            />
          </FormField>
          <FormField id="invoiceSeries" label="Serie" required error={fe?.invoiceSeries}>
            <Input
              id="invoiceSeries"
              name="invoiceSeries"
              value={series}
              onChange={(e) => setSeries(e.target.value.toUpperCase())}
              required
              maxLength={4}
              className="font-mono uppercase tnum"
              invalid={!!fe?.invoiceSeries}
            />
          </FormField>
          <FormField
            id="invoiceNextNumber"
            label="Siguiente nº"
            required
            error={fe?.invoiceNextNumber}
            hint={`Mínimo: ${defaults.invoiceNextNumber}`}
          >
            <div className="relative">
              <Hash
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-fg-subtle)] pointer-events-none"
                strokeWidth={1.5}
              />
              <Input
                id="invoiceNextNumber"
                name="invoiceNextNumber"
                type="number"
                value={next}
                onChange={(e) => setNext(Number(e.target.value) || 1)}
                required
                min={defaults.invoiceNextNumber}
                max={9_999_999}
                step={1}
                className="font-mono tnum pl-9"
                invalid={!!fe?.invoiceNextNumber}
              />
            </div>
          </FormField>
          <FormField
            id="invoiceNumberPadding"
            label="Padding ceros"
            required
            error={fe?.invoiceNumberPadding}
          >
            <Input
              id="invoiceNumberPadding"
              name="invoiceNumberPadding"
              type="number"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value) || 1)}
              required
              min={1}
              max={8}
              step={1}
              className="font-mono tnum"
              invalid={!!fe?.invoiceNumberPadding}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="invoiceDefaultVatRate"
            label="IVA por defecto (%)"
            required
            hint="Tipo aplicado a líneas nuevas. Editable por línea al emitir."
            error={fe?.invoiceDefaultVatRate}
          >
            <Input
              id="invoiceDefaultVatRate"
              name="invoiceDefaultVatRate"
              type="number"
              defaultValue={defaults.invoiceDefaultVatRate}
              required
              min={0}
              max={100}
              step="0.01"
              className="font-mono tnum"
              invalid={!!fe?.invoiceDefaultVatRate}
            />
          </FormField>
          <FormField
            id="invoiceDefaultPaymentTermsDays"
            label="Vencimiento por defecto (días)"
            required
            hint="Días desde la fecha de emisión hasta el vencimiento."
            error={fe?.invoiceDefaultPaymentTermsDays}
          >
            <Input
              id="invoiceDefaultPaymentTermsDays"
              name="invoiceDefaultPaymentTermsDays"
              type="number"
              defaultValue={defaults.invoiceDefaultPaymentTermsDays}
              required
              min={0}
              max={365}
              step={1}
              className="font-mono tnum"
              invalid={!!fe?.invoiceDefaultPaymentTermsDays}
            />
          </FormField>
        </div>

        <FormField
          id="invoiceFooter"
          label="Pie de página de facturas"
          hint="Texto legal o nota libre. Aparece bajo las líneas de cada PDF."
          error={fe?.invoiceFooter}
        >
          <Textarea
            id="invoiceFooter"
            name="invoiceFooter"
            defaultValue={defaults.invoiceFooter ?? ''}
            maxLength={2000}
            rows={4}
            placeholder="Pago mediante transferencia. Domiciliación SEPA disponible bajo solicitud."
            invalid={!!fe?.invoiceFooter}
          />
        </FormField>

        <FormFeedback state={state} />
        <SaveButton />
      </form>
    </FormCard>
  );
}
