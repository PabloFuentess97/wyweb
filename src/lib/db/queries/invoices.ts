import 'server-only';
import { and, asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, invoiceLines, invoices } from '@/lib/db/schema';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceListFilters = {
  status?: InvoiceStatus | 'all';
  year?: number;
  search?: string;
};

export type InvoiceListItem = {
  id: string;
  number: string;
  series: string;
  status: InvoiceStatus;
  issuedAt: Date | null;
  dueAt: Date | null;
  totalCents: number;
  hasPdf: boolean;
};

const PAGE_SIZE = 25;

export async function getInvoicesByCustomer(
  customerIds: ReadonlyArray<string>,
  filters: InvoiceListFilters = {},
  page = 1,
): Promise<{
  items: InvoiceListItem[];
  total: number;
  totalPages: number;
  page: number;
  availableYears: number[];
}> {
  if (customerIds.length === 0) {
    return { items: [], total: 0, totalPages: 1, page: 1, availableYears: [] };
  }

  const ids = customerIds as string[];
  const where = [inArray(invoices.customerId, ids)];

  // Cliente nunca ve drafts
  where.push(sql`${invoices.status} != 'draft'`);

  if (filters.status && filters.status !== 'all') {
    where.push(eq(invoices.status, filters.status));
  }
  if (filters.year && Number.isFinite(filters.year)) {
    where.push(sql`EXTRACT(YEAR FROM ${invoices.issuedAt}) = ${filters.year}`);
  }
  if (filters.search?.trim()) {
    where.push(ilike(invoices.number, `%${filters.search.trim()}%`));
  }

  const condition = and(...where);
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);

  const [items, totalRows, yearsRows] = await Promise.all([
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        series: invoices.series,
        status: invoices.status,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
        totalCents: invoices.totalCents,
        pdfStorageKey: invoices.pdfStorageKey,
      })
      .from(invoices)
      .where(condition)
      .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ value: sql<number>`COUNT(*)::int` })
      .from(invoices)
      .where(condition),
    db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${invoices.issuedAt})::int`,
      })
      .from(invoices)
      .where(
        and(
          inArray(invoices.customerId, ids),
          sql`${invoices.status} != 'draft'`,
          sql`${invoices.issuedAt} IS NOT NULL`,
        ),
      )
      .groupBy(sql`EXTRACT(YEAR FROM ${invoices.issuedAt})`)
      .orderBy(desc(sql`EXTRACT(YEAR FROM ${invoices.issuedAt})`)),
  ]);

  const total = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    items: items.map((r) => ({
      id: r.id,
      number: r.number,
      series: r.series,
      status: r.status,
      issuedAt: r.issuedAt ? new Date(r.issuedAt) : null,
      dueAt: r.dueAt ? new Date(r.dueAt) : null,
      totalCents: r.totalCents,
      hasPdf: !!r.pdfStorageKey,
    })),
    total,
    totalPages,
    page,
    availableYears: yearsRows.map((r) => r.year).filter((y) => Number.isFinite(y)),
  };
}

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: string;
  unitPriceCents: number;
  vatRate: string;
  irpfRate: string;
  subtotalCents: number;
  sortOrder: number;
};

export type InvoiceDetail = {
  id: string;
  number: string;
  series: string;
  status: InvoiceStatus;
  issuedAt: Date | null;
  dueAt: Date | null;
  paidAt: Date | null;
  subtotalCents: number;
  vatCents: number;
  irpfCents: number;
  totalCents: number;
  notes: string | null;
  pdfStorageKey: string | null;
  customer: {
    id: string;
    legalName: string;
    cif: string;
    addressLine1: string;
    addressLine2: string | null;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  lines: InvoiceLine[];
};

export async function getInvoiceForClient(
  invoiceId: string,
  customerIds: ReadonlyArray<string>,
): Promise<InvoiceDetail | null> {
  if (customerIds.length === 0) return null;
  const ids = customerIds as string[];

  const [row] = await db
    .select({
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
      customerId: customers.id,
      legalName: customers.legalName,
      cif: customers.cif,
      addressLine1: customers.addressLine1,
      addressLine2: customers.addressLine2,
      postalCode: customers.postalCode,
      city: customers.city,
      province: customers.province,
      country: customers.country,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .where(
      and(
        eq(invoices.id, invoiceId),
        inArray(invoices.customerId, ids),
        sql`${invoices.status} != 'draft'`,
      ),
    )
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
    .where(eq(invoiceLines.invoiceId, invoiceId))
    .orderBy(asc(invoiceLines.sortOrder), asc(invoiceLines.id));

  return {
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
    customer: {
      id: row.customerId,
      legalName: row.legalName,
      cif: row.cif,
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
