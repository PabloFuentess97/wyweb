'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, users } from '@/lib/db/schema';
import {
  hashPassword,
  validatePasswordShape,
  verifyPassword,
} from '@/lib/auth/password';
import {
  changePasswordSchema,
  updateProfileSchema,
} from '@/lib/validation/user';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { status: 'error', message: 'Sesión no válida.' };
  }

  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
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
  const userId = session.user.id;

  // Snapshot del estado previo para diff
  const [previous] = await db
    .select({
      name: users.name,
      themePreference: users.themePreference,
      densityPreference: users.densityPreference,
      language: users.language,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!previous) {
    return { status: 'error', message: 'Usuario no encontrado.' };
  }

  const changed: Record<string, { from: string; to: string }> = {};
  if (previous.name !== data.name) {
    changed.name = { from: previous.name, to: data.name };
  }
  if (previous.themePreference !== data.themePreference) {
    changed.themePreference = {
      from: previous.themePreference,
      to: data.themePreference,
    };
  }
  if (previous.densityPreference !== data.densityPreference) {
    changed.densityPreference = {
      from: previous.densityPreference,
      to: data.densityPreference,
    };
  }
  if (previous.language !== data.language) {
    changed.language = { from: previous.language, to: data.language };
  }

  if (Object.keys(changed).length === 0) {
    return { status: 'success', message: 'Sin cambios pendientes.' };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          name: data.name,
          themePreference: data.themePreference,
          densityPreference: data.densityPreference,
          language: data.language,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      await tx.insert(auditLog).values({
        actorUserId: userId,
        action: 'user.profile_updated',
        entityType: 'user',
        entityId: userId,
        diff: changed,
      });
    });
  } catch (e) {
    console.error('[updateProfile] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo guardar. Inténtalo de nuevo.',
    };
  }

  revalidatePath('/area-cliente/perfil');
  return {
    status: 'success',
    message: 'Perfil actualizado. Cierra y vuelve a iniciar sesión para que el cambio se aplique en todo el sitio.',
  };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { status: 'error', message: 'Sesión no válida.' };
  }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
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

  const { currentPassword, newPassword } = parsed.data;

  const shapeError = validatePasswordShape(newPassword);
  if (shapeError) {
    return {
      status: 'error',
      message: shapeError,
      fieldErrors: { newPassword: shapeError },
    };
  }

  const userId = session.user.id;
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.passwordHash) {
    return {
      status: 'error',
      message:
        'Tu cuenta no tiene contraseña configurada. Usa "Recuperar contraseña" desde el login.',
    };
  }

  const okCurrent = await verifyPassword(currentPassword, user.passwordHash);
  if (!okCurrent) {
    return {
      status: 'error',
      message: 'La contraseña actual no es correcta.',
      fieldErrors: { currentPassword: 'No coincide con tu contraseña actual' },
    };
  }

  const newHash = await hashPassword(newPassword);
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await tx.insert(auditLog).values({
        actorUserId: userId,
        action: 'user.password_changed',
        entityType: 'user',
        entityId: userId,
        diff: { method: 'self_service' },
      });
    });
  } catch (e) {
    console.error('[changePassword] DB error:', e);
    return {
      status: 'error',
      message: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
    };
  }

  return {
    status: 'success',
    message:
      'Contraseña actualizada. La próxima vez que inicies sesión deberás usarla.',
  };
}
