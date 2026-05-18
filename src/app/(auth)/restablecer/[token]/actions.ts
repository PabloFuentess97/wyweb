'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, auditLog } from '@/lib/db/schema';
import {
  hashPassword,
  validatePasswordShape,
} from '@/lib/auth/password';
import {
  markTokenUsed,
  verifyResetToken,
} from '@/lib/auth/password-reset';

const schema = z
  .object({
    token: z.string().length(64),
    password: z.string(),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

export type RestablecerState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string>;
      code?: 'TOKEN_INVALID';
    };

export async function restablecerAction(
  _prev: RestablecerState,
  formData: FormData,
): Promise<RestablecerState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
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

  const { token, password } = parsed.data;

  const shapeError = validatePasswordShape(password);
  if (shapeError) {
    return {
      status: 'error',
      message: shapeError,
      fieldErrors: { password: shapeError },
    };
  }

  const tokenStatus = await verifyResetToken(token);
  if (!tokenStatus.ok) {
    return {
      status: 'error',
      code: 'TOKEN_INVALID',
      message:
        tokenStatus.reason === 'EXPIRED'
          ? 'El enlace ha caducado. Solicita uno nuevo.'
          : tokenStatus.reason === 'USED'
            ? 'Este enlace ya se ha usado. Solicita uno nuevo.'
            : 'Enlace no válido. Solicita uno nuevo.',
    };
  }

  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, emailVerified: new Date(), updatedAt: new Date() })
    .where(eq(users.id, tokenStatus.userId));

  await markTokenUsed(token);

  await db.insert(auditLog).values({
    actorUserId: tokenStatus.userId,
    action: 'password.reset',
    entityType: 'user',
    entityId: tokenStatus.userId,
    diff: { method: 'password_reset_token' },
  });

  return { status: 'success' };
}
