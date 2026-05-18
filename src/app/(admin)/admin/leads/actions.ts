'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, leads, users } from '@/lib/db/schema';

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
  'new',
  'contacted',
  'qualified',
  'converted',
  'discarded',
] as const;

const assignSchema = z.object({
  userId: z.string().uuid().or(z.literal('__none__')).or(z.literal('')),
});

const statusSchema = z.object({
  status: z.enum(STATUS_VALUES),
});

const notesSchema = z.object({
  notes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export async function assignLeadAction(
  leadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = assignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: 'Asignación no válida.' };

  const userIdValue = parsed.data.userId;
  const userId =
    userIdValue === '__none__' || userIdValue === '' ? null : userIdValue;

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
    .select({ assignedToUserId: leads.assignedToUserId })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Lead no encontrado.' };
  if (prev.assignedToUserId === userId) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(leads)
        .set({ assignedToUserId: userId, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'lead.assigned',
        entityType: 'lead',
        entityId: leadId,
        diff: { assignedToUserId: { from: prev.assignedToUserId, to: userId } },
      });
    });
  } catch (e) {
    console.error('[assignLead] DB error:', e);
    return { status: 'error', message: 'No se pudo asignar.' };
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath('/admin/leads');
  return { status: 'success', message: 'Asignación actualizada.' };
}

export async function changeLeadStatusAction(
  leadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: 'Estado no válido.' };
  const newStatus = parsed.data.status;

  const [prev] = await db
    .select({ status: leads.status, convertedToCustomerId: leads.convertedToCustomerId })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Lead no encontrado.' };

  if (newStatus === 'converted' && !prev.convertedToCustomerId) {
    return {
      status: 'error',
      message:
        'No puedes marcar como "convertido" sin un cliente vinculado. Usa el botón "Convertir a cliente".',
    };
  }

  if (prev.status === newStatus) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(leads)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'lead.status_changed',
        entityType: 'lead',
        entityId: leadId,
        diff: { status: { from: prev.status, to: newStatus } },
      });
    });
  } catch (e) {
    console.error('[changeLeadStatus] DB error:', e);
    return { status: 'error', message: 'No se pudo cambiar el estado.' };
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath('/admin/leads');
  return { status: 'success', message: `Estado: ${newStatus}` };
}

export async function updateLeadNotesAction(
  leadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = notesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Notas demasiado largas.',
      fieldErrors: { notes: 'Máximo 5000 caracteres.' },
    };
  }

  const [prev] = await db
    .select({ notes: leads.notes })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Lead no encontrado.' };

  const newNotes = parsed.data.notes ?? null;
  if ((prev.notes ?? null) === newNotes) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(leads)
        .set({ notes: newNotes, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'lead.notes_updated',
        entityType: 'lead',
        entityId: leadId,
        diff: { lengthFrom: prev.notes?.length ?? 0, lengthTo: newNotes?.length ?? 0 },
      });
    });
  } catch (e) {
    console.error('[updateLeadNotes] DB error:', e);
    return { status: 'error', message: 'No se pudieron guardar las notas.' };
  }

  revalidatePath(`/admin/leads/${leadId}`);
  return { status: 'success', message: 'Notas guardadas.' };
}

/**
 * Helper interno: vincula un lead a un customer recién creado (usado por
 * `createCustomerAction` cuando llega `fromLeadId`).
 */
export async function linkLeadToCustomer(
  leadId: string,
  customerId: string,
  actorUserId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(leads)
      .set({
        status: 'converted',
        convertedToCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));
    await tx.insert(auditLog).values({
      actorUserId,
      action: 'lead.converted',
      entityType: 'lead',
      entityId: leadId,
      diff: { convertedToCustomerId: customerId },
    });
  });
}
