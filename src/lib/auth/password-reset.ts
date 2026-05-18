import 'server-only';
import { randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { passwordResetTokens, users } from '@/lib/db/schema';

/** TTL del token de reset: 7 días. */
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Genera un token hex de 64 chars (32 bytes). */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Crea un token de password reset para el user dado y lo persiste.
 * Devuelve el token plano (a enviar por email).
 *
 * Por seguridad, también invalida tokens previos no usados del mismo user.
 */
export async function createPasswordResetToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  // Invalidar tokens previos no usados
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)),
    );

  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.insert(passwordResetTokens).values({
    token,
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

export type ResetTokenStatus =
  | { ok: true; userId: string; email: string; name: string }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'USED' };

/**
 * Verifica un token y devuelve la info del user.
 * NO marca el token como usado — eso debe hacerse explícitamente al consumir.
 */
export async function verifyResetToken(token: string): Promise<ResetTokenStatus> {
  if (!token || token.length !== 64) return { ok: false, reason: 'NOT_FOUND' };

  const [row] = await db
    .select({
      token: passwordResetTokens.token,
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(passwordResetTokens)
    .innerJoin(users, eq(passwordResetTokens.userId, users.id))
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!row) return { ok: false, reason: 'NOT_FOUND' };
  if (row.usedAt) return { ok: false, reason: 'USED' };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'EXPIRED' };

  return {
    ok: true,
    userId: row.userId,
    email: row.userEmail,
    name: row.userName,
  };
}

/** Marca un token como usado. */
export async function markTokenUsed(token: string): Promise<void> {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );
}
