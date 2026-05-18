'use client';

import Link from 'next/link';
import { ChevronsUpDown, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

type Props = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
  /** "card" muestra el bloque grande del fondo del sidebar; "compact" es el icono del topbar. */
  variant?: 'card' | 'compact';
  className?: string;
  /** Cuando el sidebar está colapsado mostramos solo avatar. */
  collapsed?: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  staff_admin: 'STAFF · ADMIN',
  staff_agent: 'STAFF · AGENTE',
  client_admin: 'CLIENTE · ADMIN',
  client_user: 'CLIENTE',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? 'UX').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function UserMenu({ user, variant = 'card', className, collapsed }: Props) {
  const { setTheme } = useTheme();
  const isStaff = user.role.startsWith('staff_');
  const profileHref = isStaff ? '/admin/perfil' : '/area-cliente/perfil';
  const settingsHref = isStaff ? '/admin/ajustes' : '/area-cliente/perfil';

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Abrir menú de usuario"
            className={cn(
              'inline-flex items-center justify-center rounded-[var(--radius-button)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
              className,
            )}
          >
            <Avatar size="sm">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <Content user={user} profileHref={profileHref} settingsHref={settingsHref} setTheme={setTheme} />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú de usuario"
          className={cn(
            'group flex w-full items-center gap-3 rounded-[var(--radius-3)] border border-transparent p-2 text-left transition-colors hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
            collapsed && 'justify-center px-0',
            className,
          )}
        >
          <Avatar size="sm">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-sm font-medium text-[var(--color-fg-strong)] truncate leading-tight">
                  {user.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] truncate">
                  {ROLE_LABELS[user.role] ?? user.role.toUpperCase()}
                </span>
              </div>
              <ChevronsUpDown
                className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
                strokeWidth={1.5}
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <Content
        user={user}
        profileHref={profileHref}
        settingsHref={settingsHref}
        setTheme={setTheme}
        side="top"
      />
    </DropdownMenu>
  );
}

function Content({
  user,
  profileHref,
  settingsHref,
  setTheme,
  side,
}: {
  user: Props['user'];
  profileHref: string;
  settingsHref: string;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  side?: 'top' | 'bottom';
}) {
  return (
    <DropdownMenuContent
      align="end"
      side={side ?? 'bottom'}
      className="min-w-[260px]"
    >
      <DropdownMenuLabel>Sesión activa</DropdownMenuLabel>
      <div className="px-2 pb-2">
        <p className="text-sm font-medium text-[var(--color-fg-strong)] truncate leading-tight">
          {user.name}
        </p>
        <p className="text-xs text-[var(--color-fg-muted)] truncate">{user.email}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] mt-1.5">
          {ROLE_LABELS[user.role] ?? user.role.toUpperCase()}
        </p>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={profileHref}>
          <User className="h-4 w-4" strokeWidth={1.5} />
          <span>Perfil</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={settingsHref}>
          <Settings className="h-4 w-4" strokeWidth={1.5} />
          <span>Ajustes</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Tema</DropdownMenuLabel>
      <DropdownMenuItem onSelect={() => setTheme('light')}>
        <Sun className="h-4 w-4" strokeWidth={1.5} />
        <span>Claro</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setTheme('dark')}>
        <Moon className="h-4 w-4" strokeWidth={1.5} />
        <span>Oscuro</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setTheme('system')}>
        <Settings className="h-4 w-4" strokeWidth={1.5} />
        <span>Sistema</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <form action={signOutAction}>
        <DropdownMenuItem asChild destructive>
          <button type="submit" className="w-full text-left">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            <span>Cerrar sesión</span>
          </button>
        </DropdownMenuItem>
      </form>
    </DropdownMenuContent>
  );
}
