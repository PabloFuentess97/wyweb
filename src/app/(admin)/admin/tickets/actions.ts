'use server';

import { revalidatePath } from 'next/cache';
import { render } from '@react-email/render';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  auditLog,
  ticketMessages,
  tickets,
  users,
} from '@/lib/db/schema';
import { getAdminTicketById } from '@/lib/db/queries/tickets-admin';
import { sendEmail } from '@/lib/email';
import { TicketReplyEmail } from '@/lib/email/templates/ticket-reply';
import { env } from '@/lib/env';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) {
    return { error: 'Sesión no válida.', session: null as never };
  }
  return { error: null as never, session };
}

const STATUS_VALUES = [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
] as const;
const PRIORITY_VALUES = ['low', 'normal', 'high', 'critical'] as const;

const assignSchema = z.object({
  userId: z
    .string()
    .uuid()
    .or(z.literal('__none__'))
    .or(z.literal('')),
});

const statusSchema = z.object({
  status: z.enum(STATUS_VALUES),
});

const prioritySchema = z.object({
  priority: z.enum(PRIORITY_VALUES),
});

const messageSchema = z.object({
  body: z.string().min(2, 'Escribe un mensaje').max(10_000),
  isInternal: z
    .union([z.literal('on'), z.literal('true'), z.boolean(), z.literal('')])
    .transform((v) => v === true || v === 'on' || v === 'true')
    .default(false),
});

export async function assignTicketAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = assignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Asignación no válida.' };
  }
  const userIdValue = parsed.data.userId;
  const userId =
    userIdValue === '__none__' || userIdValue === '' ? null : userIdValue;

  // Validar que el user es staff y existe
  if (userId) {
    const [u] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);
    if (!u || !u.role.startsWith('staff_')) {
      return { status: 'error', message: 'Usuario no válido.' };
    }
  }

  const [prev] = await db
    .select({ assignedToUserId: tickets.assignedToUserId })
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Ticket no encontrado.' };

  if (prev.assignedToUserId === userId) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(tickets)
        .set({ assignedToUserId: userId, updatedAt: new Date() })
        .where(eq(tickets.id, ticketId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'ticket.assigned',
        entityType: 'ticket',
        entityId: ticketId,
        diff: { assignedToUserId: { from: prev.assignedToUserId, to: userId } },
      });
    });
  } catch (e) {
    console.error('[assignTicket] DB error:', e);
    return { status: 'error', message: 'No se pudo asignar.' };
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  return { status: 'success', message: 'Asignación actualizada.' };
}

export async function changeTicketStatusAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Estado no válido.' };
  }
  const newStatus = parsed.data.status;

  const [prev] = await db
    .select({ status: tickets.status })
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Ticket no encontrado.' };
  if (prev.status === newStatus) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date(),
  };
  const now = new Date();
  if (newStatus === 'resolved') updates.resolvedAt = now;
  if (newStatus === 'closed') updates.closedAt = now;

  try {
    await db.transaction(async (tx) => {
      await tx.update(tickets).set(updates).where(eq(tickets.id, ticketId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'ticket.status_changed',
        entityType: 'ticket',
        entityId: ticketId,
        diff: { status: { from: prev.status, to: newStatus } },
      });
    });
  } catch (e) {
    console.error('[changeStatus] DB error:', e);
    return { status: 'error', message: 'No se pudo cambiar el estado.' };
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  return { status: 'success', message: `Estado: ${newStatus}` };
}

export async function changeTicketPriorityAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = prioritySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: 'Prioridad no válida.' };
  const newPriority = parsed.data.priority;

  const [prev] = await db
    .select({ priority: tickets.priority })
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Ticket no encontrado.' };
  if (prev.priority === newPriority) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(tickets)
        .set({ priority: newPriority, updatedAt: new Date() })
        .where(eq(tickets.id, ticketId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'ticket.priority_changed',
        entityType: 'ticket',
        entityId: ticketId,
        diff: { priority: { from: prev.priority, to: newPriority } },
      });
    });
  } catch (e) {
    console.error('[changePriority] DB error:', e);
    return { status: 'error', message: 'No se pudo cambiar la prioridad.' };
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  return { status: 'success', message: `Prioridad: ${newPriority}` };
}

export async function addAdminMessageAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Mensaje no válido.',
      fieldErrors: { body: parsed.error.issues[0]?.message ?? '' },
    };
  }
  const { body, isInternal } = parsed.data;

  const detail = await getAdminTicketById(ticketId);
  if (!detail) return { status: 'error', message: 'Ticket no encontrado.' };
  if (detail.ticket.status === 'closed') {
    return { status: 'error', message: 'No se puede responder a un ticket cerrado.' };
  }

  const isFirstStaffResponse =
    !isInternal && detail.ticket.firstResponseAt === null;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(ticketMessages).values({
        ticketId,
        authorId: session.user.id,
        authorRole: 'staff',
        body,
        isInternalNote: isInternal,
      });

      const updates: Record<string, unknown> = { updatedAt: new Date() };

      // Si es respuesta pública del staff y es la primera, marcar firstResponseAt
      if (isFirstStaffResponse) {
        updates.firstResponseAt = new Date();
      }

      // Cambiar status si es respuesta pública
      if (!isInternal && detail.ticket.status === 'open') {
        updates.status = 'in_progress';
      }
      if (!isInternal && detail.ticket.status === 'waiting_customer') {
        updates.status = 'in_progress';
      }

      if (Object.keys(updates).length > 1) {
        await tx.update(tickets).set(updates).where(eq(tickets.id, ticketId));
      }

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: isInternal ? 'ticket.internal_note' : 'ticket.staff_replied',
        entityType: 'ticket',
        entityId: ticketId,
        diff: { length: body.length, isInternal, firstResponse: isFirstStaffResponse },
      });
    });
  } catch (e) {
    console.error('[addAdminMessage] DB error:', e);
    return { status: 'error', message: 'No se pudo enviar el mensaje.' };
  }

  // Email al cliente solo si es respuesta pública (no internal note)
  if (!isInternal) {
    try {
      const html = await render(
        TicketReplyEmail({
          number: detail.ticket.number,
          subject: detail.ticket.subject,
          body,
          authorName: session.user.name,
          authorRole: 'staff',
          recipientName: detail.ticket.openedByName,
          ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/area-cliente/tickets/${ticketId}`,
        }),
      );
      await sendEmail({
        to: detail.ticket.openedByEmail,
        subject: `[Wyweb] Respuesta al ticket ${detail.ticket.number}`,
        html,
        replyTo: session.user.email,
      });
    } catch (e) {
      console.error('[addAdminMessage] email error:', e);
    }
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/area-cliente/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  return {
    status: 'success',
    message: isInternal ? 'Nota interna añadida.' : 'Respuesta enviada al cliente.',
  };
}
