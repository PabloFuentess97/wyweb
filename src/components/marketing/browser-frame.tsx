import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  url?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function BrowserFrame({
  url = 'wyweb.com',
  title = 'Wyweb · Diseño y desarrollo web',
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-3)]',
        className,
      )}
      role="img"
      aria-label={`Vista previa: ${title}`}
    >
      <header className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1 max-w-md w-full">
            <Lock
              className="h-3 w-3 text-[var(--color-fg-subtle)] shrink-0"
              strokeWidth={1.5}
            />
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-fg-muted)] truncate">
              https://{url}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] hidden sm:inline">
          ●●●
        </span>
      </header>

      <div className="bg-[var(--color-surface)]">{children}</div>
    </div>
  );
}
