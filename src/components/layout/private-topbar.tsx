'use client';

import { Bell, Menu, Search } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenu } from '@/components/layout/user-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  user: { name: string; email: string; image?: string | null; role: string };
  breadcrumbs: ReadonlyArray<Crumb>;
  onMobileMenuClick: () => void;
  /** Numero de notificaciones sin leer (placeholder F2). */
  notificationCount?: number;
};

export function PrivateTopbar({
  user,
  breadcrumbs,
  onMobileMenuClick,
  notificationCount = 0,
}: Props) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-[color-mix(in_oklab,var(--color-bg)_85%,transparent)] backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: hamburger (mobile) + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMobileMenuClick}
            aria-label="Abrir menú"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 sm:gap-2">
                    <BreadcrumbItem className={i > 0 ? 'hidden sm:inline-flex' : ''}>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage className="truncate max-w-[200px] md:max-w-[420px]">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="hidden sm:flex" />
                    )}
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: search, notifications, theme, user */}
        <div className="flex items-center gap-1 md:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Buscar (Cmd+K)"
                disabled
                className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="text-xs">Buscar</span>
                <kbd className="hidden xl:inline-flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--color-fg-subtle)] border border-[var(--color-border)] rounded-[var(--radius-1)] px-1 py-0.5 ml-1">
                  ⌘K
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent>Búsqueda global · F3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Notificaciones"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
              >
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                {notificationCount > 0 && (
                  <span
                    className={cn(
                      'absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 font-mono text-[9px] font-semibold rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] tnum',
                    )}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Notificaciones</TooltipContent>
          </Tooltip>

          <ThemeToggle />

          <div className="lg:hidden">
            <UserMenu user={user} variant="compact" />
          </div>
        </div>
      </div>
    </header>
  );
}
