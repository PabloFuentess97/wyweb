import 'server-only';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  auditLog,
  customers,
  invoiceLines,
  invoices,
  settings,
} from '@/lib/db/schema';
import { allocateNextInvoiceNumber, getSettings } from '@/lib/db/queries/settings';
import { getS3Client } from '@/lib/storage/s3';
import { getPresignedGetUrl } from '@/lib/storage/presigned';
import { renderInvoicePdf } from './pdf-template';
import {
  BillingInvalidStateError,
  BillingNotFoundError,
  type BillingProvider,
  type CreateDraftParams,
  type ProviderInvoice,
} from './provider';

const PDF_GET_TTL = 60 * 5; // 5 min

function toProviderInvoice(row: typeof invoices.$inferSelect): ProviderInvoice {
  return {
    id: row.id,
    number: row.number,
    series: row.series,
    status: row.status,
    issuedAt: row.issuedAt ? new Date(row.issuedAt) : null,
    dueAt: row.dueAt ? new Date(row.dueAt) : null,
    paidAt: row.paidAt ?? null,
    subtotalCents: row.subtotalCents,
    vatCents: row.vatCents,
    irpfCents: row.irpfCents,
    totalCents: row.totalCents,
    pdfStorageKey: row.pdfStorageKey,
  };
}

function computeLineSubtotal(line: { quantity: number; unitPriceCents: number }): number {
  // Redondeo bancario al céntimo
  return Math.round(line.quantity * line.unitPriceCents);
}

function computeTotals(
  lines: ReadonlyArray<{
    quantity: number;
    unitPriceCents: number;
    vatRate: number;
    irpfRate: number;
  }>,
): { subtotalCents: number; vatCents: number; irpfCents: number; totalCents: number } {
  let subtotal = 0;
  let vat = 0;
  let irpf = 0;
  for (const line of lines) {
    const lineSubtotal = computeLineSubtotal(line);
    subtotal += lineSubtotal;
    vat += Math.round((lineSubtotal * line.vatRate) / 100);
    irpf += Math.round((lineSubtotal * (line.irpfRate ?? 0)) / 100);
  }
  return {
    subtotalCents: subtotal,
    vatCents: vat,
    irpfCents: irpf,
    totalCents: subtotal + vat - irpf,
  };
}

function pdfStorageKey(invoiceId: string, number: string): string {
  return `invoices/${number}-${invoiceId.slice(0, 8)}.pdf`;
}

/**
 * Renderiza el PDF de una factura ya emitida y lo sube a MinIO.
 * Devuelve la storage key (o null si MinIO no está configurado).
 */
async function renderAndStorePdf(
  invoiceId: string,
  invoiceNumber: string,
): Promise<{ storageKey: string | null }> {
  const s3 = getS3Client();
  if (!s3) {
    console.warn('[self-built.issue] S3 not configured; skipping PDF upload.');
    return { storageKey: null };
  }

  const [row] = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      series: invoices.series,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      notes: invoices.notes,
      subtotalCents: invoices.subtotalCents,
      vatCents: invoices.vatCents,
      irpfCents: invoices.irpfCents,
      totalCents: invoices.totalCents,
      customerLegalName: customers.legalName,
      customerTradeName: customers.tradeName,
      customerCif: customers.cif,
      customerAddressLine1: customers.addressLine1,
      customerAddressLine2: customers.addressLine2,
      customerPostalCode: customers.postalCode,
      customerCity: customers.city,
      customerProvince: customers.province,
      customerCountry: customers.country,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(eq(invoices.id, invoiceId))
    .limit(1);
  if (!row) throw new BillingNotFoundError(invoiceId);

  const lines = await db
    .select({
      description: invoiceLines.description,
      quantity: invoiceLines.quantity,
      unitPriceCents: invoiceLines.unitPriceCents,
      vatRate: invoiceLines.vatRate,
      irpfRate: invoiceLines.irpfRate,
      subtotalCents: invoiceLines.subtotalCents,
    })
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoiceId));

  const stg = await getSettings();

  const buffer = await renderInvoicePdf({
    company: {
      legalName: stg.companyLegalName,
      cif: stg.companyCif,
      email: stg.companyEmail,
      phone: stg.companyPhone,
      website: stg.companyWebsite,
      addressLine1: stg.companyAddressLine1,
      addressLine2: stg.companyAddressLine2,
      postalCode: stg.companyPostalCode,
      city: stg.companyCity,
      province: stg.companyProvince,
      country: stg.companyCountry,
      bankIban: stg.bankIban,
      bankSwiftBic: stg.bankSwiftBic,
      bankName: stg.bankName,
      invoiceFooter: stg.invoiceFooter,
    },
    customer: {
      legalName: row.customerLegalName,
      tradeName: row.customerTradeName,
      cif: row.customerCif,
      addressLine1: row.customerAddressLine1,
      addressLine2: row.customerAddressLine2,
      postalCode: row.customerPostalCode,
      city: row.customerCity,
      province: row.customerProvince,
      country: row.customerCountry,
    },
    invoice: {
      number: row.number,
      series: row.series,
      issuedAt: row.issuedAt ? new Date(row.issuedAt) : new Date(),
      dueAt: row.dueAt ? new Date(row.dueAt) : null,
      notes: row.notes,
      subtotalCents: row.subtotalCents,
      vatCents: row.vatCents,
      irpfCents: row.irpfCents,
      totalCents: row.totalCents,
    },
    lines: lines.map((l) => ({
      description: l.description,
      quantity: Number(l.quantity),
      unitPriceCents: l.unitPriceCents,
      vatRate: Number(l.vatRate),
      irpfRate: Number(l.irpfRate),
      subtotalCents: l.subtotalCents,
    })),
  });

  const key = pdfStorageKey(invoiceId, invoiceNumber);
  await s3.client.send(
    new PutObjectCommand({
      Bucket: s3.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
      ContentDisposition: `attachment; filename="${invoiceNumber}.pdf"`,
    }),
  );

  return { storageKey: key };
}

