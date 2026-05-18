import 'server-only';
import { count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, leads, services, tickets } from '@/lib/db/schema';

export type AdminDashboardData = {
  kpis: {
    activeCustomers: number;
    mrrCents: number;
    openTickets: number;
    newLeads: number;
    slaAtRisk: number;
  };
  revenue12m: Array<{ month: string; totalCents: number; count: number }>;
  ticketsTimeline12m: Array<{
    month: string;
    created: number;
    resolved: number;
  }>;
  recent: {
    leads: Array<{
      id: string;
      name: string;
      company: string | null;
      email: string;
      status: 'new' | 'contacted' | 'qualified' | 'converted' | 'discarded';
      createdAt: Date;
    }>;
    tickets: Array<{
      id: string;
      number: string;
      subject: string;
      status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
      priority: 'low' | 'normal' | 'high' | 'critical';
      customerName: string;
      createdAt: Date;
    }>;
  };
};

const MS_24H = 24 * 60 * 60 * 1000;

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const slaAtRiskCutoff = new Date(now.getTime() + MS_24H);

  // Queries SECUENCIALES (no Promise.all) — evita saturar el connection
  // pool en BDs managed con pocas conexiones por rol (seenode/supabase free).
  // El coste es ~10× tiempo total pero con pocas filas son <1s en total.
  const activeCustomersRows = await db
    .select({ value: count() })
    .from(customers)
    .where(eq(customers.status, 'active'));

  const mrrRows = await db
    .select({
      value: sql<number>`COALESCE(SUM(${services.monthlyFeeCents}), 0)::int`,
    })
    .from(services)
    .where(eq(services.status, 'active'));

  const openTicketsRows = await db
    .select({ value: count() })
    .from(tickets)
    .where(
      inArray(tickets.status, ['open', 'in_progress', 'waiting_customer']),
    );

  const newLeadsRows = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.status, 'new'));

  const slaAtRiskRows = await db
    .select({ value: count() })
    .from(tickets)
    .where(
      sql`${tickets.slaDueAt} IS NOT NULL
          AND ${tickets.slaDueAt} <= ${slaAtRiskCutoff}
          AND ${tickets.status} NOT IN ('resolved','closed')`,
    );

  const revenueRows = await db.execute(sql`
    SELECT
      TO_CHAR(date_trunc('month', issued_at), 'YYYY-MM') AS month,
      COALESCE(SUM(total_cents), 0)::bigint AS total_cents,
      COUNT(*)::int AS count
    FROM invoices
    WHERE issued_at IS NOT NULL
      AND issued_at >= ${twelveMonthsAgo}::date
      AND status IN ('issued','paid','overdue')
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  const ticketsCreatedRows = await db.execute(sql`
    SELECT
      TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS count
    FROM tickets
    WHERE created_at >= ${twelveMonthsAgo}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  const ticketsResolvedRows = await db.execute(sql`
    SELECT
      TO_CHAR(date_trunc('month', resolved_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS count
    FROM tickets
    WHERE resolved_at IS NOT NULL
      AND resolved_at >= ${twelveMonthsAgo}
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  const recentLeads = await db
    .select({
      id: leads.id,
      name: leads.name,
      company: leads.company,
      email: leads.email,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.status, 'new'))
    .orderBy(desc(leads.createdAt))
    .limit(5);

  const recentTickets = await db
    .select({
      id: tickets.id,
      number: tickets.number,
      subject: tickets.subject,
      status: tickets.status,
      priority: tickets.priority,
      customerName: customers.legalName,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .innerJoin(customers, eq(customers.id, tickets.customerId))
    .where(
      inArray(tickets.status, ['open', 'in_progress', 'waiting_customer']),
    )
    .orderBy(desc(tickets.createdAt))
    .limit(5);

  // Construir 12 meses contínuos (rellenar gaps con 0)
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(twelveMonthsAgo.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
  }

  const revenueByMonth = new Map<string, { totalCents: number; count: number }>();
  for (const row of revenueRows as unknown as ReadonlyArray<{
    month: string;
    total_cents: string | number;
    count: number;
  }>) {
    const totalCents =
      typeof row.total_cents === 'string'
        ? Number.parseInt(row.total_cents, 10)
        : row.total_cents;
    revenueByMonth.set(row.month, { totalCents, count: row.count });
  }
  const revenue12m = months.map((m) => ({
    month: m,
    totalCents: revenueByMonth.get(m)?.totalCents ?? 0,
    count: revenueByMonth.get(m)?.count ?? 0,
  }));

  const createdByMonth = new Map<string, number>();
  for (const row of ticketsCreatedRows as unknown as ReadonlyArray<{
    month: string;
    count: number;
  }>) {
    createdByMonth.set(row.month, row.count);
  }
  const resolvedByMonth = new Map<string, number>();
  for (const row of ticketsResolvedRows as unknown as ReadonlyArray<{
    month: string;
    count: number;
  }>) {
    resolvedByMonth.set(row.month, row.count);
  }
  const ticketsTimeline12m = months.map((m) => ({
    month: m,
    created: createdByMonth.get(m) ?? 0,
    resolved: resolvedByMonth.get(m) ?? 0,
  }));

  return {
    kpis: {
      activeCustomers: activeCustomersRows[0]?.value ?? 0,
      mrrCents: Number(mrrRows[0]?.value ?? 0),
      openTickets: openTicketsRows[0]?.value ?? 0,
      newLeads: newLeadsRows[0]?.value ?? 0,
      slaAtRisk: slaAtRiskRows[0]?.value ?? 0,
    },
    revenue12m,
    ticketsTimeline12m,
    recent: {
      leads: recentLeads,
      tickets: recentTickets,
    },
  };
}
