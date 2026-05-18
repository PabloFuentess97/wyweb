'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { render } from '@react-email/render';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, customerUsers, customers, users } from '@/lib/db/schema';
import { createPasswordResetToken } from '@/lib/auth/password-reset';
import {
  changeRoleSchema,
  createClientSchema,
  createStaffSchema,
} from '@/lib/validation/admin-user';
import { sendEmail } from '@/lib/email';
import { WelcomeStaffEmail } from '@/lib/email/templates/welcome-staff';
import { env } from '@/lib/env';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

async function requireStaffAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'staff_admin') {
    return {
      error: 'Esta acción requiere rol staff_admin.',
      session: null as never,
    };
  }
  return { error: null as never, session };
}

const ROLE_LABELS: Record<string, string> = {
  staff_admin: 'Staff · Admin',
  staff_agent: 'Staff · Agente',
  client_admin: 'Cliente · Admin',
  client_user: 'Cliente · Usuario',
};

async function emailExists(email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return !!row;
}

async function sendWelcomeEmail(opts: {
  userId: string;
  name: string;
  email: string;
  role: string;
}): Promise<void> {
  const { token, expiresAt } = await createPasswordResetToken(opts.userId);
  const setupUrl = `${env.NEXT_PUBLIC_APP_URL}/restablecer/${token}`;
  const html = await render(
    WelcomeStaffEmail({
      name: opts.name,
      setupUrl,
      role: ROLE_LABELS[opts.role] ?? opts.role,
      expiresAt,
    }),
  );
  await sendEmail({
    to: opts.email,
    subject: 'Bienvenido a Wyweb · Fija tu contraseña',
    html,
  });
}

export async function createStaffUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = createStaffSchema.safeParse(Object.fromEntries(formData));
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

  if (await emailExists(data.email)) {
    return {
      status: 'error',
      message: 'Ya existe un usuario con ese email.',
      fieldErrors: { email: 'Email duplicado' },
    };
  }

  let userId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          role: data.role,
        })
        .returning({ id: users.id });
      if (!created) throw new Error('Insert failed');

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'user.created',
        entityType: 'user',
        entityId: created.id,
        diff: { role: data.role, kind: 'staff' },
      });

      return created.id;
    });
    userId = result;
  } catch (e) {
    console.error('[createStaffUser] DB error:', e);
    return { status: 'error', message: 'No se pudo crear el usuario.' };
  }

  // Email de bienvenida (no bloquea creación si falla)
  try {
    await sendWelcomeEmail({
      userId,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  } catch (e) {
    console.error('[createStaffUser] welcome email failed:', e);
  }

  revalidatePath('/admin/usuarios');
  redirect(`/admin/usuarios/${userId}`);
}

export async function createClientUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = createClientSchema.safeParse(Object.fromEntries(formData));
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

  // Validar customer existe y está activo
  const [cust] = await db
    .select({ id: customers.id, legalName: customers.legalName })
    .from(customers)
    .where(and(eq(customers.id, data.customerId), isNull(customers.deletedAt)))
    .limit(1);
  if (!cust) {
    return {
      status: 'error',
      message: 'Cliente no válido.',
      fieldErrors: { customerId: 'Cliente no encontrado' },
    };
  }

  if (await emailExists(data.email)) {
    return {
      status: 'error',
      message: 'Ya existe un usuario con ese email.',
      fieldErrors: { email: 'Email duplicado' },
    };
  }

  let userId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          role: data.role,
        })
        .returning({ id: users.id });
      if (!created) throw new Error('Insert failed');

      await tx.insert(customerUsers).values({
        customerId: data.customerId,
        userId: created.id,
        customerRole: data.customerRole,
      });

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'user.created',
        entityType: 'user',
        entityId: created.id,
        diff: {
          role: data.role,
          kind: 'client',
          customerId: data.customerId,
          customerRole: data.customerRole,
        },
      });

      return created.id;
    });
    userId = result;
  } catch (e) {
    console.error('[createClientUser] DB error:', e);
    return { status: 'error', message: 'No se pudo crear el usuario.' };
  }

  try {
    await sendWelcomeEmail({
      userId,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  } catch (e) {
    console.error('[createClientUser] welcome email failed:', e);
  }

  revalidatePath('/admin/usuarios');
  redirect(`/admin/usuarios/${userId}`);
}

export async function changeUserRoleAction(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = changeRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Rol no válido.' };
  }
  const newRole = parsed.data.role;

  // No permitir auto-degradación de staff_admin (evita lock-out accidental)
  if (
    userId === session.user.id &&
    session.user.role === 'staff_admin' &&
    newRole !== 'staff_admin'
  ) {
    return {
      status: 'error',
      message:
        'No puedes quitarte el rol staff_admin a ti mismo. Pide a otro admin que lo haga.',
    };
  }

  const [prev] = await db
    .select({ role: users.role, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Usuario no encontrado.' };
  if (prev.role === newRole) {
    return { status: 'success', message: 'Sin cambios.' };
  }

  // Si pasa de cliente a staff (o viceversa), se mantienen customer_users —
  // el frontend mostrará advertencia visual.
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, userId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'user.role_changed',
        entityType: 'user',
        entityId: userId,
        diff: { role: { from: prev.role, to: newRole } },
      });
    });
  } catch (e) {
    console.error('[changeRole] DB error:', e);
    return { status: 'error', message: 'No se pudo cambiar el rol.' };
  }

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath('/admin/usuarios');
  return { status: 'success', message: `Rol actualizado a ${newRole}.` };
}

export async function softDeleteUserAction(
  userId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  if (userId === session.user.id) {
    return { status: 'error', message: 'No puedes eliminarte a ti mismo.' };
  }

  const [prev] = await db
    .select({ role: users.role, deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Usuario no encontrado.' };
  if (prev.deletedAt) {
    return { status: 'error', message: 'El usuario ya está eliminado.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'user.soft_deleted',
        entityType: 'user',
        entityId: userId,
        diff: { role: prev.role },
      });
    });
  } catch (e) {
    console.error('[softDeleteUser] DB error:', e);
    return { status: 'error', message: 'No se pudo eliminar.' };
  }

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath('/admin/usuarios');
  return { status: 'success', message: 'Usuario eliminado (soft delete).' };
}

export async function restoreUserAction(
  userId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const [prev] = await db
    .select({ deletedAt: users.deletedAt, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!prev) return { status: 'error', message: 'Usuario no encontrado.' };
  if (!prev.deletedAt) {
    return { status: 'success', message: 'El usuario ya está activo.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(users.id, userId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'user.restored',
        entityType: 'user',
        entityId: userId,
        diff: { role: prev.role },
      });
    });
  } catch (e) {
    console.error('[restoreUser] DB error:', e);
    return { status: 'error', message: 'No se pudo restaurar.' };
  }

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath('/admin/usuarios');
  return { status: 'success', message: 'Usuario restaurado.' };
}

export async function resendWelcomeEmailAction(
  userId: string,
): Promise<ActionState> {
  const { error: authErr } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return { status: 'error', message: 'Usuario no encontrado.' };

  try {
    await sendWelcomeEmail({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error('[resendWelcome] error:', e);
    return { status: 'error', message: 'No se pudo enviar el email.' };
  }

  return { status: 'success', message: 'Email de bienvenida reenviado.' };
}
