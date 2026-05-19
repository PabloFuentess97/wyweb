import type { NextConfig } from 'next';
import { withContentCollections } from '@content-collections/next';

const isProd = process.env.NODE_ENV === 'production';
const PLAUSIBLE_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? 'https://analytics.wyweb.net';
const SENTRY_HOST = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? new URL(process.env.NEXT_PUBLIC_SENTRY_DSN).origin
  : 'https://errors.wyweb.net';
const S3_PUBLIC = process.env.S3_PUBLIC_URL ?? 'https://s3.wyweb.net';

/**
 * Content-Security-Policy estricta. Notas:
 *   - Tailwind y Next inyectan `<style>` inline → necesitamos `'unsafe-inline'`
 *     para `style-src` (estándar en Next App Router).
 *   - Next inserta scripts de hidratación con nonces que ya están permitidos
 *     vía `'self'`. Plausible y Sentry son los únicos hosts externos.
 *   - `'unsafe-eval'` se mantiene en dev (lo necesita HMR de Turbopack).
 */
function buildCsp(): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Next.js inline scripts (RSC streaming)
      ...(isProd ? [] : ["'unsafe-eval'"]),
      PLAUSIBLE_HOST,
      SENTRY_HOST,
    ],
    'style-src': ["'self'", "'unsafe-inline'"], // Tailwind inline + inline styles
    'img-src': ["'self'", 'data:', 'blob:', S3_PUBLIC, 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      PLAUSIBLE_HOST,
      SENTRY_HOST,
      S3_PUBLIC,
      ...(isProd ? [] : ['ws:', 'wss:']), // HMR
    ],
    'frame-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': isProd ? [''] : [],
  };

  return Object.entries(directives)
    .filter(([, values]) => values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(' ').trim()}`.trim())
    .join('; ');
}

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: buildCsp() },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withContentCollections(nextConfig);
