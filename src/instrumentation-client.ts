/**
 * Cliente: inicializa Sentry/Glitchtip si NEXT_PUBLIC_SENTRY_DSN está
 * configurado. En dev no-op para evitar ruido.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Glitchtip-friendly: no replay, no profiling, no perf
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: (defaults) =>
      defaults.filter(
        (i) =>
          // Quitamos integraciones no soportadas por Glitchtip
          i.name !== 'Replay' &&
          i.name !== 'BrowserProfiling' &&
          i.name !== 'BrowserTracing',
      ),
    beforeSend(event) {
      // Anonimiza emails/IPs si llegan en el contexto user
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

// Required export para que Next 16 use este archivo en el cliente
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
