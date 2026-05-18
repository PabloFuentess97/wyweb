'use client';

import { useState, useTransition } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Loader2,
  Send,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  cancelInvoiceAction,
  issueInvoiceAction,
  markInvoicePaidAction,
  type ActionState,
} from '../actions';

type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

type Props = {
  invoiceId: string;
  status: InvoiceStatus;
  hasPdf: boolean;
};

export function InvoiceControls({ invoiceId, status, hasPdf }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionState>({ status: 'idle' });
  const [cancelOpen, setCancelOpen] = useState(false);

  const canIssue = status === 'draft';
  const canMarkPaid = status === 'issued' || status === 'overdue';
  const canCancel = status === 'draft' || status === 'issued' || status === 'overdue';
  const canRegeneratePdf = status === 'issued' || status === 'overdue' || status === 'paid';

  function runIssue() {
    if (!confirm('¿Emitir factura ahora? Se asignará un número correlativo y se generará el PDF. Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      const result = await issueInvoiceAction(invoiceId);
      setFeedback(result);
    });
  }

  function runMarkPaid() {
    if (!confirm('¿Marcar como pagada? Se registrará la fecha de pago en el momento actual.')) return;
    startTransition(async () => {
      const result = await markInvoicePaidAction(invoiceId);
      setFeedback(result);
    });
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          Workflow de facturación
        </h2>
      </header>
      <div className="px-5 py-4 flex flex-col gap-3">
        <FeedbackBox state={feedback} />

        <div className="flex flex-wrap gap-2">
          {canIssue && (
            <Button
              type="button"
              variant="accent"
              size="md"
              onClick={runIssue}
              disabled={pending}
              loading={pending}
            >
              {!pending && <Send className="h-4 w-4" strokeWidth={1.5} />}
              {pending ? 'Emitiendo…' : 'Emitir factura'}
            </Button>
          )}

          {canMarkPaid && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={runMarkPaid}
              disabled={pending}
              loading={pending}
            >
              {!pending && <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />}
              {pending ? 'Procesando…' : 'Marcar como pagada'}
            </Button>
          )}

          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setCancelOpen(true)}
              disabled={pending}
              className="text-[var(--color-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger)_8%,transparent)]"
            >
              <Ban className="h-4 w-4" strokeWidth={1.5} />
              Cancelar factura
            </Button>
          )}

          {!canIssue && !canMarkPaid && !canCancel && (
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
              {status === 'cancelled'
                ? 'Factura cancelada · sin acciones disponibles'
                : status === 'paid'
                  ? 'Factura pagada · sin acciones disponibles'
                  : '—'}
            </p>
          )}
        </div>

        {canRegeneratePdf && !hasPdf && (
          <aside className="flex items-start gap-2 rounded-[var(--radius-3)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-3 text-xs text-[var(--color-fg-muted)]">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
            <p className="leading-relaxed">
              Esta factura está emitida pero no tiene PDF (probablemente la subida a MinIO falló).
              La regeneración del PDF llegará en una iteración siguiente; por ahora puedes ver los
              datos y totales en este detalle.
            </p>
          </aside>
        )}
      </div>

      <CancelDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => {
          startTransition(async () => {
            const result = await cancelInvoiceAction(invoiceId, reason);
            setFeedback(result);
            if (result.status === 'success') setCancelOpen(false);
          });
        }}
        pending={pending}
      />
    </section>
  );
}

function CancelDialog({
  open,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar factura</DialogTitle>
          <DialogDescription>
            Indica el motivo de la cancelación. Quedará registrado en el log de auditoría. No se
            puede deshacer; si necesitas re-emitir, crea una nueva factura.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Cliente solicitó anulación tras error en el importe…"
          className="text-sm"
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onConfirm(reason)}
            disabled={pending || reason.trim().length < 5}
            loading={pending}
            className="bg-[var(--color-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger)_85%,black)]"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <XCircle className="h-4 w-4" strokeWidth={1.5} />
            )}
            Cancelar factura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackBox({ state }: { state: ActionState }) {
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
        <p>{state.message ?? 'OK.'}</p>
      </div>
    );
  }
  if (state.status === 'error') {
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
