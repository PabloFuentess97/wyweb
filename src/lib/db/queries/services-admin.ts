import 'server-only';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, services } from '@/lib/db/schema';

export type AdminServiceListItem = {
  id: string;
  code: string;
  name: string;
  customerId: string;
  customerName: string;
  customerCif: string;
  category: 'web-design' | 'saas' | 'ecommerce' | 'seo' | 'maintenance' | 'branding';
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  slaTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  startedAt: string | null;
  monthlyFeeCents: number | null;
  createdAt: Date;
};

export async function getAdminServicesList(): Promise<AdminServiceListItem[]> {
  const rows = await db
    .select({
      id: services.id,
      code: services.code,
      name: services.name,
      customerId: services.customerId,
      customerName: customers.legalName,
      customerCif: customers.cif,
      category: services.category,
      status: services.status,
      slaTier: services.slaTier,
      startedAt: services.startedAt,
      monthlyFeeCents: services.monthlyFeeCents,
      createdAt: services.createdAt,
    })
    .from(services)
    .innerJoin(customers, eq(customers.id, services.customerId))
    .orderBy(
      sql`CASE ${services.status}
        WHEN 'active' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'suspended' THEN 3
        WHEN 'terminated' THEN 4
      END`,
      desc(services.createdAt),
    );

  return rows;
}

export type AdminServiceDetail = {
  service: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    customerId: string;
    customerName: string;
    customerCif: string;
    category: AdminServiceListItem['category'];
    status: AdminServiceListItem['status'];
    slaTier: AdminServiceListItem['slaTier'];
    startedAt: string | null;
    endedAt: string | null;
    monthlyFeeCents: number | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };
};

export async function getAdminServiceById(
  id: string,
): Promise<AdminServiceDetail | null> {
  const [row] = await db
    .select({
      id: services.id,
      code: services.code,
      name: services.name,
      description: services.description,
      customerId: services.customerId,
      customerName: customers.legalName,
      customerCif: customers.cif,
      category: services.category,
      status: services.status,
      slaTier: services.slaTier,
      startedAt: services.startedAt,
      endedAt: services.endedAt,
      monthlyFeeCents: services.monthlyFeeCents,
      metadata: services.metadata,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .innerJoin(customers, eq(customers.id, services.customerId))
    .where(eq(services.id, id))
    .limit(1);

  if (!row) return null;
  return {
    service: {
      ...row,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    },
  };
}

/** Devuelve clientes activos para los selects de creación/edición. */
export async function getActiveCustomersForSelect(): Promise<
  Array<{ id: string; legalName: string; cif: string }>
> {
  return db
    .select({
      id: customers.id,
      legalName: customers.legalName,
      cif: customers.cif,
    })
    .from(customers)
    .where(and(eq(customers.status, 'active'), isNull(customers.deletedAt)))
    .orderBy(customers.legalName);
}

export async function generateServiceCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SVC-${year}-`;
  const [row] = await db.execute(sql`
    SELECT code FROM services
    WHERE code LIKE ${prefix + '%'}
    ORDER BY code DESC
    LIMIT 1
  `);
  let next = 1;
  if (row && typeof (row as { code?: string }).code === 'string') {
    const tail = (row as { code: string }).code.slice(prefix.length);
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(3, '0')}`;
}
