import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Building2,
  Clock,
  Lock,
  Mail,
  Server,
  Timer,
  User,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  getAdminTicketById,
  getStaffAgents,
} from '@/lib/db/queries/tickets-admin';
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  SLA_TIER_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { computeSlaState } from '@/lib/sla';
import { cn } from '@/lib/utils';
import { AdminControls } from './admin-controls';
import { AdminReplyForm } from './admin-reply-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminTicketById(id);
  if (!detail) return { title: 'Ticket · Backoffice' };
  return {
    title: `${detail.ticket.number} · ${detail.ticket.subject}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) return null;

  const { id } = await params;
  const [detail, agents] = await Promise.all([
    getAdminTicketById(id),
    getStaffAgents(),
  ]);
  if (!detail) notFound();

  const { ticket: t, messages } = detail;
  const sla = computeSlaState(
    t.serviceSlaTier ?? 'none',
    t.slaDueAt,
    t.firstResponseAt,
  );

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Tickets
      </Link>

      {/* HEADER */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] tnum">
            {t.number}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
            {t.subject}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
              {TICKET_STATUS_LABEL[t.status]}
            </Badge>
            <Badge variant={PRIORITY_BADGE[t.priority]}>
              {PRIORITY_LABEL[t.priority]}
            </Badge>
            <Link
              href={`/admin/clientes/${t.customerId}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2.5 py-1 transition-colors"
            >
              <Building2 className="h-3 w-3" strokeWidth={1.5} />
              {t.customerName}
            </Link>
            {t.serviceCode && t.serviceId && (
              <Link
                href={`/admin/servicios/${t.serviceId}`}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2.5 py-1 transition-colors"
              >
                <Server className="h-3 w-3" strokeWidth={1.5} />
                <span className="tnum">{t.serviceCode}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* SLA banner */}
      {sla.state !== 'none' && (
        <aside
          className={cn(
            'mb-6 flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3',
            sla.state === 'breach'
              ? 'border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))]'
              : sla.state === 'risk'
                ? 'border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))]'
                : 'border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))]',
          )}
          role="status"
        >
          <Timer
            className={cn(
              'h-5 w-5 shrink-0',
              sla.state === 'breach'
                ? 'text-[var(--color-danger)]'
                : sla.state === 'risk'
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-success)]',
            )}
            strokeWidth={1.5}
          />
          <div className="flex-1 flex items-baseline gap-3 flex-wrap">
            <span
              className={cn(
                'font-mono text-[11px] uppercase tracking-[0.12em] font-semibold',
                sla.state === 'breach'
                  ? 'text-[var(--color-danger)]'
                  : sla.state === 'risk'
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-success)]',
              )}
            >
              SLA {SLA_TIER_LABEL[sla.tier]} · {sla.label}
            </span>
            {sla.dueAt && (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                VENCE {formatDateTime(sla.dueAt)}
              </span>
            )}
          </div>
        </aside>
      )}

      {/* GRID: thread + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Thread */}
          <ul className="flex flex-col gap-4">
            {messages.map((m) => (
              <li key={m.id} className="flex gap-3">
                <Avatar size="sm" className="mt-0.5 shrink-0">
                  <AvatarFallback
                    className={cn(
                      m.authorRole === 'staff'
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
                    m.isInternalNote
                      ? 'border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_4%,var(--color-surface))]'
                      : m.authorRole === 'staff'
                        ? 'border-[color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-accent)_4%,var(--color-surface))]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                  )}
                >
                  <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[var(--color-fg-strong)]">
                        {m.authorName ?? 'Usuario'}
                      </span>
                      <span
                        className={cn(
                          'font-mono text-[10px] uppercase tracking-[0.08em] font-semibold px-1.5 py-0.5 rounded-[var(--radius-1)]',
                          m.authorRole === 'staff'
                            ? 'bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]'
                            : 'bg-[var(--color-bg)] text-[var(--color-fg-muted)] border border-[var(--color-border)]',
                        )}
                      >
                        {m.authorRole === 'staff' ? 'UXEA' : 'CLIENTE'}
                      </span>
                      {m.isInternalNote && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--color-warning)] bg-[color-mix(in_oklab,var(--color-warning)_12%,transparent)] px-1.5 py-0.5 rounded-[var(--radius-1)]">
                          <Lock className="h-2.5 w-2.5" strokeWidth={1.5} />
                          NOTA INTERNA
                        </span>
                      )}
                    </div>
                    <time
                      dateTime={m.createdAt.toISOString()}
                      className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]"
                    >
                      {formatDateTime(m.createdAt)}
                    </time>
                  </header>
                  <div className="px-4 py-3">
                    <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
                      {m.body}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <AdminReplyForm ticketId={t.id} disabled={t.status === 'closed'} />
        </section>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <Panel title="Acciones">
            <AdminControls
              ticketId={t.id}
              currentStatus={t.status}
              currentPriority={t.priority}
              currentAssignedToUserId={t.assignedToUserId}
              staffAgents={agents}
            />
          </Panel>

          <Panel title="Cliente">
            <Row icon={<Building2 strokeWidth={1.5} />} label="Empresa">
              <Link
                href={`/admin/clientes/${t.customerId}`}
                className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
              >
                {t.customerName}
              </Link>
            </Row>
            <Row icon={<User strokeWidth={1.5} />} label="Abrió">
              {t.openedByName}
            </Row>
            <Row icon={<Mail strokeWidth={1.5} />} label="Email">
              <a
                href={`mailto:${t.openedByEmail}`}
                className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] text-xs font-mono"
              >
                {t.openedByEmail}
              </a>
            </Row>
          </Panel>

          <Panel title="Tiempos">
            <Row icon={<Clock strokeWidth={1.5} />} label="Abierto">
              <span className="font-mono text-xs tnum">
                {formatDateTime(t.createdAt)}
              </span>
            </Row>
            {t.firstResponseAt && (
              <Row icon={<Timer strokeWidth={1.5} />} label="1ª respuesta">
                <span className="font-mono text-xs tnum">
                  {formatDateTime(t.firstResponseAt)}
                </span>
              </Row>
            )}
            {t.resolvedAt && (
              <Row icon={<Timer strokeWidth={1.5} />} label="Resuelto">
                <span className="font-mono text-xs tnum">
                  {formatDateTime(t.resolvedAt)}
                </span>
              </Row>
            )}
            {t.closedAt && (
              <Row icon={<Timer strokeWidth={1.5} />} label="Cerrado">
                <span className="font-mono text-xs tnum">
                  {formatDateTime(t.closedAt)}
                </span>
              </Row>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h3>
      </header>
      <div className="px-4 py-3 flex flex-col gap-3">{children}</div>
    </article>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)] [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
          {label}
        </span>
        <span className="text-sm text-[var(--color-fg)] truncate">{children}</span>
      </div>
    </div>
  );
}

function initials(name: string | null): string {
  if (!name) return 'UX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? 'UX').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
