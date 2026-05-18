import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, leads, users } from '@/lib/db/schema';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'discarded';

export type AdminLeadListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  status: LeadStatus;
  assignedToUserId: string | null;
  assignedToName: string | null;
  convertedToCustomerId: string | null;
  convertedToCustomerName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAdminLeadsList(): Promise<AdminLeadListItem[]> {
  const rows = await db.execute(sql`
    SELECT
      l.id,
      l.name,
      l.email,
      l.phone,
      l.company,
      l.source,
      l.status,
      l.assigned_to_user_id AS "assignedToUserId",
      assignee.name AS "assignedToName",
      l.converted_to_customer_id AS "convertedToCustomerId",
      c.legal_name AS "convertedToCustomerName",
      l.created_at AS "createdAt",
      l.updated_at AS "updatedAt"
    FROM leads l
    LEFT JOIN users assignee ON assignee.id = l.assigned_to_user_id
    LEFT JOIN customers c ON c.id = l.converted_to_customer_id
    ORDER BY
      CASE l.status
        WHEN 'new' THEN 1
        WHEN 'contacted' THEN 2
        WHEN 'qualified' THEN 3
        WHEN 'converted' THEN 4
        WHEN 'discarded' THEN 5
      END,
      l.created_at DESC
  `);

  return (rows as unknown as ReadonlyArray<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    source: string;
    status: LeadStatus;
    assignedToUserId: string | null;
    assignedToName: string | null;
    convertedToCustomerId: string | null;
    convertedToCustomerName: string | null;
    createdAt: string;
    updatedAt: string;
  }>).map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }));
}

export type AdminLeadDetail = {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    message: string;
    source: string;
    status: LeadStatus;
    assignedToUserId: string | null;
    assignedToName: string | null;
    assignedToEmail: string | null;
    convertedToCustomerId: string | null;
    convertedToCustomerName: string | null;
    notes: string | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export async function getAdminLeadById(
  id: string,
): Promise<AdminLeadDetail | null> {
  const [row] = await db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      company: leads.company,
      message: leads.message,
      source: leads.source,
      status: leads.status,
      assignedToUserId: leads.assignedToUserId,
      assignedToName: users.name,
      assignedToEmail: users.email,
      convertedToCustomerId: leads.convertedToCustomerId,
      convertedToCustomerName: customers.legalName,
      notes: leads.notes,
      ip: leads.ip,
      userAgent: leads.userAgent,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .leftJoin(users, eq(users.id, leads.assignedToUserId))
    .leftJoin(customers, eq(customers.id, leads.convertedToCustomerId))
    .where(eq(leads.id, id))
    .limit(1);

  if (!row) return null;
  return { lead: row };
}

export async function getLeadsAggregateStats(): Promise<{
  total: number;
  newCount: number;
  contacted: number;
  qualified: number;
  converted: number;
  discarded: number;
}> {
  const rows = await db
    .select({
      status: leads.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(leads)
    .groupBy(leads.status);

  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    counts[r.status] = r.count;
    total += r.count;
  }

  return {
    total,
    newCount: counts['new'] ?? 0,
    contacted: counts['contacted'] ?? 0,
    qualified: counts['qualified'] ?? 0,
    converted: counts['converted'] ?? 0,
    discarded: counts['discarded'] ?? 0,
  };
}

