import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { MarkerWyweb } from '@/components/icons/marker-wyweb';
import { WordmarkWyweb } from '@/components/marketing/wordmark-wyweb';

const cols = [
  {
    title: 'Servicios',
    links: [
      { label: 'Diseño web', href: '/servicios/diseno-web' },
      { label: 'SaaS a medida', href: '/servicios/saas' },
      { label: 'Ecommerce', href: '/servicios/ecommerce' },
      { label: 'SEO y rendimiento', href: '/servicios/seo' },
      { label: 'Mantenimiento', href: '/servicios/mantenimiento' },
      { label: 'Branding', href: '/servicios/branding' },
    ],
  },
  {
    title: 'Agencia',
    links: [
      { label: 'Sobre nosotros', href: '/grupo' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Área cliente', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Aviso legal', href: '/legal/aviso-legal' },
      { label: 'Privacidad', href: '/legal/privacidad' },
      { label: 'Cookies', href: '/legal/cookies' },
    ],
  },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-[var(--container-2xl)] px-[var(--container-padding)] pt-16 pb-8">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <MarkerWyweb className="h-6 w-6 text-[var(--color-accent)]" />
              <span className="font-mono text-base tracking-[0.16em] uppercase font-semibold text-[var(--color-fg-strong)]">
                WYWEB
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--color-fg-muted)] max-w-xs leading-relaxed">
              Agencia de diseño web, SaaS a medida y mantenimiento. Soluciones
              prácticas para autónomos, pymes y empresas.
            </p>

            <ul className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-fg-muted)]">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>España · 100% remoto</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:hola@wyweb.es"
                  className="hover:text-[var(--color-fg-strong)] transition-colors"
                >
                  hola@wyweb.es
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <a
                  href="tel:+34900000000"
                  className="hover:text-[var(--color-fg-strong)] transition-colors"
                >
                  +34 900 000 000
                </a>
              </li>
            </ul>
          </div>

          <nav
            className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8"
            aria-label="Pie de página"
          >
            {cols.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-muted)]">
                  {col.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => {
                    const external = link.href.startsWith('http');
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors"
                        >
                          {link.label}
                          {external && (
                            <ArrowUpRight
                              className="h-3 w-3"
                              strokeWidth={1.5}
                              aria-hidden
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Wordmark gigante */}
        <div className="mt-20 border-t border-[var(--color-border)] pt-8">
          <WordmarkWyweb />
        </div>

        {/* Legal bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">
            © {year} · Wyweb · CIF pendiente de configurar
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">
            Hecho en España
          </p>
        </div>
      </div>
    </footer>
  );
}
