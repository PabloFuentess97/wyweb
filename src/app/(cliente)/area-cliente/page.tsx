import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AlertTriangle,
  HeadphonesIcon,
  Info,
  Receipt,
  Server,
  TrendingUp,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { KpiCard } from '@/components/cliente/kpi-card';
import { ActivityFeed } from '@/components/cliente/activity-feed';
import { QuickActions } from '@/components/cliente/quick-actions';
import { Button } from '@/components/ui/button';
import { getClientDashboardData } from '@/lib/db/queries/dashboard';
import { formatEuros } from '@/lib/utils';
import { INVOICE_STATUS_LABEL } from '@/lib/ui-variants';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function AreaClienteDashboard() {
  const session = await auth();
  if (!session?.user) return null; // protegido por layout/proxy
  const firstName = session.user.name.split(' ')[0] ?? 'cliente';

  const data = await getClientDashboardData(session.user.customerIds);
  const { counts, lastInvoice, recentTickets, recentInvoices } = data;
  const hasCustomer = session.user.customerIds.length > 0;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA CLIENTE · DASHBOARD
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Hola, {firstName}.
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Resumen de tu cuenta a {formatNow()}. Pulsa cualquier KPI para ver el detalle.
        </p>
      </header>

      {/* Aviso si el user no está vinculado a ningún customer todavía */}
      {!hasCustomer && (
        <aside
          className="mb-8 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <Info
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              CUENTA SIN ASOCIAR
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Tu cuenta de usuario aún no está vinculada a un cliente. Contacta con
              soporte en{' '}
              <a
                href="mailto:hola@wyweb.net"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                hola@wyweb.net
              </a>{' '}
              para que activen tu acceso.
            </p>
          </div>
        </aside>
      )}

      {/* Aviso si hay facturas vencidas */}
      {counts.overdueInvoices > 0 && (
        <aside
          className="mb-8 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <AlertTriangle
            className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-danger)]">
              FACTURAS VENCIDAS · {counts.overdueInvoices}
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Tienes {counts.overdueInvoices === 1 ? 'una factura vencida' : `${counts.overdueInvoices} facturas vencidas`}.
              Revísalas para evitar interrupción del servicio.
            </p>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/area-cliente/facturas?estado=overdue">Ver vencidas</Link>
          </Button>
        </aside>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Link
          href="/area-cliente/servicios"
          className="rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] hover:opacity-90 transition-opacity"
        >
          <KpiCard
            label="Servicios activos"
            value={counts.activeServices}
            icon={<Server />}
            variant={counts.activeServices > 0 ? 'accent' : 'default'}
          />
        </Link>
        <Link
          href="/area-cliente/facturas?estado=issued"
          className="rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] hover:opacity-90 transition-opacity"
        >
          <KpiCard
            label="Facturas pendientes"
            value={counts.pendingInvoices}
            icon={<Receipt />}
            variant={counts.overdueInvoices > 0 ? 'danger' : 'default'}
            hint={
              counts.overdueInvoices > 0
                ? `${counts.overdueInvoices} VENCIDA${counts.overdueInvoices === 1 ? '' : 'S'}`
                : undefined
            }
          />
        </Link>
        <Link
          href="/area-cliente/tickets"
          className="rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] hover:opacity-90 transition-opacity"
        >
          <KpiCard
            label="Tickets abiertos"
            value={counts.openTickets}
            icon={<HeadphonesIcon />}
            variant={counts.openTickets > 0 ? 'warning' : 'default'}
          />
        </Link>
        {lastInvoice ? (
          <Link
            href={`/area-cliente/facturas/${lastInvoice.id}`}
            className="rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] hover:opacity-90 transition-opacity"
          >
            <KpiCard
              label="Última factura"
              value={formatEuros(lastInvoice.totalCents)}
              icon={<TrendingUp />}
              hint={`${INVOICE_STATUS_LABEL[lastInvoice.status].toUpperCase()} · ${
                lastInvoice.issuedAt
                  ? new Intl.DateTimeFormat('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })
                      .format(lastInvoice.issuedAt)
                      .toUpperCase()
                      .replace('.', '')
                  : '—'
              }`}
            />
          </Link>
        ) : (
          <KpiCard
            label="Última factura"
            value="—"
            icon={<TrendingUp />}
            hint="SIN FACTURAS"
          />
        )}
      </section>

      {/* Actividad reciente + accesos rápidos */}
      <div className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)] mb-3">
            Actividad reciente
          </h2>
          <ActivityFeed tickets={recentTickets} invoices={recentInvoices} />
        </div>

        <div className="xl:col-span-1">
          <QuickActions />
        </div>
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
