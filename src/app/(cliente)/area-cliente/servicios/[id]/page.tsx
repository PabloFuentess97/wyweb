import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Activity,
  Code2,
  Download,
  ExternalLink,
  FileText,
  HeadphonesIcon,
  LayoutDashboard,
  Palette,
  Receipt,
  Search,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServiceForClient } from '@/lib/db/queries/services';
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  SERVICE_CATEGORY_LABEL,
  SERVICE_STATUS_BADGE,
  SERVICE_STATUS_LABEL,
  SLA_TIER_LABEL,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABEL,
} from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';

const CATEGORY_ICONS = {
  'web-design': LayoutDashboard,
  saas: Code2,
  ecommerce: ShoppingBag,
  seo: Search,
  maintenance: Wrench,
  branding: Palette,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return { title: 'Servicio' };
  const detail = await getServiceForClient(id, session.user.customerIds);
  if (!detail) return { title: 'Servicio' };
  return {
    title: `${detail.service.code} · ${detail.service.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const detail = await getServiceForClient(id, session.user.customerIds);
  if (!detail) notFound();

  const { service, relatedTickets, relatedInvoices, relatedDocuments } = detail;
  const Icon = CATEGORY_ICONS[service.category];

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      {/* Volver */}
      <Link
        href="/area-cliente/servicios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Servicios
      </Link>

      {/* HEADER */}
      <header className="flex flex-col gap-5 mb-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-strong)] shrink-0">
            <Icon className="h-6 w-6" />
          </span>
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] tnum">
              {service.code}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
              {service.name}
            </h1>
            {service.description && (
              <p className="text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-3xl">
                {service.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={SERVICE_STATUS_BADGE[service.status]} dot>
            {SERVICE_STATUS_LABEL[service.status]}
          </Badge>
          <Badge variant="outline">{SERVICE_CATEGORY_LABEL[service.category]}</Badge>
          {service.slaTier !== 'none' && (
            <Badge variant="accent">SLA {SLA_TIER_LABEL[service.slaTier]}</Badge>
          )}
        </div>
      </header>

      {/* TABS */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="metrics">
            <span className="hidden sm:inline">Métricas</span>
            <span className="sm:hidden">M</span>
          </TabsTrigger>
          <TabsTrigger value="documents">
            <span className="hidden sm:inline">Documentos</span>
            <span className="sm:hidden">D</span>
            {relatedDocuments.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {relatedDocuments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <span className="hidden sm:inline">Tickets</span>
            <span className="sm:hidden">T</span>
            {relatedTickets.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {relatedTickets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <span className="hidden sm:inline">Facturas</span>
            <span className="sm:hidden">F</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB · INFO */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DataCard title="Datos del servicio">
              <DataRow label="Código">
                <span className="font-mono tnum">{service.code}</span>
              </DataRow>
              <DataRow label="Nombre">{service.name}</DataRow>
              <DataRow label="Categoría">
                {SERVICE_CATEGORY_LABEL[service.category]}
              </DataRow>
              <DataRow label="Estado">
                <Badge variant={SERVICE_STATUS_BADGE[service.status]} dot>
                  {SERVICE_STATUS_LABEL[service.status]}
                </Badge>
              </DataRow>
              <DataRow label="SLA">{SLA_TIER_LABEL[service.slaTier]}</DataRow>
              <DataRow label="Cliente">{service.customerName}</DataRow>
            </DataCard>

            <DataCard title="Facturación y vigencia">
              <DataRow label="Cuota mensual">
                {service.monthlyFeeCents !== null ? (
                  <span className="font-mono tnum font-semibold text-[var(--color-fg-strong)]">
                    {formatEuros(service.monthlyFeeCents)}
                    <span className="text-[var(--color-fg-muted)] font-normal ml-0.5">
                      /mes
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--color-fg-subtle)]">No aplica</span>
                )}
              </DataRow>
              <DataRow label="Inicio">
                {service.startedAt ? (
                  <span className="font-mono tnum">
                    {formatDate(service.startedAt)}
                  </span>
                ) : (
                  <span className="text-[var(--color-fg-subtle)]">—</span>
                )}
              </DataRow>
              <DataRow label="Fin">
                {service.endedAt ? (
                  <span className="font-mono tnum">{formatDate(service.endedAt)}</span>
                ) : (
                  <span className="text-[var(--color-fg-subtle)]">Sin fecha</span>
                )}
              </DataRow>
              <DataRow label="Antigüedad">
                {service.startedAt ? (
                  <span>{computeAge(service.startedAt)}</span>
                ) : (
                  <span className="text-[var(--color-fg-subtle)]">—</span>
                )}
              </DataRow>
            </DataCard>

            {Object.keys(service.metadata).length > 0 && (
              <DataCard title="Metadatos técnicos" className="md:col-span-2">
                <pre className="font-mono text-xs bg-[var(--color-bg-subtle)] rounded-[var(--radius-2)] p-3 overflow-x-auto text-[var(--color-fg)]">
                  {JSON.stringify(service.metadata, null, 2)}
                </pre>
              </DataCard>
            )}
          </div>
        </TabsContent>

        {/* TAB · METRICS (mock F2) */}
        <TabsContent value="metrics">
          <div className="mt-6">
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <Activity
                  className="h-5 w-5 text-[var(--color-fg-muted)]"
                  strokeWidth={1.5}
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                  MÉTRICAS · DISPONIBLES PRÓXIMAMENTE
                </p>
              </div>
              <p className="text-sm text-[var(--color-fg)] leading-relaxed max-w-2xl mb-6">
                Aquí verás el rendimiento del servicio en tiempo real: uptime medido,
                latencia, throughput y eventos relevantes según la categoría.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricMock label="Uptime (30d)" value="—" hint="—" />
                <MetricMock label="Latencia P95" value="—" hint="—" />
                <MetricMock label="Throughput" value="—" hint="—" />
                <MetricMock label="Incidencias" value="—" hint="—" />
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] mt-8 max-w-2xl">
                LA CONEXIÓN A LA PLATAFORMA DE TELEMETRÍA SE INSTALA EN UNA FASE
                POSTERIOR · F3
              </p>
            </div>
          </div>
        </TabsContent>

        {/* TAB · DOCUMENTS */}
        <TabsContent value="documents">
          <div className="mt-6">
            {relatedDocuments.length === 0 ? (
              <EmptyState
                icon={<FileText strokeWidth={1.5} />}
                title="Sin documentos asociados"
                description="No hay documentos visibles relacionados con este servicio."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {relatedDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <FileText
                      className="h-4 w-4 text-[var(--color-fg-muted)] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-[var(--color-fg-strong)] truncate">
                        {doc.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                        {doc.category} · {formatBytes(doc.sizeBytes)} · {formatDateShort(doc.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span className="hidden sm:inline">Descargar</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* TAB · TICKETS */}
        <TabsContent value="tickets">
          <div className="mt-6">
            {relatedTickets.length === 0 ? (
              <EmptyState
                icon={<HeadphonesIcon strokeWidth={1.5} />}
                title="Sin tickets asociados"
                description="No hay tickets vinculados a este servicio."
                action={
                  <Button asChild size="sm">
                    <Link href={`/area-cliente/tickets/nuevo?service=${service.id}`}>
                      Abrir ticket sobre este servicio
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {relatedTickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/area-cliente/tickets/${t.id}`}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                            {t.number}
                          </span>
                          <Badge variant={TICKET_STATUS_BADGE[t.status]} dot>
                            {TICKET_STATUS_LABEL[t.status]}
                          </Badge>
                          <Badge variant={PRIORITY_BADGE[t.priority]}>
                            {PRIORITY_LABEL[t.priority]}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-fg-strong)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                          {t.subject}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] shrink-0 hidden sm:inline">
                        {formatDateShort(t.createdAt)}
                      </span>
                      <ExternalLink
                        className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* TAB · INVOICES */}
        <TabsContent value="invoices">
          <div className="mt-6">
            {relatedInvoices.length === 0 ? (
              <EmptyState
                icon={<Receipt strokeWidth={1.5} />}
                title="Sin facturas asociadas"
                description="Aún no hay facturas emitidas relacionadas con este cliente."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {relatedInvoices.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/area-cliente/facturas/${inv.id}`}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] tracking-[0.04em] text-[var(--color-fg-strong)] tnum font-medium">
                            {inv.number}
                          </span>
                          <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
                            {INVOICE_STATUS_LABEL[inv.status]}
                          </Badge>
                        </div>
                        <span className="font-mono text-xs text-[var(--color-fg-muted)] tnum">
                          {inv.issuedAt ? formatDate(inv.issuedAt) : '—'}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-semibold tnum text-[var(--color-fg-strong)] shrink-0">
                        {formatEuros(inv.totalCents)}
                      </span>
                      <ExternalLink
                        className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DataCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`flex flex-col gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden ${className ?? ''}`}
    >
      <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          {title}
        </h3>
      </header>
      <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
    </article>
  );
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold whitespace-nowrap">
        {label}
      </span>
      <span className="text-[var(--color-fg)] text-right truncate">{children}</span>
    </div>
  );
}

function MetricMock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-[var(--radius-3)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
      {hint && (
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
    .format(date)
    .toUpperCase()
    .replace(/\./g, '');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function computeAge(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const months = Math.max(0, Math.floor((Date.now() - start) / (30 * 24 * 60 * 60 * 1000)));
  if (months < 1) return 'Menos de 1 mes';
  if (months < 12) return `${months} mes${months === 1 ? '' : 'es'}`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} año${years === 1 ? '' : 's'}`;
  return `${years} año${years === 1 ? '' : 's'} y ${remMonths} mes${remMonths === 1 ? '' : 'es'}`;
}
