import 'server-only';
import { and, count, desc, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices, services, tickets } from '@/lib/db/schema';

export type ClientDashboardData = {
  counts: {
    activeServices: number;
    pendingInvoices: number;
    openTickets: number;
    overdueInvoices: number;
  };
  lastInvoice: {
    id: string;
    number: string;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
    totalCents: number;
    issuedAt: Date | null;
    dueAt: Date | null;
  } | null;
  recentTickets: Array<{
    id: string;
    number: string;
    subject: string;
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'critical';
    createdAt: Date;
  }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
    totalCents: number;
    issuedAt: Date | null;
    dueAt: Date | null;
  }>;
};

const EMPTY: ClientDashboardData = {
  counts: {
    activeServices: 0,
    pendingInvoices: 0,
    openTickets: 0,
    overdueInvoices: 0,
  },
  lastInvoice: null,
  recentTickets: [],
  recentInvoices: [],
};

/**
 * Carga datos del dashboard de cliente filtrados por los `customerIds` de la
 * sesión actual. Si el usuario no tiene customer asignado todavía, devuelve
 * datos vacíos en vez de fallar.
 */
export async function getClientDashboardData(
  customerIds: ReadonlyArray<string>,
): Promise<ClientDashboardData> {
  if (customerIds.length === 0) return EMPTY;

  const ids = customerIds as string[];

  const [
    activeServicesRows,
    pendingInvoicesRows,
    openTicketsRows,
    overdueInvoicesRows,
    lastInvoiceRows,
    recentTicketsRows,
    recentInvoicesRows,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(services)
      .where(and(inArray(services.customerId, ids), eq(services.status, 'active'))),

    db
      .select({ value: count() })
      .from(invoices)
      .where(
        and(
          inArray(invoices.customerId, ids),
          inArray(invoices.status, ['issued', 'overdue']),
        ),
      ),

    db
      .select({ value: count() })
      .from(tickets)
      .where(
        and(
          inArray(tickets.customerId, ids),
          inArray(tickets.status, ['open', 'in_progress', 'waiting_customer']),
        ),
      ),

    db
      .select({ value: count() })
      .from(invoices)
      .where(
        and(inArray(invoices.customerId, ids), eq(invoices.status, 'overdue')),
      ),

    db
      .select({
        id: invoices.id,
        number: invoices.number,
        status: invoices.status,
        totalCents: invoices.totalCents,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
      })
      .from(invoices)
      .where(
        and(inArray(invoices.customerId, ids), ne(invoices.status, 'draft')),
      )
      .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt))
      .limit(1),

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
      .where(inArray(tickets.customerId, ids))
      .orderBy(desc(tickets.createdAt))
      .limit(5),

    db
      .select({
        id: invoices.id,
        number: invoices.number,
        status: invoices.status,
        totalCents: invoices.totalCents,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
      })
      .from(invoices)
      .where(
        and(inArray(invoices.customerId, ids), ne(invoices.status, 'draft')),
      )
      .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt))
      .limit(5),
  ]);

  const lastInvoice = lastInvoiceRows[0] ?? null;
  const lastInvoiceWithDates = lastInvoice
    ? {
        ...lastInvoice,
        issuedAt: lastInvoice.issuedAt ? new Date(lastInvoice.issuedAt) : null,
        dueAt: lastInvoice.dueAt ? new Date(lastInvoice.dueAt) : null,
      }
    : null;

  return {
    counts: {
      activeServices: activeServicesRows[0]?.value ?? 0,
      pendingInvoices: pendingInvoicesRows[0]?.value ?? 0,
      openTickets: openTicketsRows[0]?.value ?? 0,
      overdueInvoices: overdueInvoicesRows[0]?.value ?? 0,
    },
    lastInvoice: lastInvoiceWithDates,
    recentTickets: recentTicketsRows,
    recentInvoices: recentInvoicesRows.map((r) => ({
      ...r,
      issuedAt: r.issuedAt ? new Date(r.issuedAt) : null,
      dueAt: r.dueAt ? new Date(r.dueAt) : null,
    })),
  };
}

