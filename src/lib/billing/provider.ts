import 'server-only';
import { env } from '@/lib/env';

export type InvoiceLineDraft = {
  description: string;
  serviceId?: string | null;
  quantity: number;
  unitPriceCents: number;
  vatRate: number;
  irpfRate?: number;
  sortOrder?: number;
};

export type CreateDraftParams = {
  customerId: string;
  lines: ReadonlyArray<InvoiceLineDraft>;
  notes?: string;
};

export type ProviderInvoice = {
  id: string;
  number: string;
  series: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: Date | null;
  dueAt: Date | null;
  paidAt: Date | null;
  subtotalCents: number;
  vatCents: number;
  irpfCents: number;
  totalCents: number;
  pdfStorageKey: string | null;
};

export class BillingNotConfiguredError extends Error {
  constructor(message = 'BillingProvider en modo noop. Cambia BILLING_PROVIDER en env.') {
    super(message);
    this.name = 'BillingNotConfiguredError';
  }
}

export class BillingInvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BillingInvalidStateError';
  }
}

export class BillingNotFoundError extends Error {
  constructor(invoiceId: string) {
    super(`Factura no encontrada: ${invoiceId}`);
    this.name = 'BillingNotFoundError';
  }
}

export interface BillingProvider {
  readonly kind: 'noop' | 'self-built' | 'holded' | 'quaderno';
  /** Indica si las acciones de emisión/cobro están disponibles. */
  readonly supportsIssuance: boolean;

  /** Crea factura en estado draft con líneas y totales calculados. No emite. */
  createDraft(
    params: CreateDraftParams,
    actorUserId: string,
  ): Promise<ProviderInvoice>;

  /** Emite factura: asigna número, fecha, genera PDF, sube a MinIO. */
  issue(invoiceId: string, actorUserId: string): Promise<ProviderInvoice>;

  /** Marca como pagada (issued/overdue → paid). */
  markPaid(
    invoiceId: string,
    actorUserId: string,
    paidAt?: Date,
  ): Promise<ProviderInvoice>;

  /** Cancela factura. Bloqueada si ya está paid. */
  cancel(
    invoiceId: string,
    actorUserId: string,
    reason: string,
  ): Promise<ProviderInvoice>;

  /** Devuelve URL firmada del PDF (TTL corto). */
  getPdfUrl(invoiceId: string): Promise<string>;

  /** Para integraciones externas: sincroniza facturas. Opcional. */
  sync?(): Promise<{ imported: number }>;
}

let cached: BillingProvider | null = null;

export function createBillingProvider(): BillingProvider {
  if (cached) return cached;
  const kind = env.BILLING_PROVIDER;
  // Imports dinámicos para no arrastrar @react-pdf/renderer cuando estamos en noop
  if (kind === 'self-built') {
    // require síncrono para evitar hacer la factory async
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./self-built') as typeof import('./self-built');
    cached = mod.createSelfBuiltProvider();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./noop') as typeof import('./noop');
    cached = mod.createNoopProvider();
  }
  return cached;
}
