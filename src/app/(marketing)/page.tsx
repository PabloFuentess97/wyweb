import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  LayoutDashboard,
  Palette,
  Search,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectedNodes } from '@/components/marketing/connected-nodes';
import { SectionHeader } from '@/components/marketing/section-header';
import { ServiceCard } from '@/components/marketing/service-card';
import { CaseCard } from '@/components/marketing/case-card';
import { CtaBlock } from '@/components/marketing/cta-block';

export const metadata: Metadata = {
  title: 'Agencia web y SaaS a medida',
  description:
    'Diseño web, desarrollo de SaaS, ecommerce, SEO y mantenimiento para autónomos, pymes y empresas. Soluciones a medida con resultados medibles.',
  alternates: { canonical: '/' },
};

const stats = [
  { value: '2020', label: 'Año fundación' },
  { value: '+60', label: 'Proyectos entregados' },
  { value: '<2s', label: 'LCP medio' },
  { value: '100%', label: 'Remoto' },
] as const;

const services = [
  {
    index: '01',
    title: 'Diseño web',
    description:
      'Webs corporativas, landings y portales hechos a medida con foco en conversión y Core Web Vitals en verde.',
    href: '/servicios/diseno-web',
    Icon: LayoutDashboard,
    tags: ['Next.js', 'Tailwind', 'A11y', 'CWV'],
  },
  {
    index: '02',
    title: 'SaaS a medida',
    description:
      'Plataformas internas y productos a medida con auth, multi-tenant, pagos e integraciones.',
    href: '/servicios/saas',
    Icon: Code2,
    tags: ['Auth.js', 'PostgreSQL', 'Stripe'],
  },
  {
    index: '03',
    title: 'Ecommerce',
    description:
      'Tiendas online con pasarela española, envíos integrados y SEO técnico para vender de verdad.',
    href: '/servicios/ecommerce',
    Icon: ShoppingBag,
    tags: ['Stripe', 'Redsys', 'Shopify', 'Medusa'],
  },
  {
    index: '04',
    title: 'SEO y rendimiento',
    description:
      'Auditoría técnica, on-page, datos estructurados y monitorización mensual de posiciones.',
    href: '/servicios/seo',
    Icon: Search,
    tags: ['Lighthouse', 'GSC', 'GA4'],
  },
  {
    index: '05',
    title: 'Mantenimiento',
    description:
      'Hosting gestionado, monitorización 24/7, backups y bolsa de horas para mejoras continuas.',
    href: '/servicios/mantenimiento',
    Icon: Wrench,
    tags: ['Coolify', 'Hetzner', 'Backups'],
  },
] as const;

