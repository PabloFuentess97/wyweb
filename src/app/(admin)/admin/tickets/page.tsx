import type { Metadata } from 'next';
import { getAdminTicketsList } from '@/lib/db/queries/tickets-admin';
import { computeSlaState } from '@/lib/sla';
import { TicketsTable } from './tickets-table';

export const metadata: Metadata = {
  title: 'Tickets · Backoffice',
  robots: { index: false, follow: false },
};

export default async function TicketsAdminPage() {
  const data = await getAdminTicketsList();
  const open = data.filter((t) =>
    ['open', 'in_progress', 'waiting_customer'].includes(t.status),
  ).length;
  const breached = data.filter((t) => {
    const sla = computeSlaState(
      t.serviceSlaTier ?? 'none',
      t.slaDueAt,
      t.firstResponseAt,
    );
    return sla.state === 'breach';
  }).length;
  const atRisk = data.filter((t) => {
    const sla = computeSlaState(
      t.serviceSlaTier ?? 'none',
      t.slaDueAt,
      t.firstResponseAt,
    );
    return sla.state === 'risk';
  }).length;
  const unassigned = data.filter(
    (t) =>
      ['open', 'in_progress', 'waiting_customer'].includes(t.status) &&
      !t.assignedToUserId,
  ).length;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · TICKETS
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Tickets
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Cola de soporte con SLA. Asigna agente, gestiona prioridad y responde al
            cliente sin salir del backoffice.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Abiertos" value={String(open)} />
          <Stat label="Sin asignar" value={String(unassigned)} tone={unassigned > 0 ? 'warning' : 'default'} />
          <Stat label="SLA en riesgo" value={String(atRisk)} tone={atRisk > 0 ? 'warning' : 'default'} />
          <Stat label="SLA vencido" value={String(breached)} tone={breached > 0 ? 'danger' : 'default'} />
        </div>
      </header>

      <TicketsTable data={data} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'danger';
}) {
  return (
    <article
      className={`flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border bg-[var(--color-surface)] ${
        tone === 'danger'
          ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-danger)]'
          : tone === 'warning'
            ? 'border-[var(--color-border)] border-l-2 border-l-[var(--color-warning)]'
            : 'border-[var(--color-border)]'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}
