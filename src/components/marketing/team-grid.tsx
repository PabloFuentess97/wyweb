import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type TeamMember = {
  name: string;
  role: string;
  /** Iniciales para el avatar fallback. */
  initials: string;
  bio?: string;
  /** Departamento para badge: "INGENIERÍA", "OPERACIONES", etc. */
  area?: string;
};

type Props = {
  members: readonly TeamMember[];
  className?: string;
};

export function TeamGrid({ members, className }: Props) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-border)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border)]',
        className,
      )}
    >
      {members.map((m, i) => (
        <li
          key={m.name}
          className="flex flex-col gap-4 p-6 bg-[var(--color-surface)] min-h-[220px]"
        >
          <header className="flex items-start justify-between gap-3">
            <Avatar size="lg">
              <AvatarFallback className="text-sm">{m.initials}</AvatarFallback>
            </Avatar>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
              {String(i + 1).padStart(2, '0')}
            </span>
          </header>

          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-tight">
              {m.name}
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-accent)] font-semibold">
              {m.role}
            </p>
            {m.area && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] mt-1">
                {m.area}
              </p>
            )}
          </div>

          {m.bio && (
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed mt-auto">
              {m.bio}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
