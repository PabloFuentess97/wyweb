'use server';

import { z } from 'zod';
import { render } from '@react-email/render';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createPasswordResetToken } from '@/lib/auth/password-reset';
import { sendEmail } from '@/lib/email';
import { PasswordResetEmail } from '@/lib/email/templates/password-reset';
import { env } from '@/lib/env';
import { getClientIp, passwordResetLimiter } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email('Email no válido').toLowerCase(),
});

export type RecuperarState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export async function recuperarAction(
  _prev: RecuperarState,
  formData: FormData,
): Promise<RecuperarState> {
  // Rate limit: máx 5 reset emails / IP / hora.
  // Anti-enumeration: aún limitados, mostramos siempre `success` al cliente
  // si el email no existe — pero rechazamos antes de tocar la BD.
  const ip = await getClientIp();
  const rl = passwordResetLimiter.check(`reset:${ip}`);
  if (!rl.ok) {
    return {
      status: 'error',
      message: 'Demasiadas solicitudes. Inténtalo más tarde.',
    };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Email no válido.',
    };
  }
  const { email } = parsed.data;

  // Buscar el user. NO indicamos al frontend si existe o no (anti-enumeration).
  const [user] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (user) {
    try {
      const { token, expiresAt } = await createPasswordResetToken(user.id);
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/restablecer/${token}`;
      const html = await render(
        PasswordResetEmail({ name: user.name, resetUrl, expiresAt }),
      );
      await sendEmail({
        to: email,
        subject: 'Restablece tu contraseña · Wyweb',
        html,
      });
    } catch (err) {
      console.error('[recuperar] error:', err);
      // Aunque falle el envío, devolvemos success al usuario para no revelar info.
    }
  }

  return { status: 'success' };
}
