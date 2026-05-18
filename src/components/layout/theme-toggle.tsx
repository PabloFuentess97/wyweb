'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Cambiar tema"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-fg-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
            className,
          )}
        >
          {!mounted ? (
            <Monitor className="h-4 w-4" strokeWidth={1.5} />
          ) : theme === 'dark' ? (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          ) : theme === 'light' ? (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Monitor className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4" strokeWidth={1.5} />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4" strokeWidth={1.5} />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4" strokeWidth={1.5} />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
