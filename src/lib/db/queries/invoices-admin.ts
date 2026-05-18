import 'server-only';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, invoiceLines, invoices } from '@/lib/db/schema';

export type AdminInvoiceListItem = {
  id: string;
  number: string;
  series: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: Date | null;
  dueAt: Date | null;
  paidAt: Date | null;
  totalCents: number;
  subtotalCents: number;
  vatCents: number;
  hasPdf: boolean;
  customerId: string;
  customerName: string;
  customerCif: string;
};

export async function getAdminInvoicesList(): Promise<AdminInvoiceListItem[]> {
  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      series: invoices.series,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
      totalCents: invoices.totalCents,
      subtotalCents: invoices.subtotalCents,
      vatCents: invoices.vatCents,
      pdfStorageKey: invoices.pdfStorageKey,
      customerId: customers.id,
      customerName: customers.legalName,
      customerCif: customers.cif,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt));

  return rows.map((r) => ({
    ...r,
    issuedAt: r.issuedAt ? new Date(r.issuedAt) : null,
    dueAt: r.dueAt ? new Date(r.dueAt) : null,
    hasPdf: !!r.pdfStorageKey,
  }));
}

export type AdminInvoiceDetail = {
  invoice: {
    id: string;
    number: string;
    series: string;
    status: AdminInvoiceListItem['status'];
    issuedAt: Date | null;
    dueAt: Date | null;
    paidAt: Date | null;
    subtotalCents: number;
    vatCents: number;
    irpfCents: number;
    totalCents: number;
    notes: string | null;
    pdfStorageKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  customer: {
    id: string;
    legalName: string;
    tradeName: string | null;
    cif: string;
    emailBilling: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  lines: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPriceCents: number;
    vatRate: string;
    irpfRate: string;
    subtotalCents: number;
    sortOrder: number;
  }>;
};

export async function getAdminInvoiceById(
  id: string,
): Promise<AdminInvoiceDetail | null> {
  const [row] = await db
    .select({
      // invoice
      id: invoices.id,
      number: invoices.number,
      series: invoices.series,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
      subtotalCents: invoices.subtotalCents,
      vatCents: invoices.vatCents,
      irpfCents: invoices.irpfCents,
      totalCents: invoices.totalCents,
      notes: invoices.notes,
      pdfStorageKey: invoices.pdfStorageKey,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      // customer
      customerId: customers.id,
      legalName: customers.legalName,
      tradeName: customers.tradeName,
      cif: customers.cif,
      emailBilling: customers.emailBilling,
      phone: customers.phone,
      addressLine1: customers.addressLine1,
      addressLine2: customers.addressLine2,
      postalCode: customers.postalCode,
      city: customers.city,
      province: customers.province,
      country: customers.country,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(eq(invoices.id, id))
    .limit(1);

  if (!row) return null;

  const lines = await db
    .select({
      id: invoiceLines.id,
      description: invoiceLines.description,
      quantity: invoiceLines.quantity,
      unitPriceCents: invoiceLines.unitPriceCents,
      vatRate: invoiceLines.vatRate,
      irpfRate: invoiceLines.irpfRate,
      subtotalCents: invoiceLines.subtotalCents,
      sortOrder: invoiceLines.sortOrder,
    })
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, id))
    .orderBy(asc(invoiceLines.sortOrder), asc(invoiceLines.id));

  return {
    invoice: {
      id: row.id,
      number: row.number,
      series: row.series,
      status: row.status,
      issuedAt: row.issuedAt ? new Date(row.issuedAt) : null,
      dueAt: row.dueAt ? new Date(row.dueAt) : null,
      paidAt: row.paidAt ? new Date(row.paidAt) : null,
      subtotalCents: row.subtotalCents,
      vatCents: row.vatCents,
      irpfCents: row.irpfCents,
      totalCents: row.totalCents,
      notes: row.notes,
      pdfStorageKey: row.pdfStorageKey,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    customer: {
      id: row.customerId,
      legalName: row.legalName,
      tradeName: row.tradeName,
      cif: row.cif,
      emailBilling: row.emailBilling,
      phone: row.phone,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      postalCode: row.postalCode,
      city: row.city,
      province: row.province,
      country: row.country,
    },
    lines,
  };
}

export async function getInvoicesAggregateStats(): Promise<{
  total: number;
  totalIssuedCents: number;
  pendingCents: number;
  overdueCount: number;
}> {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      totalIssuedCents: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('issued','paid','overdue') THEN ${invoices.totalCents} ELSE 0 END), 0)::bigint`,
      pendingCents: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('issued','overdue') THEN ${invoices.totalCents} ELSE 0 END), 0)::bigint`,
      overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${invoices.status} = 'overdue')::int`,
    })
    .from(invoices);

  if (!row) {
    return { total: 0, totalIssuedCents: 0, pendingCents: 0, overdueCount: 0 };
  }
  return {
    total: row.total,
    totalIssuedCents: Number(row.totalIssuedCents),
    pendingCents: Number(row.pendingCents),
    overdueCount: row.overdueCount,
  };
}