const blogTeasers = [
  {
    slug: 'core-web-vitals-en-pyme',
    category: 'Diseño web',
    title: 'Core Web Vitals en una pyme: el plan mínimo que mueve la aguja',
    date: '2026-04-12',
    readTime: '6 min',
  },
  {
    slug: 'cuando-saas-y-cuando-no',
    category: 'SaaS',
    title: 'Cuándo construir un SaaS a medida — y cuándo no merece la pena',
    date: '2026-03-28',
    readTime: '8 min',
  },
  {
    slug: 'mantenimiento-web-paga',
    category: 'Mantenimiento',
    title: 'Mantenimiento web mensual: por qué deja de ser gasto y pasa a inversión',
    date: '2026-03-10',
    readTime: '5 min',
  },
] as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wyweb.net';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${APP_URL}/#organization`,
  name: 'Wyweb',
  url: APP_URL,
  logo: `${APP_URL}/og-default.png`,
  email: 'hola@wyweb.net',
  foundingDate: '2020',
  description:
    'Agencia de diseño web, SaaS a medida, ecommerce, SEO y mantenimiento para autónomos, pymes y empresas.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ES',
  },
  areaServed: { '@type': 'Country', name: 'España' },
} as const;

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${APP_URL}/#website`,
  url: APP_URL,
  name: 'Wyweb',
  inLanguage: 'es-ES',
  publisher: { '@id': `${APP_URL}/#organization` },
} as const;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ─── 1 · HERO ─── */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
              <span>01</span>
              <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
              <span>AGENCIA WEB Y SAAS</span>
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.02]">
              Webs y SaaS a medida para negocios que no quieren plantillas.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Diseñamos y construimos webs corporativas, ecommerce y plataformas a
              medida con foco en rendimiento, conversión y mantenimiento real.
              Para autónomos, pymes y empresas con expectativas altas.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button variant="accent" size="lg" asChild>
                <Link href="/contacto">
                  Solicitar propuesta
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/servicios">Ver servicios</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <ConnectedNodes className="w-full max-w-md ml-auto" />
          </div>
        </div>
      </section>

      {/* ─── 2 · ABOUT STRIP (stats) ─── */}
      <section className="relative border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-12">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1.5 border-l border-[var(--color-border-strong)] pl-4"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold flex items-center gap-2">
                  <span className="text-[var(--color-fg-subtle)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{stat.label}</span>
                </dt>
                <dd className="font-mono text-3xl md:text-4xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── 3 · SERVICIOS ─── */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="02"
            eyebrow="QUÉ HACEMOS"
            title="Servicios cerrados, equipo propio, entrega medible."
            description="De los wireframes al deploy y el mantenimiento mensual. Sin subcontratar lo crítico ni dejar la web abandonada tras el primer pago."
            actions={
              <Button variant="secondary" size="md" asChild>
                <Link href="/servicios">
                  Ver todos
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {services.map((s) => (
              <ServiceCard key={s.href} {...s} />
            ))}
            <article className="hidden lg:flex flex-col justify-between gap-6 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] p-6 bg-[var(--color-bg-subtle)]">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
                  06 / BRANDING
                </p>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                  Identidad visual
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  Naming, logotipo, paleta, tipografía y plantillas operativas. La
                  marca que aguanta más allá del logo.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="self-start -ml-2"
              >
                <Link href="/servicios/branding">
                  Ver branding
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      {/* ─── 4 · CASO DESTACADO ─── */}
      <section className="relative py-20 md:py-28 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="03"
            eyebrow="CASO DESTACADO"
            title="De WordPress lento a Next.js rápido — y más leads."
          />
          <CaseCard
            industry="Servicios profesionales"
            customer="Despacho legal Méndez & Asociados"
            title="Migración de WordPress a Next.js: -68% TTFB y +42% leads orgánicos."
            quote="Tardábamos seis segundos en cargar. Ahora medio. Los formularios reciben más consultas y dejamos de pagar mantenimiento de plugins que nadie usaba."
            attribution={{
              name: 'Carlos Méndez',
              role: 'Socio · Méndez & Asociados',
            }}
            stats={[
              { value: '0.6s', label: 'TTFB medio' },
              { value: '+42%', label: 'Leads orgánicos' },
              { value: '100', label: 'Lighthouse SEO' },
              { value: '6 sem', label: 'Tiempo de entrega' },
            ]}
          />
        </div>
      </section>

      {/* ─── 5 · BLOG TEASER ─── */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="04"
            eyebrow="DESDE EL TALLER"
            title="Notas técnicas, casos y aprendizajes."
            actions={
              <Button variant="secondary" size="md" asChild>
                <Link href="/blog">
                  Ver el blog
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            }
          />

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {blogTeasers.map((post, i) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition-colors hover:border-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-snug flex-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {post.title}
                  </h3>
                  <footer className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] flex items-center justify-between">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    <span>{post.readTime}</span>
                  </footer>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 6 · CTA BLOCK ─── */}
      <section className="relative py-12 md:py-20">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <CtaBlock
            eyebrow="¿HABLAMOS?"
            title={
              <>
                Cuéntanos tu proyecto.
                <br />
                <span className="text-[var(--color-fg-muted)]">
                  Te respondemos en 24h hábiles.
                </span>
              </>
            }
            description="Primera reunión sin compromiso. Si encaja, te planteamos diseño, plazos y presupuesto. Si no, te decimos a quién recurrir."
            primaryCta={{ label: 'Solicitar propuesta', href: '/contacto' }}
            secondaryCta={{ label: 'hola@wyweb.net', href: 'mailto:hola@wyweb.net' }}
          />
        </div>
      </section>
    </>
  );
}

function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(iso))
    .toUpperCase();
}
