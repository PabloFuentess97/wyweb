'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { render } from '@react-email/render';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  auditLog,
  ticketMessages,
  tickets,
  users,
} from '@/lib/db/schema';
import {
  generateTicketNumber,
  getTicketForClient,
  isServiceOwnedByClient,
} from '@/lib/db/queries/tickets';
import {
  addMessageSchema,
  createTicketSchema,
} from '@/lib/validation/ticket';
import { sendEmail } from '@/lib/email';
import { TicketCreatedStaffEmail } from '@/lib/email/templates/ticket-created-staff';
import { TicketReplyEmail } from '@/lib/email/templates/ticket-reply';
import { env } from '@/lib/env';

export type ActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

const initial: ActionState = { status: 'idle' };

/**
 * Crea un ticket desde el área cliente. Hace redirect al detalle al éxito.
 * El usuario debe pertenecer a un customer y, si pasa serviceId, ese servicio
 * debe ser de su(s) customer(s).
 */
export async function createTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('client_')) {
    return { status: 'error', message: 'Sesión no válida.' };
  }

  const customerId = session.user.customerIds[0];
  if (!customerId) {
    return {
      status: 'error',
      message:
        'Tu cuenta no está asociada a ningún cliente. Contacta con soporte.',
    };
  }

  // Sentinel "__none__" del Select → undefined
  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (raw.serviceId === '__none__' || raw.serviceId === '') {
    delete raw.serviceId;
  }

  const parsed = createTicketSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.join('.');
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      status: 'error',
      message: 'Revisa los datos del formulario.',
      fieldErrors,
    };
  }
  const data = parsed.data;

  if (data.serviceId) {
    const owns = await isServiceOwnedByClient(
      data.serviceId,
      session.user.customerIds,
    );
    if (!owns) {
      return {
        status: 'error',
        message: 'El servicio seleccionado no pertenece a tu cuenta.',
      };
    }
  }

  // Generar número y crear ticket + primer mensaje
  const number = await generateTicketNumber();
  let ticketId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [ticket] = await tx
        .insert(tickets)
        .values({
          number,
          customerId,
          openedByUserId: session.user.id,
          serviceId: data.serviceId,
          subject: data.subject,
          status: 'open',
          priority: data.priority,
        })
        .returning({ id: tickets.id });
      if (!ticket) throw new Error('Insert ticket failed');

      await tx.insert(ticketMessages).values({
        ticketId: ticket.id,
        authorId: session.user.id,
        authorRole: 'client',
        body: data.body,
        isInternalNote: false,
      });

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'ticket.created',
        entityType: 'ticket',
        entityId: ticket.id,
        diff: { number, priority: data.priority, subject: data.subject },
      });

      return ticket.id;
    });
    ticketId = result;
  } catch (e) {
    console.error('[createTicket] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo crear el ticket. Inténtalo de nuevo.',
    };
  }

  // Email al equipo (no bloquea la creación)
  try {
    const html = await render(
      TicketCreatedStaffEmail({
        number,
        subject: data.subject,
        body: data.body,
        priority: data.priority,
        customerName: 'Cliente',
        openedByName: session.user.name,
        appUrl: env.NEXT_PUBLIC_APP_URL,
        ticketId,
      }),
    );
    await sendEmail({
      to: env.EMAIL_TO_LEADS,
      subject: `[Wyweb] Nuevo ticket ${number} · ${data.priority.toUpperCase()} · ${data.subject}`,
      html,
      replyTo: session.user.email,
    });
  } catch (e) {
    console.error('[createTicket] email error:', e);
  }

  revalidatePath('/area-cliente/tickets');
  redirect(`/area-cliente/tickets/${ticketId}`);
}

/**
 * Añade un mensaje al ticket. Solo si el ticket pertenece al customer del user
 * y no está cerrado. Re-abre el estado a `open` si estaba en `waiting_customer`.
 */
export async function addTicketMessageAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('client_')) {
    return { status: 'error', message: 'Sesión no válida.' };
  }

  const parsed = addMessageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Mensaje no válido.',
      fieldErrors: { body: parsed.error.issues[0]?.message ?? '' },
    };
  }

  // Verificar que el ticket pertenece al cliente
  const detail = await getTicketForClient(ticketId, session.user.customerIds);
  if (!detail) {
    return { status: 'error', message: 'Ticket no encontrado.' };
  }
  if (detail.status === 'closed') {
    return {
      status: 'error',
      message: 'Este ticket está cerrado. Abre uno nuevo si necesitas seguir.',
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(ticketMessages).values({
        ticketId,
        authorId: session.user.id,
        authorRole: 'client',
        body: parsed.data.body,
        isInternalNote: false,
      });

      // Si estaba esperando al cliente → vuelve a 'open' para que staff lo vea
      const newStatus =
        detail.status === 'waiting_customer' || detail.status === 'resolved'
          ? 'open'
          : detail.status;

      await tx
        .update(tickets)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(tickets.id, ticketId));

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'ticket.message_added',
        entityType: 'ticket',
        entityId: ticketId,
        diff: { length: parsed.data.body.length, statusChange: detail.status !== newStatus },
      });
    });
  } catch (e) {
    console.error('[addMessage] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
    };
  }

  // Email al staff asignado (si lo hay) o al buzón general
  try {
    let recipientEmail = env.EMAIL_TO_LEADS;
    let recipientName = 'Equipo Wyweb';
    if (detail.assignedToUserId) {
      const [assignee] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(and(eq(users.id, detail.assignedToUserId), isNull(users.deletedAt)))
        .limit(1);
      if (assignee) {
        recipientEmail = assignee.email;
        recipientName = assignee.name;
      }
    }

    const html = await render(
      TicketReplyEmail({
        number: detail.number,
        subject: detail.subject,
        body: parsed.data.body,
        authorName: session.user.name,
        authorRole: 'client',
        recipientName,
        ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticketId}`,
      }),
    );

    await sendEmail({
      to: recipientEmail,
      subject: `[Wyweb] Respuesta cliente · ${detail.number} · ${detail.subject}`,
      html,
      replyTo: session.user.email,
    });
  } catch (e) {
    console.error('[addMessage] email error:', e);
  }

  revalidatePath(`/area-cliente/tickets/${ticketId}`);
  revalidatePath('/area-cliente/tickets');
  return initial;
}
