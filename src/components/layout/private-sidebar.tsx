'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType, type SVGAttributes } from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Cog,
  FileSearch,
  FileText,
  FolderOpen,
  HeadphonesIcon,
  LayoutDashboard,
  PenSquare,
  Receipt,
  Server,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MarkerWyweb } from '@/components/icons/marker-wyweb';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils';

type IconType = ComponentType<SVGAttributes<SVGSVGElement> & { strokeWidth?: number }>;

type NavItem = {
  href: string;
  label: string;
  Icon: IconType;
  /** Roles que ven este item. Si no se define, todos. */
  roles?: ReadonlyArray<string>;
  /** Contador opcional (ej. tickets abiertos). */
  count?: number;
  /** Si el contador debe destacar (ej. SLA en riesgo). */
  countTone?: 'default' | 'warning' | 'danger';
};

type NavSection = {
  label?: string;
  items: ReadonlyArray<NavItem>;
};

const CLIENT_SECTIONS: ReadonlyArray<NavSection> = [
  {
    label: 'Workspace',
    items: [
      { href: '/area-cliente', label: 'Dashboard', Icon: LayoutDashboard },
      { href: '/area-cliente/servicios', label: 'Servicios', Icon: Server },
      { href: '/area-cliente/facturas', label: 'Facturas', Icon: Receipt },
      { href: '/area-cliente/tickets', label: 'Tickets', Icon: HeadphonesIcon },
      { href: '/area-cliente/documentos', label: 'Documentos', Icon: FolderOpen },
    ],
  },
  {
    label: 'Cuenta',
    items: [{ href: '/area-cliente/perfil', label: 'Perfil', Icon: UserCircle }],
  },
];

