import 'server-only';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, customerUsers } from '@/lib/db/schema';
import { verifyPassword } from './password';
import { authConfigEdge } from './config.edge';

const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

/**
 * Config Auth.js completa (Node runtime).
 * Extiende `authConfigEdge` añadiendo el Credentials provider que requiere DB
 * y Argon2 (no compatibles con Edge).
 */
export const authConfig = {
  ...authConfigEdge,
  providers: [
    Credentials({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tu@email.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), isNull(users.deletedAt)))
          .limit(1);
        if (!user || !user.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        const customerLinks = await db
          .select({ customerId: customerUsers.customerId })
          .from(customerUsers)
          .where(eq(customerUsers.userId, user.id));

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          themePreference: user.themePreference as 'light' | 'dark' | 'system',
          densityPreference: user.densityPreference as 'comfortable' | 'compact',
          language: user.language,
          customerIds: customerLinks.map((l) => l.customerId),
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
