import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings, type Settings } from '@/lib/db/schema';
import type { EmailTemplatesMap } from '@/lib/validation/settings';

type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type AppSettings = Omit<Settings, 'emailTemplates' | 'invoiceDefaultVatRate'> & {
  emailTemplates: EmailTemplatesMap;
  invoiceDefaultVatRate: string;
};

const DEFAULT_ROW_ID = 1;

async function ensureRow(): Promise<void> {
  await db
    .insert(settings)
    .values({ id: DEFAULT_ROW_ID })
    .onConflictDoNothing({ target: settings.id });
}

export async function getSettings(): Promise<AppSettings> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, DEFAULT_ROW_ID))
    .limit(1);

  if (!row) {
    await ensureRow();
    const [seeded] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, DEFAULT_ROW_ID))
      .limit(1);
    if (!seeded) throw new Error('settings: failed to seed singleton row');
    return seeded as unknown as AppSettings;
  }

  return row as unknown as AppSettings;
}

export function previewInvoiceNumber(s: {
  invoicePrefix: string;
  invoiceSeries: string;
  invoiceNextNumber: number;
  invoiceNumberPadding: number;
}): string {
  const padded = String(s.invoiceNextNumber).padStart(s.invoiceNumberPadding, '0');
  return `${s.invoicePrefix}-${s.invoiceSeries}-${padded}`;
}

/**
 * Reserva atómicamente el siguiente número de factura.
 * Usa `UPDATE … RETURNING` que toma row-lock implícito y devuelve el valor anterior,
 * incrementando el contador en una sola operación. Idempotente bajo concurrencia.
 *
 * IMPORTANTE: llamar dentro de la misma transacción que el INSERT en `invoices`.
 * Si la transacción hace rollback, el contador también se revierte.
 */
export async function allocateNextInvoiceNumber(
  tx: DbOrTx,
): Promise<{ next: number; formatted: string; series: string }> {
  const [row] = await tx
    .update(settings)
    .set({ invoiceNextNumber: sql`${settings.invoiceNextNumber} + 1` })
    .where(eq(settings.id, 1))
    .returning({
      next: sql<number>`${settings.invoiceNextNumber} - 1`.as('reserved'),
      padding: settings.invoiceNumberPadding,
      prefix: settings.invoicePrefix,
      series: settings.invoiceSeries,
    });

  if (!row) {
    throw new Error('settings: row missing on allocateNextInvoiceNumber');
  }

  const reserved = Number(row.next);
  const padded = String(reserved).padStart(row.padding, '0');
  const formatted = `${row.prefix}-${row.series}-${padded}`;
  return { next: reserved, formatted, series: row.series };
}
