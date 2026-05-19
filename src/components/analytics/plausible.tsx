import Script from 'next/script';

/**
 * Plausible Analytics — script ligero (~1KB) y privacy-friendly.
 * Self-hosted en `analytics.wyweb.net` — solo se carga si las dos env vars
 * están configuradas. En `development` no se carga para evitar contaminar
 * métricas reales.
 *
 * Variables esperadas:
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   → dominio que Plausible registra (wyweb.net)
 *   NEXT_PUBLIC_PLAUSIBLE_HOST     → URL del Plausible self-hosted
 *                                    (default: https://analytics.wyweb.net)
 */
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host =
    process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? 'https://analytics.wyweb.net';

  if (!domain) return null;
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <Script
      defer
      strategy="afterInteractive"
      data-domain={domain}
      data-api={`${host}/api/event`}
      src={`${host}/js/script.js`}
    />
  );
}
