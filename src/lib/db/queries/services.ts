import 'server-only';
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  customers,
  documents,
  invoices,
  services,
  tickets,
} from '@/lib/db/schema';

export type ServiceCategory =
  | 'web-design'
  | 'saas'
  | 'ecommerce'
  | 'seo'
  | 'maintenance'
  | 'branding';

export type ServiceStatus = 'active' | 'pending' | 'suspended' | 'terminated';

export type SlaTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type ServiceListItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  status: ServiceStatus;
  slaTier: SlaTier;
  startedAt: string | null;
  monthlyFeeCents: number | null;
};

export async function getServicesByCustomer(
  customerIds: ReadonlyArray<string>,
): Promise<ServiceListItem[]> {
  if (customerIds.length === 0) return [];
  const rows = await db
    .select({
      id: services.id,
      code: services.code,
      name: services.name,
      description: services.description,
      category: services.category,
      status: services.status,
      slaTier: services.slaTier,
      startedAt: services.startedAt,
      monthlyFeeCents: services.monthlyFeeCents,
    })
    .from(services)
    .where(inArray(services.customerId, customerIds as string[]))
    .orderBy(
      // Activos primero, luego por fecha
      sql`CASE ${services.status}
        WHEN 'active' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'suspended' THEN 3
        WHEN 'terminated' THEN 4
      END`,
      asc(services.code),
    );
  return rows;
}

export type ServiceDetail = {
  service: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: ServiceCategory;
    status: ServiceStatus;
    slaTier: SlaTier;
    startedAt: string | null;
    endedAt: string | null;
    monthlyFeeCents: number | null;
    metadata: Record<string, unknown>;
    customerId: string;
    customerName: string;
  };
  relatedTickets: Array<{
    id: string;
    number: string;
    subject: string;
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'critical';
    createdAt: Date;
  }>;
  relatedInvoices: Array<{
    id: string;
    number: string;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
    issuedAt: Date | null;
    totalCents: number;
  }>;
  relatedDocuments: Array<{
    id: string;
    name: string;
    category: 'contract' | 'certificate' | 'report' | 'other';
    sizeBytes: number;
    mimeType: string;
    createdAt: Date;
  }>;
};

/**
 * Devuelve el servicio si pertenece a alguno de los `customerIds` autorizados.
 * Si no, devuelve `null` (auth implícito vía constraint).
 */
export async function getServiceForClient(
  serviceId: string,
  customerIds: ReadonlyArray<string>,
): Promise<ServiceDetail | null> {
  if (customerIds.length === 0) return null;

  const ids = customerIds as string[];

  const [row] = await db
    .select({
      id: services.id,
      code: services.code,
      name: services.name,
      description: services.description,
      category: services.category,
      status: services.status,
      slaTier: services.slaTier,
      startedAt: services.startedAt,
      endedAt: services.endedAt,
      monthlyFeeCents: services.monthlyFeeCents,
      metadata: services.metadata,
      customerId: services.customerId,
      customerName: customers.legalName,
    })
    .from(services)
    .innerJoin(customers, eq(customers.id, services.customerId))
    .where(and(eq(services.id, serviceId), inArray(services.customerId, ids)))
    .limit(1);

  if (!row) return null;

  // Cargar related en paralelo
  const [relatedTickets, relatedInvoices, relatedDocuments] = await Promise.all([
    db
      .select({
        id: tickets.id,
        number: tickets.number,
        subject: tickets.subject,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(eq(tickets.serviceId, serviceId))
      .orderBy(desc(tickets.createdAt))
      .limit(10),

    db
      .select({
        id: invoices.id,
        number: invoices.number,
        status: invoices.status,
        issuedAt: invoices.issuedAt,
        totalCents: invoices.totalCents,
      })
      .from(invoices)
      .where(
        and(eq(invoices.customerId, row.customerId), ne(invoices.status, 'draft')),
      )
      .orderBy(desc(invoices.issuedAt))
      .limit(10),

    db
      .select({
        id: documents.id,
        name: documents.name,
        category: documents.category,
        sizeBytes: documents.sizeBytes,
        mimeType: documents.mimeType,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.customerId, row.customerId),
          eq(documents.visibleToClient, true),
        ),
      )
      .orderBy(desc(documents.createdAt))
      .limit(10),
  ]);

  return {
    service: {
      ...row,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    },
    relatedTickets,
    relatedInvoices: relatedInvoices.map((r) => ({
      ...r,
      issuedAt: r.issuedAt ? new Date(r.issuedAt) : null,
    })),
    relatedDocuments,
  };
}
