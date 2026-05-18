/**
 * Next.js instrumentation hook (server + edge runtimes).
 *
 * Inicializa Sentry/Glitchtip si `SENTRY_DSN` está configurado.
 * Si no está, la función no-op para no añadir overhead en dev.
 *
 * Next 16 llama a `register()` automáticamente en el arranque del servidor.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.GIT_SHA ?? undefined,
      // Glitchtip soporta error capture completo, pero no replay/profiling.
      tracesSampleRate: 0,
      // Filtra ruidos típicos de Next 16
      beforeSend(event, hint) {
        const err = hint?.originalException;
        if (err instanceof Error) {
          // Errores de redirect/notFound son control flow, no errores
          if (err.message === 'NEXT_REDIRECT' || err.message === 'NEXT_NOT_FOUND') {
            return null;
          }
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 0,
    });
  }
}

// Captura errores de server-side rendering / route handlers.
// Next.js 16 llama a este hook con su propia firma; tipamos `unknown` y
// delegamos en Sentry sin transformar — la SDK conoce el formato.
export async function onRequestError(...args: unknown[]) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import('@sentry/nextjs');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Sentry.captureRequestError as any)(...args);
}