const STAFF_SECTIONS: ReadonlyArray<NavSection> = [
  {
    label: 'Workspace',
    items: [
      { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
      { href: '/admin/clientes', label: 'Clientes', Icon: Briefcase },
      { href: '/admin/servicios', label: 'Servicios', Icon: Server },
      { href: '/admin/facturas', label: 'Facturas', Icon: Receipt },
      { href: '/admin/tickets', label: 'Tickets', Icon: HeadphonesIcon },
      { href: '/admin/leads', label: 'Leads', Icon: Sparkles },
      { href: '/admin/documentos', label: 'Documentos', Icon: FolderOpen },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      {
        href: '/admin/contenido',
        label: 'Contenido',
        Icon: PenSquare,
        roles: ['staff_admin'],
      },
      {
        href: '/admin/usuarios',
        label: 'Usuarios',
        Icon: Users,
        roles: ['staff_admin'],
      },
      {
        href: '/admin/auditoria',
        label: 'Auditoría',
        Icon: FileSearch,
        roles: ['staff_admin'],
      },
      {
        href: '/admin/ajustes',
        label: 'Ajustes',
        Icon: Cog,
        roles: ['staff_admin'],
      },
    ],
  },
];

export type SidebarCounters = Record<string, { count: number; tone?: 'default' | 'warning' | 'danger' }>;

type Props = {
  variant: 'client' | 'staff';
  user: { name: string; email: string; image?: string | null; role: string };
  counters?: SidebarCounters;
  /** Si el sidebar debe abrirse como drawer (mobile). */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

export function PrivateSidebar({
  variant,
  user,
  counters,
  mobileOpen,
  onMobileOpenChange,
}: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uxea-sidebar-collapsed');
    if (stored === '1') setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('uxea-sidebar-collapsed', next ? '1' : '0');
  };

  const sections = variant === 'staff' ? STAFF_SECTIONS : CLIENT_SECTIONS;
  const visibleSections = sections
    .map((s) => ({
      ...s,
      items: s.items.filter((it) => !it.roles || it.roles.includes(user.role)),
    }))
    .filter((s) => s.items.length > 0);

  const isActive = (href: string) => {
    const isHomeLink =
      href === '/area-cliente' || href === '/admin' || href === '/admin/perfil';
    return isHomeLink ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarBody = (
    <>
      {/* Header con logo */}
      <header
        className={cn(
          'flex items-center gap-2 h-14 border-b border-[var(--color-border)] shrink-0',
          collapsed ? 'justify-center px-2' : 'px-4',
        )}
      >
        <Link
          href={variant === 'staff' ? '/admin' : '/area-cliente'}
          className="flex items-center gap-2 -m-1 p-1 rounded-[var(--radius-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
        >
          <MarkerWyweb className="h-5 w-5 text-[var(--color-accent)] shrink-0" />
          {!collapsed && (
            <div className="flex flex-col gap-0 min-w-0">
              <span className="font-mono text-[12px] tracking-[0.16em] uppercase font-semibold text-[var(--color-fg-strong)] leading-none">
                WYWEB
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] leading-none mt-0.5">
                {variant === 'staff' ? 'BACKOFFICE' : 'ÁREA CLIENTE'}
              </span>
            </div>
          )}
        </Link>
      </header>

      {/* Nav */}
      <nav
        className={cn(
          'flex-1 overflow-y-auto py-4',
          collapsed ? 'px-2' : 'px-3',
        )}
        aria-label="Navegación principal"
      >
        {visibleSections.map((section, i) => (
          <div key={i} className={i > 0 ? 'mt-6' : ''}>
            {section.label && !collapsed && (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold px-3 mb-2">
                {section.label}
              </p>
            )}
            {section.label && collapsed && i > 0 && (
              <div className="h-px bg-[var(--color-border)] mx-2 mb-2" />
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const counter = counters?.[item.href];
                return (
                  <li key={item.href}>
                    <NavLinkInner
                      href={item.href}
                      label={item.label}
                      Icon={item.Icon}
                      active={active}
                      collapsed={collapsed}
                      count={counter?.count}
                      tone={counter?.tone}
                      onNavigate={() => onMobileOpenChange?.(false)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: collapse toggle + user */}
      <footer className="border-t border-[var(--color-border)] shrink-0 p-2 flex flex-col gap-1">
        {mounted && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'hidden lg:inline-flex items-center justify-center h-8 rounded-[var(--radius-2)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)] transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
              collapsed ? 'w-full' : 'self-end px-2 gap-1.5',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <>
                <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] font-semibold">
                  COLAPSAR
                </span>
              </>
            )}
          </button>
        )}
        <UserMenu user={user} variant="card" collapsed={collapsed} />
      </footer>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-40 transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {sidebarBody}
      </aside>

      {/* Mobile drawer (controlled from topbar) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-[color-mix(in_oklab,var(--color-fg-strong)_45%,transparent)] backdrop-blur-sm"
          onClick={() => onMobileOpenChange?.(false)}
          aria-hidden
        >
          <aside
            className="flex flex-col absolute inset-y-0 left-0 w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-[var(--shadow-3)] data-[open=true]:animate-in slide-in-from-left"
            data-open
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* Spacer for desktop layout: occupies sidebar width */}
      <div
        aria-hidden
        className={cn(
          'hidden lg:block shrink-0 transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      />
    </>
  );
}

function NavLinkInner({
  href,
  label,
  Icon,
  active,
  collapsed,
  count,
  tone,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: IconType;
  active: boolean;
  collapsed: boolean;
  count?: number;
  tone?: 'default' | 'warning' | 'danger';
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[var(--radius-2)] text-sm transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
        collapsed ? 'h-9 w-12 justify-center mx-auto' : 'h-9 px-3',
        active
          ? 'bg-[var(--color-bg-subtle)] text-[var(--color-fg-strong)] font-medium'
          : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)]',
      )}
    >
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--color-accent)]"
          aria-hidden
        />
      )}
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate leading-none">{label}</span>
          {count !== undefined && count > 0 && <CountBadge count={count} tone={tone} />}
        </>
      )}
      {collapsed && count !== undefined && count > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[var(--color-surface)]',
            tone === 'danger'
              ? 'bg-[var(--color-danger)]'
              : tone === 'warning'
                ? 'bg-[var(--color-warning)]'
                : 'bg-[var(--color-accent)]',
          )}
          aria-hidden
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

function CountBadge({
  count,
  tone = 'default',
}: {
  count: number;
  tone?: 'default' | 'warning' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 font-mono text-[10px] font-semibold rounded-[var(--radius-full)] tnum',
        tone === 'danger' &&
          'bg-[color-mix(in_oklab,var(--color-danger)_12%,var(--color-surface))] text-[var(--color-danger)] border border-[color-mix(in_oklab,var(--color-danger)_30%,transparent)]',
        tone === 'warning' &&
          'bg-[color-mix(in_oklab,var(--color-warning)_12%,var(--color-surface))] text-[var(--color-warning)] border border-[color-mix(in_oklab,var(--color-warning)_30%,transparent)]',
        (!tone || tone === 'default') &&
          'bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] border border-[var(--color-border)]',
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Re-exports para usar el icon set en otras partes
export { Activity, AlertCircle, ClipboardList, FileText, ShieldCheck };
