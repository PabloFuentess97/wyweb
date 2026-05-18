import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

const APP_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
const isProd =
  APP_URL.startsWith('https://wyweb.es') || APP_URL === 'https://wyweb.es';

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/area-cliente/', '/dev/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
