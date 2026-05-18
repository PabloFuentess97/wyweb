'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { getClientIp, loginLimiter } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'Contraseña requerida'),
  from: z.string().optional(),
});

export type LoginState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Rate limit por IP — 10 intentos / 15 min
  const ip = await getClientIp();
  const rl = loginLimiter.check(`login:${ip}`);
  if (!rl.ok) {
    const minutes = Math.ceil((rl.resetAt - Date.now()) / 60_000);
    return {
      status: 'error',
      message: `Demasiados intentos. Inténtalo en ${minutes} min.`,
    };
  }

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

  const { email, password, from } = parsed.data;
  const callbackUrl = isSafeRedirect(from) ? from : undefined;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl ?? '/area-cliente',
    });
    // signIn lanza un redirect interno — esta línea no se alcanza
    return { status: 'idle' };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === 'CredentialsSignin') {
        return {
          status: 'error',
          message: 'Email o contraseña incorrectos.',
        };
      }
      return {
        status: 'error',
        message: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      };
    }
    // Re-lanzar el redirect (NEXT_REDIRECT) para que Next lo procese
    throw err;
  }
}

function isSafeRedirect(path: string | undefined): path is string {
  if (!path) return false;
  // Solo paths internos (mismo origen) que empiecen por /
  return path.startsWith('/') && !path.startsWith('//');
}
