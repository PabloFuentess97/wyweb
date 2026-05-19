import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { PlausibleScript } from '@/components/analytics/plausible';
import { getInitialTheme } from '@/components/providers/theme-server';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wyweb.net';

export const metadata: Metadata = {
  title: {
    default: 'Wyweb — Agencia web y SaaS a medida',
    template: '%s | Wyweb',
  },
  description:
    'Diseño web, desarrollo de SaaS, ecommerce, SEO y mantenimiento para autónomos, pymes y empresas. Soluciones a medida con resultados medibles.',
  metadataBase: new URL(APP_URL),
  applicationName: 'Wyweb',
  authors: [{ name: 'Wyweb', url: APP_URL }],
  creator: 'Wyweb',
  publisher: 'Wyweb',
  keywords: [
    'agencia web',
    'diseño web',
    'desarrollo web a medida',
    'SaaS',
    'ecommerce',
    'SEO',
    'mantenimiento web',
    'autónomos',
    'pymes',
    'empresas',
    'España',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: APP_URL,
    siteName: 'Wyweb',
    title: 'Wyweb — Agencia web y SaaS a medida',
    description:
      'Diseño web, SaaS a medida, ecommerce, SEO y mantenimiento. Para autónomos, pymes y empresas.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Wyweb — Agencia web y SaaS a medida',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wyweb — Agencia web y SaaS a medida',
    description:
      'Diseño web, SaaS, ecommerce, SEO y mantenimiento para empresas españolas.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#101013' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialTheme = await getInitialTheme();
  return (
    <html
      lang="es-ES"
      className={`${inter.variable} ${mono.variable}`}
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <PlausibleScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
