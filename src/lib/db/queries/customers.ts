import 'server-only';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  customerUsers,
  customers,
  documents,
  invoices,
  services,
  tickets,
  users,
} from '@/lib/db/schema';

export type CustomerStatus = 'active' | 'suspended' | 'archived';

export type CustomerListItem = {
  id: string;
  cif: string;
  legalName: string;
  tradeName: string | null;
  city: string;
  province: string;
  status: CustomerStatus;
  servicesCount: number;
  invoicesCount: number;
  totalInvoicedCents: number;
  createdAt: Date;
};

/**
 * Lista de clientes con conteos agregados. Excluye soft-deleted (`deletedAt`).
 */
export async function getCustomersList(): Promise<CustomerListItem[]> {
  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.cif,
      c.legal_name AS "legalName",
      c.trade_name AS "tradeName",
      c.city,
      c.province,
      c.status,
      c.created_at AS "createdAt",
      (
        SELECT COUNT(*)::int FROM ${services} s WHERE s.customer_id = c.id
      ) AS "servicesCount",
      (
        SELECT COUNT(*)::int FROM ${invoices} i
         WHERE i.customer_id = c.id AND i.status != 'draft'
      ) AS "invoicesCount",
      (
        SELECT COALESCE(SUM(i.total_cents), 0)::bigint FROM ${invoices} i
         WHERE i.customer_id = c.id AND i.status IN ('issued','paid','overdue')
      ) AS "totalInvoicedCents"
    FROM ${customers} c
    WHERE c.deleted_at IS NULL
    ORDER BY c.created_at DESC
  `);

  return (rows as unknown as ReadonlyArray<{
    id: string;
    cif: string;
    legalName: string;
    tradeName: string | null;
    city: string;
    province: string;
    status: CustomerStatus;
    createdAt: Date | string;
    servicesCount: number;
    invoicesCount: number;
    totalInvoicedCents: string | number;
  }>).map((r) => ({
    id: r.id,
    cif: r.cif,
    legalName: r.legalName,
    tradeName: r.tradeName,
    city: r.city,
    province: r.province,
    status: r.status,
    servicesCount: r.servicesCount,
    invoicesCount: r.invoicesCount,
    totalInvoicedCents:
      typeof r.totalInvoicedCents === 'string'
        ? Number.parseInt(r.totalInvoicedCents, 10)
        : r.totalInvoicedCents,
    createdAt: typeof r.createdAt === 'string' ? new Date(r.createdAt) : r.createdAt,
  }));
}

export type CustomerDetail = {
  customer: {
    id: string;
    cif: string;
    legalName: string;
    tradeName: string | null;
    emailBilling: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    postalCode: string;
    city: string;
    province: string;
    country: string;
    iban: string | null;
    status: CustomerStatus;
    brand: 'uxea-soluciones' | 'wyweb' | 'uxea-cloud';
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  users: Array<{
    userId: string;
    name: string;
    email: string;
    role: 'staff_admin' | 'staff_agent' | 'client_admin' | 'client_user';
    customerRole: 'admin' | 'viewer';
    createdAt: Date;
  }>;
  services: Array<{
    id: string;
    code: string;
    name: string;
    category: 'web-design' | 'saas' | 'ecommerce' | 'seo' | 'maintenance' | 'branding';
    status: 'active' | 'pending' | 'suspended' | 'terminated';
    slaTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    monthlyFeeCents: number | null;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
    issuedAt: Date | null;
    totalCents: number;
  }>;
  tickets: Array<{
    id: string;
    number: string;
    subject: string;
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'critical';
    createdAt: Date;
  }>;
  documents: Array<{
    id: string;
    name: string;
    category: 'contract' | 'certificate' | 'report' | 'other';
    sizeBytes: number;
    visibleToClient: boolean;
    createdAt: Date;
  }>;
};

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
    .limit(1);
  if (!customer) return null;

  const [usersList, servicesList, invoicesList, ticketsList, documentsList] =
    await Promise.all([
      db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          customerRole: customerUsers.customerRole,
          createdAt: customerUsers.createdAt,
        })
        .from(customerUsers)
        .innerJoin(users, eq(users.id, customerUsers.userId))
        .where(
          and(
            eq(customerUsers.customerId, id),
            isNull(users.deletedAt),
          ),
        )
        .orderBy(desc(customerUsers.createdAt)),

      db
        .select({
          id: services.id,
          code: services.code,
          name: services.name,
          category: services.category,
          status: services.status,
          slaTier: services.slaTier,
          monthlyFeeCents: services.monthlyFeeCents,
        })
        .from(services)
        .where(eq(services.customerId, id))
        .orderBy(desc(services.createdAt)),

      db
        .select({
          id: invoices.id,
          number: invoices.number,
          status: invoices.status,
          issuedAt: invoices.issuedAt,
          totalCents: invoices.totalCents,
        })
        .from(invoices)
        .where(eq(invoices.customerId, id))
        .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt))
        .limit(20),

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
        .where(eq(tickets.customerId, id))
        .orderBy(desc(tickets.createdAt))
        .limit(20),

      db
        .select({
          id: documents.id,
          name: documents.name,
          category: documents.category,
          sizeBytes: documents.sizeBytes,
          visibleToClient: documents.visibleToClient,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(eq(documents.customerId, id))
        .orderBy(desc(documents.createdAt)),
    ]);

  return {
    customer,
    users: usersList,
    services: servicesList,
    invoices: invoicesList.map((r) => ({
      ...r,
      issuedAt: r.issuedAt ? new Date(r.issuedAt) : null,
    })),
    tickets: ticketsList,
    documents: documentsList,
  };
}

export async function existsCustomerByCif(
  cif: string,
  excludeId?: string,
): Promise<boolean> {
  const conditions = [eq(customers.cif, cif), isNull(customers.deletedAt)];
  const rows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(...conditions))
    .limit(2);
  if (rows.length === 0) return false;
  if (excludeId && rows.length === 1 && rows[0]!.id === excludeId) return false;
  return true;
}
