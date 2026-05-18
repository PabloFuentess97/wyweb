import 'server-only';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { services, ticketMessages, tickets, users } from '@/lib/db/schema';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed';

export type Priority = 'low' | 'normal' | 'high' | 'critical';

export type TicketListFilters = {
  status?: TicketStatus | 'open-all' | 'all';
  priority?: Priority | 'all';
  search?: string;
};

export type TicketListItem = {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  serviceCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Total de mensajes del ticket (excluye internal notes para cliente). */
  messageCount: number;
};

const PAGE_SIZE = 20;

const OPEN_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_customer'];

export async function getTicketsByCustomer(
  customerIds: ReadonlyArray<string>,
  filters: TicketListFilters = {},
  page = 1,
): Promise<{
  items: TicketListItem[];
  total: number;
  totalPages: number;
  page: number;
}> {
  if (customerIds.length === 0) {
    return { items: [], total: 0, totalPages: 1, page: 1 };
  }

  const ids = customerIds as string[];
  const where = [inArray(tickets.customerId, ids)];

  if (filters.status === 'open-all') {
    where.push(inArray(tickets.status, OPEN_STATUSES));
  } else if (filters.status && filters.status !== 'all') {
    where.push(eq(tickets.status, filters.status));
  }

  if (filters.priority && filters.priority !== 'all') {
    where.push(eq(tickets.priority, filters.priority));
  }

  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    where.push(sql`(${tickets.subject} ILIKE ${q} OR ${tickets.number} ILIKE ${q})`);
  }

  const condition = and(...where);
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: tickets.id,
        number: tickets.number,
        subject: tickets.subject,
        status: tickets.status,
        priority: tickets.priority,
        serviceCode: services.code,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
      })
      .from(tickets)
      .leftJoin(services, eq(services.id, tickets.serviceId))
      .where(condition)
      .orderBy(
        sql`CASE ${tickets.status}
          WHEN 'open' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'waiting_customer' THEN 3
          WHEN 'resolved' THEN 4
          WHEN 'closed' THEN 5
        END`,
        desc(tickets.updatedAt),
      )
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ value: sql<number>`COUNT(*)::int` })
      .from(tickets)
      .where(condition),
  ]);

  // Conteo de mensajes en query separada (evita subquery correlado complejo)
  let messageCounts: Map<string, number> = new Map();
  if (rows.length > 0) {
    const ticketIds = rows.map((r) => r.id);
    const counts = await db
      .select({
        ticketId: ticketMessages.ticketId,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(ticketMessages)
      .where(
        and(
          inArray(ticketMessages.ticketId, ticketIds),
          eq(ticketMessages.isInternalNote, false),
        ),
      )
      .groupBy(ticketMessages.ticketId);
    messageCounts = new Map(counts.map((c) => [c.ticketId, c.count]));
  }

  const total = totalRows[0]?.value ?? 0;
  return {
    items: rows.map((r) => ({
      ...r,
      messageCount: messageCounts.get(r.id) ?? 0,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page,
  };
}

export type TicketMessage = {
  id: string;
  authorId: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
};

export type TicketDetail = {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  customerId: string;
  customerName: string;
  serviceId: string | null;
  serviceCode: string | null;
  serviceName: string | null;
  serviceSlaTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  openedByUserId: string;
  openedByName: string;
  assignedToUserId: string | null;
  assignedToName: string | null;
  slaDueAt: Date | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
};

export async function getTicketForClient(
  ticketId: string,
  customerIds: ReadonlyArray<string>,
): Promise<TicketDetail | null> {
  if (customerIds.length === 0) return null;
  const ids = customerIds as string[];

  const idList = sql.join(
    ids.map((id) => sql`${id}::uuid`),
    sql`, `,
  );

  const result = await db.execute(sql`
    SELECT
      t.id,
      t.number,
      t.subject,
      t.status,
      t.priority,
      t.customer_id,
      c.legal_name AS customer_name,
      t.service_id,
      s.code AS service_code,
      s.name AS service_name,
      s.sla_tier AS service_sla_tier,
      t.opened_by_user_id,
      opener.name AS opener_name,
      t.assigned_to_user_id,
      assignee.name AS assignee_name,
      t.sla_due_at,
      t.first_response_at,
      t.resolved_at,
      t.closed_at,
      t.created_at,
      t.updated_at
    FROM tickets t
    JOIN customers c ON c.id = t.customer_id
    JOIN users opener ON opener.id = t.opened_by_user_id
    LEFT JOIN users assignee ON assignee.id = t.assigned_to_user_id
    LEFT JOIN services s ON s.id = t.service_id
    WHERE t.id = ${ticketId}::uuid
      AND t.customer_id IN (${idList})
    LIMIT 1
  `);
  const row = (result as Array<Record<string, unknown>>)[0];

  if (!row) return null;

  type Row = {
    id: string;
    number: string;
    subject: string;
    status: TicketStatus;
    priority: Priority;
    customer_id: string;
    customer_name: string;
    service_id: string | null;
    service_code: string | null;
    service_name: string | null;
    service_sla_tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | null;
    opened_by_user_id: string;
    opener_name: string;
    assigned_to_user_id: string | null;
    assignee_name: string | null;
    sla_due_at: string | null;
    first_response_at: string | null;
    resolved_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  const r = row as Row;

  // Cargar mensajes (cliente NO ve internal notes)
  const messages = await db
    .select({
      id: ticketMessages.id,
      authorId: ticketMessages.authorId,
      authorRole: ticketMessages.authorRole,
      authorName: users.name,
      body: ticketMessages.body,
      createdAt: ticketMessages.createdAt,
    })
    .from(ticketMessages)
    .leftJoin(users, eq(users.id, ticketMessages.authorId))
    .where(
      and(
        eq(ticketMessages.ticketId, ticketId),
        eq(ticketMessages.isInternalNote, false),
      ),
    )
    .orderBy(asc(ticketMessages.createdAt));

  return {
    id: r.id,
    number: r.number,
    subject: r.subject,
    status: r.status,
    priority: r.priority,
    customerId: r.customer_id,
    customerName: r.customer_name,
    serviceId: r.service_id,
    serviceCode: r.service_code,
    serviceName: r.service_name,
    serviceSlaTier: r.service_sla_tier,
    openedByUserId: r.opened_by_user_id,
    openedByName: r.opener_name,
    assignedToUserId: r.assigned_to_user_id,
    assignedToName: r.assignee_name,
    slaDueAt: r.sla_due_at ? new Date(r.sla_due_at) : null,
    firstResponseAt: r.first_response_at ? new Date(r.first_response_at) : null,
    resolvedAt: r.resolved_at ? new Date(r.resolved_at) : null,
    closedAt: r.closed_at ? new Date(r.closed_at) : null,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
    messages,
  };
}

/**
 * Devuelve el siguiente número de ticket en formato `TIC-YYYY-NNNN` para el
 * año actual, basado en MAX(number).
 */
export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TIC-${year}-`;

  const [row] = await db.execute(sql`
    SELECT number FROM tickets
    WHERE number LIKE ${prefix + '%'}
    ORDER BY number DESC
    LIMIT 1
  `);

  let next = 1;
  if (row && typeof (row as { number?: string }).number === 'string') {
    const last = (row as { number: string }).number;
    const tail = last.slice(prefix.length);
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}

/**
 * Verifica que un servicio pertenece a uno de los customers del session.user.
 * Usado al crear un ticket asociado a servicio.
 */
export async function isServiceOwnedByClient(
  serviceId: string,
  customerIds: ReadonlyArray<string>,
): Promise<boolean> {
  if (customerIds.length === 0) return false;
  const ids = customerIds as string[];
  const [row] = await db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.id, serviceId), inArray(services.customerId, ids)))
    .limit(1);
  return !!row;
}
