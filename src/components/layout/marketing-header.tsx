'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import {
  ChevronDown,
  Code2,
  LayoutDashboard,
  Menu,
  Palette,
  Search,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MarkerWyweb } from '@/components/icons/marker-wyweb';
import { cn } from '@/lib/utils';

const services = [
  {
    href: '/servicios/diseno-web',
    title: 'Diseño web a medida',
    description: 'Webs corporativas y landings que convierten',
    Icon: LayoutDashboard,
  },
  {
    href: '/servicios/saas',
    title: 'SaaS y aplicaciones',
    description: 'Plataformas internas y productos a medida',
    Icon: Code2,
  },
  {
    href: '/servicios/ecommerce',
    title: 'Ecommerce',
    description: 'Tiendas online con pasarela y logística',
    Icon: ShoppingBag,
  },
  {
    href: '/servicios/seo',
    title: 'SEO y rendimiento',
    description: 'Posicionamiento técnico y Core Web Vitals',
    Icon: Search,
  },
  {
    href: '/servicios/mantenimiento',
    title: 'Mantenimiento',
    description: 'Soporte, hosting gestionado y mejoras continuas',
    Icon: Wrench,
  },
  {
    href: '/servicios/branding',
    title: 'Branding e identidad',
    description: 'Logotipo, sistema visual y guidelines',
    Icon: Palette,
  },
] as const;

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-[background-color,backdrop-filter,border-color] duration-200',
          scrolled
            ? 'bg-[color-mix(in_oklab,var(--color-bg)_82%,transparent)] backdrop-blur-md border-b border-[var(--color-border)]'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="mx-auto max-w-[var(--container-2xl)] px-[var(--container-padding)] h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 -m-1 p-1 rounded-[var(--radius-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
          >
            <MarkerWyweb className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="font-mono text-sm tracking-[0.16em] uppercase font-semibold text-[var(--color-fg-strong)]">
              WYWEB
            </span>
          </Link>

          <NavigationMenu.Root
            className="relative hidden lg:flex"
            delayDuration={150}
          >
            <NavigationMenu.List className="flex items-center gap-1">
              <NavItem href="/grupo">Agencia</NavItem>

              <NavigationMenu.Item>
                <NavigationMenu.Trigger className={navTriggerClass}>
                  Servicios
                  <ChevronDown
                    className="h-3.5 w-3.5 ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="data-[motion=from-start]:animate-in data-[motion=to-start]:animate-out data-[motion=from-end]:animate-in data-[motion=to-end]:animate-out data-[motion=from-end]:slide-in-from-right-1 data-[motion=from-start]:slide-in-from-left-1 data-[motion=to-end]:slide-out-to-right-1 data-[motion=to-start]:slide-out-to-left-1 absolute left-0 top-0 w-full sm:w-auto">
                  <ul className="grid w-[640px] grid-cols-2 gap-1 p-3">
                    {services.map((s) => (
                      <li key={s.href}>
                        <NavigationMenu.Link asChild>
                          <Link
                            href={s.href}
                            className="group/item flex gap-3 rounded-[var(--radius-3)] p-3 transition-colors hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] group-hover/item:text-[var(--color-accent)]">
                              <s.Icon
                                className="h-4 w-4"
                                strokeWidth={1.5}
                              />
                            </span>
                            <span className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-[var(--color-fg-strong)] leading-tight">
                                {s.title}
                              </span>
                              <span className="text-xs text-[var(--color-fg-muted)] leading-snug">
                                {s.description}
                              </span>
                            </span>
                          </Link>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              <NavItem href="/blog">Blog</NavItem>
              <NavItem href="/contacto">Contacto</NavItem>
            </NavigationMenu.List>

            <div className="absolute left-0 top-full flex w-full justify-start">
              <NavigationMenu.Viewport className="origin-top-left mt-2 relative w-full sm:w-[var(--radix-navigation-menu-viewport-width)] h-[var(--radix-navigation-menu-viewport-height)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-3)] transition-[width,height] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" />
            </div>
          </NavigationMenu.Root>

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Button
              variant="accent"
              size="sm"
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/contacto">Solicitar propuesta</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-3)] text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        services={services}
      />
    </>
  );
}

const navTriggerClass =
  'group inline-flex items-center h-9 px-3 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] data-[state=open]:text-[var(--color-fg-strong)] rounded-[var(--radius-2)] transition-colors duration-150 focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]';

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link
          href={href}
          className="inline-flex items-center h-9 px-3 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] rounded-[var(--radius-2)] transition-colors duration-150 focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
        >
          {children}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}
