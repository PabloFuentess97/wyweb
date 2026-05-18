'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
};

/**
 * Wrapper para el dropdown de acciones de fila. Pásale como children los
 * `<DropdownMenuItem>` que correspondan.
 */
export function RowActions({ children, ariaLabel = 'Acciones', className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-2)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
            className,
          )}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
