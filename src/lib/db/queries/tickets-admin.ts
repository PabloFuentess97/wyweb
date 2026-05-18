import 'server-only';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ticketMessages, users } from '@/lib/db/schema';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed';

export type Priority = 'low' | 'normal' | 'high' | 'critical';

export type AdminTicketListItem = {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  customerId: string;
  customerName: string;
  customerCif: string;
  serviceCode: string | null;
  serviceSlaTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  assignedToUserId: string | null;
  assignedToName: string | null;
  slaDueAt: Date | null;
  firstResponseAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAdminTicketsList(): Promise<AdminTicketListItem[]> {
  const rows = await db.execute(sql`
    SELECT
      t.id,
      t.number,
      t.subject,
      t.status,
      t.priority,
      t.customer_id AS "customerId",
      c.legal_name AS "customerName",
      c.cif AS "customerCif",
      s.code AS "serviceCode",
      s.sla_tier AS "serviceSlaTier",
      t.assigned_to_user_id AS "assignedToUserId",
      assignee.name AS "assignedToName",
      t.sla_due_at AS "slaDueAt",
      t.first_response_at AS "firstResponseAt",
      t.created_at AS "createdAt",
      t.updated_at AS "updatedAt"
    FROM tickets t
    JOIN customers c ON c.id = t.customer_id
    LEFT JOIN services s ON s.id = t.service_id
    LEFT JOIN users assignee ON assignee.id = t.assigned_to_user_id
    ORDER BY
      CASE t.status
        WHEN 'open' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'waiting_customer' THEN 3
        WHEN 'resolved' THEN 4
        WHEN 'closed' THEN 5
      END,
      CASE t.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
      END,
      t.updated_at DESC
  `);

  return (rows as unknown as ReadonlyArray<{
    id: string;
    number: string;
    subject: string;
    status: TicketStatus;
    priority: Priority;
    customerId: string;
    customerName: string;
    customerCif: string;
    serviceCode: string | null;
    serviceSlaTier: AdminTicketListItem['serviceSlaTier'];
    assignedToUserId: string | null;
    assignedToName: string | null;
    slaDueAt: string | null;
    firstResponseAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>).map((r) => ({
    id: r.id,
    number: r.number,
    subject: r.subject,
    status: r.status,
    priority: r.priority,
    customerId: r.customerId,
    customerName: r.customerName,
    customerCif: r.customerCif,
    serviceCode: r.serviceCode,
    serviceSlaTier: r.serviceSlaTier,
    assignedToUserId: r.assignedToUserId,
    assignedToName: r.assignedToName,
    slaDueAt: r.slaDueAt ? new Date(r.slaDueAt) : null,
    firstResponseAt: r.firstResponseAt ? new Date(r.firstResponseAt) : null,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }));
}

export type AdminTicketDetail = {
  ticket: {
    id: string;
    number: string;
    subject: string;
    status: TicketStatus;
    priority: Priority;
    customerId: string;
    customerName: string;
    customerCif: string;
    serviceId: string | null;
    serviceCode: string | null;
    serviceName: string | null;
    serviceSlaTier: AdminTicketListItem['serviceSlaTier'];
    openedByUserId: string;
    openedByName: string;
    openedByEmail: string;
    assignedToUserId: string | null;
    assignedToName: string | null;
    slaDueAt: Date | null;
    firstResponseAt: Date | null;
    resolvedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  /** Mensajes incluyendo internal notes (vista admin). */
  messages: Array<{
    id: string;
    authorId: string;
    authorRole: string;
    authorName: string | null;
    body: string;
    isInternalNote: boolean;
    createdAt: Date;
  }>;
};

export async function getAdminTicketById(
  ticketId: string,
): Promise<AdminTicketDetail | null> {
  const result = await db.execute(sql`
    SELECT
      t.id,
      t.number,
      t.subject,
      t.status,
      t.priority,
      t.customer_id AS "customerId",
      c.legal_name AS "customerName",
      c.cif AS "customerCif",
      t.service_id AS "serviceId",
      s.code AS "serviceCode",
      s.name AS "serviceName",
      s.sla_tier AS "serviceSlaTier",
      t.opened_by_user_id AS "openedByUserId",
      opener.name AS "openedByName",
      opener.email AS "openedByEmail",
      t.assigned_to_user_id AS "assignedToUserId",
      assignee.name AS "assignedToName",
      t.sla_due_at AS "slaDueAt",
      t.first_response_at AS "firstResponseAt",
      t.resolved_at AS "resolvedAt",
      t.closed_at AS "closedAt",
      t.created_at AS "createdAt",
      t.updated_at AS "updatedAt"
    FROM tickets t
    JOIN customers c ON c.id = t.customer_id
    JOIN users opener ON opener.id = t.opened_by_user_id
    LEFT JOIN users assignee ON assignee.id = t.assigned_to_user_id
    LEFT JOIN services s ON s.id = t.service_id
    WHERE t.id = ${ticketId}::uuid
    LIMIT 1
  `);

  type Row = {
    id: string;
    number: string;
    subject: string;
    status: TicketStatus;
    priority: Priority;
    customerId: string;
    customerName: string;
    customerCif: string;
    serviceId: string | null;
    serviceCode: string | null;
    serviceName: string | null;
    serviceSlaTier: AdminTicketListItem['serviceSlaTier'];
    openedByUserId: string;
    openedByName: string;
    openedByEmail: string;
    assignedToUserId: string | null;
    assignedToName: string | null;
    slaDueAt: string | null;
    firstResponseAt: string | null;
    resolvedAt: string | null;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  const row = (result as unknown as Row[])[0];
  if (!row) return null;

  const messages = await db
    .select({
      id: ticketMessages.id,
      authorId: ticketMessages.authorId,
      authorRole: ticketMessages.authorRole,
      authorName: users.name,
      body: ticketMessages.body,
      isInternalNote: ticketMessages.isInternalNote,
      createdAt: ticketMessages.createdAt,
    })
    .from(ticketMessages)
    .leftJoin(users, eq(users.id, ticketMessages.authorId))
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(asc(ticketMessages.createdAt));

  return {
    ticket: {
      id: row.id,
      number: row.number,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      customerId: row.customerId,
      customerName: row.customerName,
      customerCif: row.customerCif,
      serviceId: row.serviceId,
      serviceCode: row.serviceCode,
      serviceName: row.serviceName,
      serviceSlaTier: row.serviceSlaTier,
      openedByUserId: row.openedByUserId,
      openedByName: row.openedByName,
      openedByEmail: row.openedByEmail,
      assignedToUserId: row.assignedToUserId,
      assignedToName: row.assignedToName,
      slaDueAt: row.slaDueAt ? new Date(row.slaDueAt) : null,
      firstResponseAt: row.firstResponseAt ? new Date(row.firstResponseAt) : null,
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      closedAt: row.closedAt ? new Date(row.closedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    },
    messages,
  };
}

export async function getStaffAgents(): Promise<
  Array<{ id: string; name: string; email: string; role: string }>
> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(
      and(
        inArray(users.role, ['staff_admin', 'staff_agent']),
        isNull(users.deletedAt),
      ),
    )
    .orderBy(asc(users.name));
}