export function createSelfBuiltProvider(): BillingProvider {
  return {
    kind: 'self-built',
    supportsIssuance: true,

    async createDraft(
      params: CreateDraftParams,
      actorUserId: string,
    ): Promise<ProviderInvoice> {
      if (params.lines.length === 0) {
        throw new BillingInvalidStateError('La factura debe tener al menos una línea.');
      }
      const totals = computeTotals(
        params.lines.map((l) => ({
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
          vatRate: l.vatRate,
          irpfRate: l.irpfRate ?? 0,
        })),
      );

      return await db.transaction(async (tx) => {
        // Verificar customer
        const [customer] = await tx
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.id, params.customerId))
          .limit(1);
        if (!customer) {
          throw new BillingInvalidStateError('Cliente no encontrado.');
        }

        // Número placeholder DRAFT-{ts} hasta emisión real
        const placeholder = `DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const [created] = await tx
          .insert(invoices)
          .values({
            customerId: params.customerId,
            number: placeholder,
            series: 'A',
            status: 'draft',
            subtotalCents: totals.subtotalCents,
            vatCents: totals.vatCents,
            irpfCents: totals.irpfCents,
            totalCents: totals.totalCents,
            notes: params.notes ?? null,
          })
          .returning();
        if (!created) throw new Error('Insert invoice failed');

        await tx.insert(invoiceLines).values(
          params.lines.map((l, idx) => ({
            invoiceId: created.id,
            description: l.description,
            serviceId: l.serviceId ?? null,
            quantity: String(l.quantity),
            unitPriceCents: l.unitPriceCents,
            vatRate: String(l.vatRate),
            irpfRate: String(l.irpfRate ?? 0),
            subtotalCents: computeLineSubtotal(l),
            sortOrder: l.sortOrder ?? idx,
          })),
        );

        await tx.insert(auditLog).values({
          actorUserId,
          action: 'invoice.created',
          entityType: 'invoice',
          entityId: created.id,
          diff: {
            customerId: params.customerId,
            lines: params.lines.length,
            totalCents: totals.totalCents,
          },
        });

        return toProviderInvoice(created);
      });
    },

    async issue(invoiceId: string, actorUserId: string): Promise<ProviderInvoice> {
      // Fase 1: dentro de transacción → leer + reservar número + actualizar estado
      const issuedAt = new Date();

      const issued = await db.transaction(async (tx) => {
        const [inv] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.id, invoiceId))
          .limit(1);
        if (!inv) throw new BillingNotFoundError(invoiceId);
        if (inv.status !== 'draft') {
          throw new BillingInvalidStateError(
            `La factura ya fue emitida (estado actual: ${inv.status}).`,
          );
        }

        const allocation = await allocateNextInvoiceNumber(tx);

        // Fecha de vencimiento desde settings
        const [stg] = await tx
          .select({ paymentTerms: settings.invoiceDefaultPaymentTermsDays })
          .from(settings)
          .where(eq(settings.id, 1))
          .limit(1);
        const paymentTerms = stg?.paymentTerms ?? 30;
        const dueAt = new Date(issuedAt);
        dueAt.setDate(dueAt.getDate() + paymentTerms);

        const [updated] = await tx
          .update(invoices)
          .set({
            number: allocation.formatted,
            series: allocation.series,
            status: 'issued',
            issuedAt: issuedAt.toISOString().slice(0, 10),
            dueAt: dueAt.toISOString().slice(0, 10),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoiceId))
          .returning();
        if (!updated) throw new Error('Update invoice failed');

        await tx.insert(auditLog).values({
          actorUserId,
          action: 'invoice.issued',
          entityType: 'invoice',
          entityId: invoiceId,
          diff: {
            number: allocation.formatted,
            issuedAt: issuedAt.toISOString(),
            dueAt: dueAt.toISOString().slice(0, 10),
          },
        });

        return updated;
      });

      // Fase 2: fuera de transacción (no bloquea la emisión si MinIO falla)
      // generar PDF + subir + guardar key
      try {
        const pdfBuffer = await renderAndStorePdf(issued.id, issued.number);
        if (pdfBuffer.storageKey) {
          await db
            .update(invoices)
            .set({
              pdfStorageKey: pdfBuffer.storageKey,
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, issued.id));
          // Re-leer para devolver el storageKey actualizado
          const [refreshed] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, issued.id))
            .limit(1);
          if (refreshed) return toProviderInvoice(refreshed);
        }
      } catch (e) {
        console.error('[self-built.issue] PDF generation failed (invoice still issued):', e);
        // La factura ya está emitida en BD; el PDF se puede regenerar después
      }

      return toProviderInvoice(issued);
    },

    async markPaid(
      invoiceId: string,
      actorUserId: string,
      paidAt?: Date,
    ): Promise<ProviderInvoice> {
      return await db.transaction(async (tx) => {
        const [inv] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.id, invoiceId))
          .limit(1);
        if (!inv) throw new BillingNotFoundError(invoiceId);
        if (inv.status !== 'issued' && inv.status !== 'overdue') {
          throw new BillingInvalidStateError(
            `Solo se pueden marcar como pagadas facturas emitidas o vencidas (estado actual: ${inv.status}).`,
          );
        }

        const when = paidAt ?? new Date();
        const [updated] = await tx
          .update(invoices)
          .set({ status: 'paid', paidAt: when, updatedAt: new Date() })
          .where(eq(invoices.id, invoiceId))
          .returning();
        if (!updated) throw new Error('Update invoice failed');

        await tx.insert(auditLog).values({
          actorUserId,
          action: 'invoice.paid',
          entityType: 'invoice',
          entityId: invoiceId,
          diff: {
            previousStatus: inv.status,
            paidAt: when.toISOString(),
            totalCents: inv.totalCents,
          },
        });

        return toProviderInvoice(updated);
      });
    },

    async cancel(
      invoiceId: string,
      actorUserId: string,
      reason: string,
    ): Promise<ProviderInvoice> {
      return await db.transaction(async (tx) => {
        const [inv] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.id, invoiceId))
          .limit(1);
        if (!inv) throw new BillingNotFoundError(invoiceId);
        if (inv.status === 'paid') {
          throw new BillingInvalidStateError(
            'No se puede cancelar una factura ya pagada. Emite una factura rectificativa.',
          );
        }
        if (inv.status === 'cancelled') {
          throw new BillingInvalidStateError('La factura ya estaba cancelada.');
        }

        const [updated] = await tx
          .update(invoices)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(invoices.id, invoiceId))
          .returning();
        if (!updated) throw new Error('Update invoice failed');

        await tx.insert(auditLog).values({
          actorUserId,
          action: 'invoice.cancelled',
          entityType: 'invoice',
          entityId: invoiceId,
          diff: { previousStatus: inv.status, reason },
        });

        return toProviderInvoice(updated);
      });
    },

    async getPdfUrl(invoiceId: string): Promise<string> {
      const [inv] = await db
        .select({ pdfStorageKey: invoices.pdfStorageKey, number: invoices.number })
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);
      if (!inv) throw new BillingNotFoundError(invoiceId);
      if (!inv.pdfStorageKey) {
        throw new BillingInvalidStateError(
          'Esta factura aún no tiene PDF generado. Vuelve a emitirla para regenerarlo.',
        );
      }
      return getPresignedGetUrl(inv.pdfStorageKey, {
        expiresIn: PDF_GET_TTL,
        filename: `${inv.number}.pdf`,
        contentType: 'application/pdf',
      });
    },

  };
}
