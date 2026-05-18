import 'server-only';
import { headers } from 'next/headers';

/**
 * Rate limiter en memoria por sliding window. Apto para una instancia de Next
 * en development o producción single-replica (caso actual de Coolify
 * single-app). Para multi-instance: swap a Redis vía REDIS_URL — la firma
 * pública (`createRateLimiter().check(key)`) no cambia.
 *
 * Uso:
 *   const rl = createRateLimiter({ window: 60 * 60_000, limit: 5 });
 *   const r = rl.check(`contact:${ip}`);
 *   if (!r.ok) return new Response('Too Many Requests', { status: 429 });
 */

type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type Options = {
  window: number;
  limit: number;
};

export function createRateLimiter({ window, limit }: Options) {
  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const existing = store.get(key);
      if (!existing || existing.resetAt < now) {
        const resetAt = now + window;
        store.set(key, { count: 1, resetAt });
        return { ok: true, remaining: limit - 1, resetAt };
      }
      if (existing.count >= limit) {
        return { ok: false, remaining: 0, resetAt: existing.resetAt };
      }
      existing.count += 1;
      store.set(key, existing);
      return {
        ok: true,
        remaining: limit - existing.count,
        resetAt: existing.resetAt,
      };
    },
  };
}

/** Limpieza periódica para evitar memoria infinita. */
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, hit] of store.entries()) {
        if (hit.resetAt < now) store.delete(key);
      }
    },
    10 * 60_000,
  ).unref?.();
}

/**
 * Extrae la IP del cliente de los headers HTTP. Funciona en server actions y
 * route handlers. Devuelve `'unknown'` como último recurso (rate limit por
 * red entera vs por IP individual — degradación segura).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  return h.get('x-real-ip') ?? h.get('cf-connecting-ip') ?? 'unknown';
}

/**
 * Limiters globales por endpoint. Comparten el `store` Map → consume memoria
 * proporcional al número de IPs únicas dentro del window. Default ~10k IPs ≈ <1MB.
 */
export const loginLimiter = createRateLimiter({
  window: 15 * 60_000, // 15 min
  limit: 10, // 10 intentos por IP en 15 min
});

export const passwordResetLimiter = createRateLimiter({
  window: 60 * 60_000, // 1 h
  limit: 5, // 5 reset emails por IP por hora
});

export const contactLimiter = createRateLimiter({
  window: 60 * 60_000, // 1 h
  limit: 5,
});
