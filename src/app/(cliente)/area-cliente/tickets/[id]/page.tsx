import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Server, User, UserCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { TicketThread } from '@/components/cliente/ticket-thread';
import { getTicketForClient } from '@/lib/db/queries/tickets';
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  SLA_TIER_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { ReplyForm } from './reply-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return { title: 'Ticket' };
  const t = await getTicketForClient(id, session.user.customerIds);
  if (!t) return { title: 'Ticket' };
  return {
    title: `${t.number} · ${t.subject}`,
    robots: { index: false, follow: false },
  };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const t = await getTicketForClient(id, session.user.customerIds);
  if (!t) notFound();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      {/* Volver */}
      <Link
        href="/area-cliente/tickets"
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
            {TICKET_STATUS_LABEL[t.status]}
          </Badge>
          <Badge variant={PRIORITY_BADGE[t.priority]}>
            {PRIORITY_LABEL[t.priority]}
          </Badge>
          {t.serviceCode && (
            <Link
              href={`/area-cliente/servicios/${t.serviceId}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2.5 py-1 transition-colors"
            >
              <Server className="h-3 w-3" strokeWidth={1.5} />
              <span className="tnum">{t.serviceCode}</span>
              {t.serviceName && (
                <span className="hidden sm:inline normal-case tracking-normal text-xs">
                  · {t.serviceName}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN: thread + reply */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <TicketThread messages={t.messages} currentUserId={session.user.id} />

          <ReplyForm ticketId={t.id} disabled={t.status === 'closed'} />
        </section>

        {/* ASIDE: meta */}
        <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <MetaCard title="Detalles">
            <MetaRow icon={<Calendar />} label="Abierto">
              <span className="font-mono text-xs tnum">
                {formatDate(t.createdAt)}
              </span>
            </MetaRow>
            {t.firstResponseAt && (
              <MetaRow icon={<UserCheck />} label="1ª respuesta">
                <span className="font-mono text-xs tnum">
                  {formatDate(t.firstResponseAt)}
                </span>
              </MetaRow>
            )}
            <MetaRow icon={<User />} label="Abierto por">
              {t.openedByName}
            </MetaRow>
            <MetaRow icon={<UserCheck />} label="Asignado">
              {t.assignedToName ?? (
                <span className="text-[var(--color-fg-subtle)]">Sin asignar</span>
              )}
            </MetaRow>
            {t.serviceSlaTier && t.serviceSlaTier !== 'none' && (
              <MetaRow icon={<Server />} label="SLA">
                {SLA_TIER_LABEL[t.serviceSlaTier]}
              </MetaRow>
            )}
          </MetaCard>

          {t.status === 'resolved' && (
            <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-success)] mb-1">
                MARCADO COMO RESUELTO
              </p>
              <p className="text-sm text-[var(--color-fg)] leading-relaxed">
                Si el problema continúa, escribe una nueva respuesta y reabriremos el
                ticket automáticamente.
              </p>
            </div>
          )}

          {t.status === 'closed' && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)] mb-1">
                TICKET CERRADO
              </p>
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                Este ticket no admite más respuestas. Si tienes una nueva consulta,{' '}
                <Link
                  href="/area-cliente/tickets/nuevo"
                  className="text-[var(--color-accent)] underline-offset-4 hover:underline"
                >
                  ábrelo aquí
                </Link>
                .
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MetaCard({
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
      <dl className="px-4 py-3 flex flex-col gap-3">{children}</dl>
    </article>
  );
}

function MetaRow({
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
        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
          {label}
        </dt>
        <dd className="text-sm text-[var(--color-fg)]">{children}</dd>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}
