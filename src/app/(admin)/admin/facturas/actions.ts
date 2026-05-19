'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
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
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string>;
    };

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

const lineSchema = z.object({
  description: z.string().min(1, 'Descripción requerida').max(500),
  quantity: z.coerce.number().positive('Cantidad > 0').max(99999),
  unitPriceCents: z.coerce.number().int().min(0).max(99_999_999),
  vatRate: z.coerce.number().min(0).max(100),
  irpfRate: z.coerce.number().min(0).max(100).optional().default(0),
});

const createDraftSchema = z.object({
  customerId: z.string().uuid('Cliente requerido'),
  notes: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  lines: z.array(lineSchema).min(1, 'Añade al menos una línea'),
});

/**
 * Crea una factura draft desde FormData del form de "nueva factura".
 * Tras crearla, redirige al detalle para que el staff pueda emitir.
 */
export async function createDraftInvoiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  // Parse lines from FormData (formato lines[N][campo])
  const linesMap = new Map<
    number,
    Record<string, FormDataEntryValue>
  >();
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^lines\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const idx = Number(m[1]);
    const field = m[2] as string;
    if (!linesMap.has(idx)) linesMap.set(idx, {});
    linesMap.get(idx)![field] = value;
  }
  const linesRaw = Array.from(linesMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, l]) => l);

  const parsed = createDraftSchema.safeParse({
    customerId: formData.get('customerId'),
    notes: formData.get('notes'),
    lines: linesRaw,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.map((p) => String(p)).join('.');
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      status: 'error',
      message: 'Revisa los datos del formulario.',
      fieldErrors,
    };
  }

  const data = parsed.data;
  let createdId: string;
  try {
    const provider = createBillingProvider();
    const draft = await provider.createDraft(
      {
        customerId: data.customerId,
        notes: data.notes,
        lines: data.lines.map((l, idx) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
          vatRate: l.vatRate,
          irpfRate: l.irpfRate ?? 0,
          sortOrder: idx,
        })),
      },
      session.user.id,
    );
    createdId = draft.id;
  } catch (e) {
    return mapBillingError(e);
  }

  revalidatePath('/admin/facturas');
  redirect(`/admin/facturas/${createdId}`);
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
