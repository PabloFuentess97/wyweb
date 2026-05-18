'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createBillingProvider } from '@/lib/billing/provider';
import {
  BillingInvalidStateError,
  BillingNotConfiguredError,
  BillingNotFoundError,
} from '@/lib/billing/provider';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string };

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) {
    return { error: 'Esta acción requiere rol staff.', session: null as never };
  }
  return { error: null as never, session };
}

function mapBillingError(e: unknown): { status: 'error'; message: string } {
  if (e instanceof BillingNotConfiguredError) {
    return {
      status: 'error',
      message:
        'BillingProvider en modo "noop". Configura BILLING_PROVIDER=self-built en el entorno.',
    };
  }
  if (e instanceof BillingInvalidStateError) {
    return { status: 'error', message: e.message };
  }
  if (e instanceof BillingNotFoundError) {
    return { status: 'error', message: e.message };
  }
  console.error('[billing action] error:', e);
  return { status: 'error', message: 'Error inesperado emitiendo la factura.' };
}

function revalidateInvoice(invoiceId: string) {
  revalidatePath('/admin/facturas');
  revalidatePath(`/admin/facturas/${invoiceId}`);
  revalidatePath('/area-cliente/facturas');
  revalidatePath(`/area-cliente/facturas/${invoiceId}`);
}

export async function issueInvoiceAction(
  invoiceId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  try {
    const provider = createBillingProvider();
    const result = await provider.issue(invoiceId, session.user.id);
    revalidateInvoice(invoiceId);
    const pdfNote = result.pdfStorageKey
      ? ''
      : ' (PDF no se subió: revisa la config de MinIO)';
    return {
      status: 'success',
      message: `Factura emitida con número ${result.number}.${pdfNote}`,
    };
  } catch (e) {
    return mapBillingError(e);
  }
}

export async function markInvoicePaidAction(
  invoiceId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  try {
    const provider = createBillingProvider();
    await provider.markPaid(invoiceId, session.user.id);
    revalidateInvoice(invoiceId);
    return { status: 'success', message: 'Factura marcada como pagada.' };
  } catch (e) {
    return mapBillingError(e);
  }
}

export async function cancelInvoiceAction(
  invoiceId: string,
  reason: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const trimmed = reason.trim();
  if (trimmed.length < 5) {
    return {
      status: 'error',
      message: 'Indica un motivo de al menos 5 caracteres.',
    };
  }

  try {
    const provider = createBillingProvider();
    await provider.cancel(invoiceId, session.user.id, trimmed);
    revalidateInvoice(invoiceId);
    return { status: 'success', message: 'Factura cancelada.' };
  } catch (e) {
    return mapBillingError(e);
  }
}
