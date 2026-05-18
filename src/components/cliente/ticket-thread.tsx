import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  authorId: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
};

type Props = {
  messages: ReadonlyArray<Message>;
  /** ID del usuario actual para resaltar sus mensajes. */
  currentUserId: string;
};

function initials(name: string | null): string {
  if (!name) return 'UX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? 'UX').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function TicketThread({ messages, currentUserId }: Props) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((m, i) => {
        const isMine = m.authorId === currentUserId;
        const isStaff = m.authorRole === 'staff';
        return (
          <li key={m.id} className="flex gap-3">
            <Avatar size="sm" className="mt-0.5 shrink-0">
              <AvatarFallback
                className={cn(
                  isStaff
                    ? 'bg-[color-mix(in_oklab,var(--color-accent)_12%,var(--color-surface))] text-[var(--color-accent)] border border-[color-mix(in_oklab,var(--color-accent)_25%,transparent)]'
                    : '',
                )}
              >
                {initials(m.authorName)}
              </AvatarFallback>
            </Avatar>

            <article
              className={cn(
                'flex-1 min-w-0 rounded-[var(--radius-card)] border',
                isStaff
                  ? 'border-[color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-accent)_4%,var(--color-surface))]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]',
              )}
            >
              <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-fg-strong)]">
                    {m.authorName ?? 'Usuario'}
                    {isMine && (
                      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
                        TÚ
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-[0.08em] font-semibold px-1.5 py-0.5 rounded-[var(--radius-1)]',
                      isStaff
                        ? 'bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]'
                        : 'bg-[var(--color-bg)] text-[var(--color-fg-muted)] border border-[var(--color-border)]',
                    )}
                  >
                    {isStaff ? 'UXEA' : 'CLIENTE'}
                  </span>
                </div>
                <time
                  dateTime={m.createdAt.toISOString()}
                  className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]"
                >
                  {formatMessageDate(m.createdAt)}
                </time>
              </header>
              <div className="px-4 py-3">
                <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
                  {m.body}
                </p>
              </div>
              {i === 0 && messages.length > 1 && (
                <p className="px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
                  MENSAJE INICIAL
                </p>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function formatMessageDate(date: Date): string {
  const fmt = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return fmt.format(date).toUpperCase().replace(/\./g, '');
}
