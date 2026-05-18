'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, services } from '@/lib/db/schema';
import {
  STATUS_TRANSITIONS,
  createServiceSchema,
  updateServiceSchema,
} from '@/lib/validation/service';
import { generateServiceCode } from '@/lib/db/queries/services-admin';

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

function parseMetadata(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  const parsed = createServiceSchema.safeParse(Object.fromEntries(formData));
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

  const code = await generateServiceCode();
  let serviceId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(services)
        .values({
          code,
          customerId: data.customerId,
          name: data.name,
          description: data.description,
          category: data.category,
          status: data.status,
          slaTier: data.slaTier,
          startedAt: data.startedAt ?? null,
          endedAt: data.endedAt ?? null,
          monthlyFeeCents: data.monthlyFeeCents ?? null,
          metadata: parseMetadata(data.metadata),
        })
        .returning({ id: services.id });
      if (!created) throw new Error('Insert failed');

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'service.created',
        entityType: 'service',
        entityId: created.id,
        diff: {
          code,
          customerId: data.customerId,
          category: data.category,
          status: data.status,
        },
      });

      return created.id;
    });
    serviceId = result;
  } catch (e) {
    console.error('[createService] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo crear el servicio. Inténtalo de nuevo.',
    };
  }

  revalidatePath('/admin/servicios');
  redirect(`/admin/servicios/${serviceId}`);
}

export async function updateServiceAction(
  serviceId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  const parsed = updateServiceSchema.safeParse(Object.fromEntries(formData));
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

  const [previous] = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);
  if (!previous) {
    return { status: 'error', message: 'Servicio no encontrado.' };
  }

  // Validar transición de status si cambió
  if (data.status && data.status !== previous.status) {
    const allowed = STATUS_TRANSITIONS[previous.status];
    if (!allowed.includes(data.status)) {
      return {
        status: 'error',
        message: `Transición no permitida: ${previous.status} → ${data.status}.`,
        fieldErrors: { status: 'Transición no permitida' },
      };
    }
  }

  const newMetadata = data.metadata !== undefined
    ? parseMetadata(data.metadata)
    : previous.metadata;

  const updates = {
    ...(data.customerId && { customerId: data.customerId }),
    ...(data.name && { name: data.name }),
    description: data.description ?? null,
    ...(data.category && { category: data.category }),
    ...(data.status && { status: data.status }),
    ...(data.slaTier && { slaTier: data.slaTier }),
    startedAt: data.startedAt ?? null,
    endedAt: data.endedAt ?? null,
    monthlyFeeCents:
      data.monthlyFeeCents === undefined ? null : data.monthlyFeeCents,
    metadata: newMetadata,
    updatedAt: new Date(),
  };

  // Diff
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(updates) as Array<keyof typeof updates>) {
    if (key === 'updatedAt') continue;
    const prevVal = (previous as unknown as Record<string, unknown>)[key as string];
    const newVal = (updates as unknown as Record<string, unknown>)[key as string];
    if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
      diff[key as string] = { from: prevVal, to: newVal };
    }
  }
  if (Object.keys(diff).length === 0) {
    return { status: 'success', message: 'Sin cambios pendientes.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(services).set(updates).where(eq(services.id, serviceId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'service.updated',
        entityType: 'service',
        entityId: serviceId,
        diff,
      });
    });
  } catch (e) {
    console.error('[updateService] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo guardar. Inténtalo de nuevo.',
    };
  }

  revalidatePath(`/admin/servicios/${serviceId}`);
  revalidatePath('/admin/servicios');
  return { status: 'success', message: 'Servicio actualizado.' };
}

export async function changeServiceStatusAction(
  serviceId: string,
  newStatus: 'active' | 'pending' | 'suspended' | 'terminated',
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  const [prev] = await db
    .select({ status: services.status })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);
  if (!prev) {
    return { status: 'error', message: 'Servicio no encontrado.' };
  }

  const allowed = STATUS_TRANSITIONS[prev.status];
  if (!allowed.includes(newStatus)) {
    return {
      status: 'error',
      message: `Transición no permitida: ${prev.status} → ${newStatus}.`,
    };
  }

  try {
    await db.transaction(async (tx) => {
      const updates: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
      };
      if (newStatus === 'terminated') updates.endedAt = new Date().toISOString().slice(0, 10);
      if (newStatus === 'active' && !prev) updates.startedAt = new Date().toISOString().slice(0, 10);

      await tx.update(services).set(updates).where(eq(services.id, serviceId));

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'service.status_changed',
        entityType: 'service',
        entityId: serviceId,
        diff: { status: { from: prev.status, to: newStatus } },
      });
    });
  } catch (e) {
    console.error('[changeServiceStatus] DB error:', e);
    return { status: 'error', message: 'No se pudo cambiar el estado.' };
  }

  revalidatePath(`/admin/servicios/${serviceId}`);
  revalidatePath('/admin/servicios');
  return { status: 'success', message: `Estado actualizado a ${newStatus}.` };
}
