import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAdminLeadById } from '@/lib/db/queries/leads-admin';
import { getStaffAgents } from '@/lib/db/queries/tickets-admin';
import { LEAD_STATUS_BADGE, LEAD_STATUS_LABEL } from '@/lib/ui-variants';
import { LeadControls } from './lead-controls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminLeadById(id);
  if (!detail) return { title: 'Lead · Backoffice' };
  return {
    title: `Lead · ${detail.lead.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) return null;

  const { id } = await params;
  const [detail, agents] = await Promise.all([
    getAdminLeadById(id),
    getStaffAgents(),
  ]);
  if (!detail) notFound();

  const { lead } = detail;
  const isConverted = lead.status === 'converted' && lead.convertedToCustomerId;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Leads
      </Link>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · LEAD
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
            {lead.name}
          </h1>
          {lead.company && (
            <p className="text-sm text-[var(--color-fg-muted)]">
              {lead.company}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={LEAD_STATUS_BADGE[lead.status]} dot>
              {LEAD_STATUS_LABEL[lead.status]}
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] tnum">
              RECIBIDO {formatDateTime(lead.createdAt)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5">
              {lead.source}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          {!isConverted ? (
            <Button asChild variant="accent" size="md">
              <Link href={`/admin/clientes/nuevo?fromLead=${lead.id}`}>
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Convertir a cliente
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="md">
              <Link href={`/admin/clientes/${lead.convertedToCustomerId}`}>
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
                Ver cliente
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Aviso convertido */}
      {isConverted && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <CheckCircle2
            className="h-5 w-5 text-[var(--color-success)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-success)]">
              CONVERTIDO A CLIENTE
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Este lead ya está vinculado al cliente{' '}
              <Link
                href={`/admin/clientes/${lead.convertedToCustomerId}`}
                className="text-[var(--color-accent)] underline-offset-4 hover:underline font-medium"
              >
                {lead.convertedToCustomerName ?? 'cliente'}
              </Link>
              .
            </p>
          </div>
        </aside>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Mensaje */}
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Mensaje original
              </h2>
            </header>
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
                {lead.message}
              </p>
            </div>
          </article>

          {/* Datos de contacto */}
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Datos de contacto
              </h2>
            </header>
            <dl className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <DataRow label="Nombre">{lead.name}</DataRow>
              <DataRow label="Empresa">
                {lead.company ?? <Empty />}
              </DataRow>
              <DataRow label="Email" icon={<Mail strokeWidth={1.5} />}>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
                >
                  {lead.email}
                </a>
              </DataRow>
              <DataRow label="Teléfono" icon={<Phone strokeWidth={1.5} />}>
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                    className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <Empty />
                )}
              </DataRow>
            </dl>
          </article>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Tu consulta a Wyweb`)}`}
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                Responder por email
              </a>
            </Button>
            {lead.phone && (
              <Button asChild variant="secondary" size="sm">
                <a href={`tel:${lead.phone.replace(/\s+/g, '')}`}>
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Llamar
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <header className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Gestión
              </h3>
            </header>
            <div className="px-4 py-3">
              <LeadControls
                leadId={lead.id}
                currentStatus={lead.status}
                currentAssignedToUserId={lead.assignedToUserId}
                currentNotes={lead.notes ?? ''}
                hasConvertedCustomer={!!lead.convertedToCustomerId}
                staffAgents={agents}
              />
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <header className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Auditoría
              </h3>
            </header>
            <dl className="px-4 py-3 flex flex-col gap-2.5">
              <DataRow label="Recibido" icon={<Clock strokeWidth={1.5} />}>
                <span className="font-mono text-xs tnum">
                  {formatDateTime(lead.createdAt)}
                </span>
              </DataRow>
              <DataRow label="Origen">
                <span className="font-mono text-xs">{lead.source}</span>
              </DataRow>
              {lead.ip && (
                <DataRow label="IP">
                  <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                    {lead.ip}
                  </span>
                </DataRow>
              )}
              <DataRow label="ID">
                <Link
                  href="#"
                  className="font-mono text-[10px] tnum text-[var(--color-fg-muted)] truncate inline-flex items-center gap-1"
                >
                  {lead.id.slice(0, 8)}…
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </DataRow>
            </dl>
          </article>
        </aside>
      </div>
    </div>
  );
}

function DataRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold inline-flex items-center gap-1">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3 inline-flex items-center text-[var(--color-fg-subtle)]">
            {icon}
          </span>
        )}
        {label}
      </dt>
      <dd className="text-sm text-[var(--color-fg)] truncate">{children}</dd>
    </div>
  );
}

function Empty() {
  return <span className="text-[var(--color-fg-subtle)]">—</span>;
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
