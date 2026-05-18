import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wyweb',
    short_name: 'Wyweb',
    description:
      'Agencia web y SaaS a medida: diseño web, ecommerce, SEO y mantenimiento para autónomos, pymes y empresas.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAFAF9',
    theme_color: '#0E1120',
    lang: 'es-ES',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
