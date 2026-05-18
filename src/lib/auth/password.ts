import 'server-only';
import { hash, verify } from '@node-rs/argon2';

/**
 * Parámetros Argon2id según OWASP 2024 / RFC 9106 (m=19MiB, t=2, p=1).
 * Equilibrio razonable entre seguridad y latencia (~50-100ms en hardware moderno).
 *
 * `algorithm: 2` corresponde a `Algorithm.Argon2id` en `@node-rs/argon2`.
 * Usamos el literal numérico porque el const enum no es accesible con
 * `isolatedModules: true`.
 */
const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    return await verify(hashed, plain);
  } catch {
    // Hash inválido o corrupto → fail closed.
    return false;
  }
}

/**
 * Validación servidor-side de contraseña. La validación cliente con zxcvbn
 * vive en el componente del formulario.
 *
 * Reglas mínimas:
 *  - 12 caracteres mínimo
 *  - 128 caracteres máximo
 */
export function validatePasswordShape(password: string): string | null {
  if (password.length < 12) return 'Mínimo 12 caracteres.';
  if (password.length > 128) return 'Máximo 128 caracteres.';
  return null;
}
