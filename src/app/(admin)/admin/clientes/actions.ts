'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, customers } from '@/lib/db/schema';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '@/lib/validation/customer';
import { existsCustomerByCif } from '@/lib/db/queries/customers';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

const initial: ActionState = { status: 'idle' };

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) {
    return { error: 'Sesión no válida.', session: null as never };
  }
  return { error: null as never, session };
}

export async function createCustomerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const fromLeadId = raw.fromLeadId && raw.fromLeadId.length > 0 ? raw.fromLeadId : null;

  const parsed = createCustomerSchema.safeParse(raw);
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
  if (await existsCustomerByCif(data.cif)) {
    return {
      status: 'error',
      message: 'Ya existe un cliente con ese CIF/NIF.',
      fieldErrors: { cif: 'Este CIF/NIF ya está registrado.' },
    };
  }

  let customerId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(customers)
        .values({
          cif: data.cif,
          legalName: data.legalName,
          tradeName: data.tradeName,
          emailBilling: data.emailBilling,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          postalCode: data.postalCode,
          city: data.city,
          province: data.province,
          country: data.country,
          iban: data.iban,
          status: data.status,
          brand: 'wyweb',
          notes: data.notes,
        })
        .returning({ id: customers.id });
      if (!created) throw new Error('Insert failed');

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'customer.created',
        entityType: 'customer',
        entityId: created.id,
        diff: { cif: data.cif, legalName: data.legalName, status: data.status },
      });

      return created.id;
    });
    customerId = result;
  } catch (e) {
    console.error('[createCustomer] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo crear el cliente. Inténtalo de nuevo.',
    };
  }

  // Si viene de un lead, vincular el lead al customer + marcar converted
  if (fromLeadId) {
    try {
      const { linkLeadToCustomer } = await import(
        '@/app/(admin)/admin/leads/actions'
      );
      await linkLeadToCustomer(fromLeadId, customerId, session.user.id);
      revalidatePath('/admin/leads');
      revalidatePath(`/admin/leads/${fromLeadId}`);
    } catch (e) {
      console.error('[createCustomer] linkLeadToCustomer error:', e);
      // El cliente sí se creó — no rollback. El lead quedará sin convertir.
    }
  }

  revalidatePath('/admin/clientes');
  redirect(`/admin/clientes/${customerId}`);
}

export async function updateCustomerAction(
  customerId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  const parsed = updateCustomerSchema.safeParse(Object.fromEntries(formData));
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
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!previous) {
    return { status: 'error', message: 'Cliente no encontrado.' };
  }

  if (data.cif && data.cif !== previous.cif) {
    if (await existsCustomerByCif(data.cif, customerId)) {
      return {
        status: 'error',
        message: 'Ese CIF/NIF ya está registrado en otro cliente.',
        fieldErrors: { cif: 'Duplicado' },
      };
    }
  }

  // Construir diff
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of Object.keys(data) as Array<keyof typeof data>) {
    const newVal = data[k];
    const oldVal = (previous as unknown as Record<string, unknown>)[k as string];
    if (newVal !== undefined && newVal !== oldVal) {
      diff[k as string] = { from: oldVal, to: newVal };
    }
  }

  if (Object.keys(diff).length === 0) {
    return { status: 'success', message: 'Sin cambios pendientes.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(customers)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'customer.updated',
        entityType: 'customer',
        entityId: customerId,
        diff,
      });
    });
  } catch (e) {
    console.error('[updateCustomer] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo guardar. Inténtalo de nuevo.',
    };
  }

  revalidatePath(`/admin/clientes/${customerId}`);
  revalidatePath('/admin/clientes');
  return { status: 'success', message: 'Cliente actualizado.' };
}

export async function archiveCustomerAction(
  customerId: string,
): Promise<ActionState> {
  const { error: authError, session } = await requireStaff();
  if (authError) return { status: 'error', message: authError };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(customers)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(customers.id, customerId));

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'customer.archived',
        entityType: 'customer',
        entityId: customerId,
        diff: { status: { to: 'archived' } },
      });
    });
  } catch (e) {
    console.error('[archiveCustomer] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo archivar.',
    };
  }

  revalidatePath('/admin/clientes');
  revalidatePath(`/admin/clientes/${customerId}`);
  return { status: 'success', message: 'Cliente archivado.' };
}
