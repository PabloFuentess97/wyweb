import type { Metadata } from 'next';
import {
  AlertTriangle,
  Briefcase,
  HeadphonesIcon,
  Receipt,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { KpiCard } from '@/components/cliente/kpi-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { TicketsChart } from '@/components/admin/tickets-chart';
import { AdminActivityFeed } from '@/components/admin/activity-feed';
import { getAdminDashboardData } from '@/lib/db/queries/admin-dashboard';
import { formatEuros } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Backoffice · Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const session = await auth();
  const firstName = session?.user.name?.split(' ')[0] ?? 'staff';

  const data = await getAdminDashboardData();
  const { kpis, revenue12m, ticketsTimeline12m, recent } = data;

  // Last 12 months total revenue
  const totalRevenue12m = revenue12m.reduce((acc, r) => acc + r.totalCents, 0);
  const lastMonthRevenue = revenue12m[revenue12m.length - 1]?.totalCents ?? 0;
  const prevMonthRevenue = revenue12m[revenue12m.length - 2]?.totalCents ?? 0;
  const monthOverMonth =
    prevMonthRevenue > 0
      ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : null;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · DASHBOARD
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Hola, {firstName}.
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Vista general de la operación a {formatNow()}.
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-8">
        <KpiCard
          label="Clientes activos"
          value={kpis.activeCustomers}
          icon={<Briefcase />}
          variant={kpis.activeCustomers > 0 ? 'accent' : 'default'}
        />
        <KpiCard
          label="MRR"
          value={
            kpis.mrrCents === 0
              ? '—'
              : formatEuros(kpis.mrrCents)
          }
          icon={<Receipt />}
          hint={
            kpis.mrrCents > 0
              ? `${formatEuros(kpis.mrrCents * 12)} ARR`
              : undefined
          }
          variant={kpis.mrrCents > 0 ? 'default' : 'default'}
        />
        <KpiCard
          label="Tickets abiertos"
          value={kpis.openTickets}
          icon={<HeadphonesIcon />}
          variant={kpis.openTickets > 5 ? 'warning' : 'default'}
        />
        <KpiCard
          label="Leads sin atender"
          value={kpis.newLeads}
          icon={<Sparkles />}
          variant={kpis.newLeads > 0 ? 'accent' : 'default'}
        />
        <KpiCard
          label="SLA en riesgo"
          value={kpis.slaAtRisk}
          icon={<AlertTriangle />}
          variant={kpis.slaAtRisk > 0 ? 'danger' : 'default'}
          hint={kpis.slaAtRisk > 0 ? '< 24H VENCIMIENTO' : 'TODOS EN PLAZO'}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <header className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                Facturación · 12 meses
              </h2>
              <TrendingUp
                className="h-3 w-3 text-[var(--color-fg-muted)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm tnum font-semibold text-[var(--color-fg-strong)]">
                {totalRevenue12m === 0 ? '—' : formatEuros(totalRevenue12m)}
              </span>
              {monthOverMonth !== null && (
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.08em] tnum ${
                    monthOverMonth >= 0
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-danger)]'
                  }`}
                >
                  {monthOverMonth >= 0 ? '+' : ''}
                  {monthOverMonth.toFixed(1)}% MoM
                </span>
              )}
            </div>
          </header>
          <div className="p-4">
            {totalRevenue12m === 0 ? (
              <ChartEmpty title="Sin facturación en los últimos 12 meses" />
            ) : (
              <RevenueChart data={revenue12m} />
            )}
          </div>
        </article>

        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <header className="flex items-baseline justify-between gap-2 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
              Tickets · creados vs resueltos
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
              ÚLTIMOS 12 MESES
            </span>
          </header>
          <div className="p-4">
            {ticketsTimeline12m.every((d) => d.created === 0 && d.resolved === 0) ? (
              <ChartEmpty title="Sin tickets en los últimos 12 meses" />
            ) : (
              <TicketsChart data={ticketsTimeline12m} />
            )}
          </div>
        </article>
      </section>

      {/* Activity Feed */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)] mb-3">
          Actividad reciente
        </h2>
        <AdminActivityFeed recent={recent} />
      </section>
    </div>
  );
}

function ChartEmpty({ title }: { title: string }) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-1">
          SIN DATOS
        </p>
        <p className="text-sm text-[var(--color-fg-muted)]">{title}</p>
      </div>
    </div>
  );
}

function formatNow(): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
