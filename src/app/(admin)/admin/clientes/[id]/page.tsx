import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileText,
  FolderOpen,
  HeadphonesIcon,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Server,
  Users,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCustomerById } from '@/lib/db/queries/customers';
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
import { CustomerForm } from '../customer-form';

const STATUS_BADGE = {
  active: { variant: 'success' as const, label: 'Activo' },
  suspended: { variant: 'warning' as const, label: 'Suspendido' },
  archived: { variant: 'outline' as const, label: 'Archivado' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCustomerById(id);
  if (!detail) return { title: 'Cliente · Backoffice' };
  return {
    title: `${detail.customer.legalName} · Backoffice`,
    robots: { index: false, follow: false },
  };
}

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) return null;

  const { id } = await params;
  const sp = await searchParams;
  const detail = await getCustomerById(id);
  if (!detail) notFound();

  const { customer, users, services, invoices, tickets, documents } = detail;
  const editing = sp.edit === '1';
  const status = STATUS_BADGE[customer.status];
  const totalInvoiced = invoices
    .filter((i) => ['issued', 'paid', 'overdue'].includes(i.status))
    .reduce((acc, i) => acc + i.totalCents, 0);
  const mrr = services
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (s.monthlyFeeCents ?? 0), 0);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Clientes
      </Link>

      {/* HEADER */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]">
              <Building2 className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] tnum">
                CIF · {customer.cif}
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                {customer.legalName}
              </h1>
              {customer.tradeName && (
                <p className="text-sm text-[var(--color-fg-muted)]">
                  {customer.tradeName}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={status.variant} dot>
                  {status.label}
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                  CLIENTE DESDE · {formatDate(customer.createdAt).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!editing && (
              <Button asChild variant="secondary" size="md">
                <Link href={`/admin/clientes/${customer.id}?edit=1`}>Editar</Link>
              </Button>
            )}
            {editing && (
              <Button asChild variant="ghost" size="md">
                <Link href={`/admin/clientes/${customer.id}`}>Cancelar</Link>
              </Button>
            )}
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Servicios activos" value={services.filter((s) => s.status === 'active').length} />
          <SummaryCard label="MRR" value={mrr === 0 ? '—' : formatEuros(mrr)} />
          <SummaryCard label="Tickets abiertos" value={tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length} />
          <SummaryCard label="Facturado total" value={totalInvoiced === 0 ? '—' : formatEuros(totalInvoiced)} />
        </div>
      </header>

      {/* TABS */}
      <Tabs defaultValue={editing ? 'edit' : 'datos'}>
        <TabsList>
          <TabsTrigger value={editing ? 'edit' : 'datos'}>
            {editing ? 'Editar' : 'Datos'}
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            Usuarios
            {users.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {users.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="servicios">
            Servicios
            {services.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {services.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="facturas">
            Facturas
            {invoices.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {invoices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tickets">
            Tickets
            {tickets.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {tickets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos
            {documents.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {documents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* DATOS (read) */}
        {!editing && (
          <TabsContent value="datos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <DataCard title="Identificación">
                <DataRow label="CIF/NIF">
                  <span className="font-mono tnum">{customer.cif}</span>
                </DataRow>
                <DataRow label="Razón social">{customer.legalName}</DataRow>
                <DataRow label="Nombre comercial">
                  {customer.tradeName ?? <Empty />}
                </DataRow>
                <DataRow label="Marca">{customer.brand}</DataRow>
              </DataCard>

              <DataCard title="Contacto">
                <DataRow label="Email facturación" icon={<Mail strokeWidth={1.5} />}>
                  <a
                    href={`mailto:${customer.emailBilling}`}
                    className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
                  >
                    {customer.emailBilling}
                  </a>
                </DataRow>
                <DataRow label="Teléfono" icon={<Phone strokeWidth={1.5} />}>
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone.replace(/\s+/g, '')}`}
                      className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <Empty />
                  )}
                </DataRow>
              </DataCard>

              <DataCard title="Dirección" className="md:col-span-2">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)]">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                  <address className="text-sm text-[var(--color-fg)] not-italic leading-relaxed">
                    {customer.addressLine1}
                    {customer.addressLine2 && (
                      <>
                        <br />
                        {customer.addressLine2}
                      </>
                    )}
                    <br />
                    {customer.postalCode} {customer.city} ({customer.province})
                    <br />
                    {customer.country}
                  </address>
                </div>
              </DataCard>

              <DataCard title="Datos bancarios">
                <DataRow label="IBAN">
                  {customer.iban ? (
                    <span className="font-mono text-xs tnum">{customer.iban}</span>
                  ) : (
                    <Empty />
                  )}
                </DataRow>
              </DataCard>

              <DataCard title="Auditoría">
                <DataRow label="Creado">
                  <span className="font-mono text-xs tnum">
                    {formatDateLong(customer.createdAt)}
                  </span>
                </DataRow>
                <DataRow label="Actualizado">
                  <span className="font-mono text-xs tnum">
                    {formatDateLong(customer.updatedAt)}
                  </span>
                </DataRow>
                <DataRow label="ID">
                  <span className="font-mono text-[10px] tnum text-[var(--color-fg-muted)] truncate block">
                    {customer.id}
                  </span>
                </DataRow>
              </DataCard>

              {customer.notes && (
                <DataCard title="Notas internas" className="md:col-span-2">
                  <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </DataCard>
              )}
            </div>
          </TabsContent>
        )}

        {/* DATOS (edit) */}
        {editing && (
          <TabsContent value="edit">
            <div className="mt-6">
              <CustomerForm
                mode="edit"
                customerId={customer.id}
                defaults={{
                  cif: customer.cif,
                  legalName: customer.legalName,
                  tradeName: customer.tradeName ?? '',
                  emailBilling: customer.emailBilling,
                  phone: customer.phone ?? '',
                  addressLine1: customer.addressLine1,
                  addressLine2: customer.addressLine2 ?? '',
                  postalCode: customer.postalCode,
                  city: customer.city,
                  province: customer.province,
                  country: customer.country,
                  iban: customer.iban ?? '',
                  status: customer.status,
                  notes: customer.notes ?? '',
                }}
              />
            </div>
          </TabsContent>
        )}

        {/* USUARIOS */}
        <TabsContent value="usuarios">
          <div className="mt-6">
            {users.length === 0 ? (
              <EmptyState
                icon={<Users strokeWidth={1.5} />}
                title="Sin usuarios asociados"
                description="Crea o vincula un usuario al cliente desde la sección Usuarios."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {users.map((u) => (
                  <li
                    key={u.userId}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] font-mono text-[10px] uppercase tracking-[0.04em] font-medium text-[var(--color-fg-muted)]">
                      {u.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-[var(--color-fg-strong)] truncate">
                        {u.name}
                      </p>
                      <p className="font-mono text-xs text-[var(--color-fg-muted)] truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {u.customerRole === 'admin' ? 'Admin del cliente' : 'Viewer'}
                      </Badge>
                      <Badge variant="default">{u.role}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* SERVICIOS */}
        <TabsContent value="servicios">
          <div className="mt-6">
            {services.length === 0 ? (
              <EmptyState
                icon={<Server strokeWidth={1.5} />}
                title="Sin servicios"
                description="Aún no hay servicios asociados a este cliente."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
                          {s.code}
                        </span>
                        <Badge variant={SERVICE_STATUS_BADGE[s.status]} dot>
                          {SERVICE_STATUS_LABEL[s.status]}
                        </Badge>
                        <Badge variant="outline">
                          {SERVICE_CATEGORY_LABEL[s.category]}
                        </Badge>
                        {s.slaTier !== 'none' && (
                          <Badge variant="accent">SLA {SLA_TIER_LABEL[s.slaTier]}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-fg-strong)] truncate">
                        {s.name}
                      </p>
                    </div>
                    {s.monthlyFeeCents !== null && (
                      <span className="font-mono text-sm tnum font-medium text-[var(--color-fg-strong)] shrink-0">
                        {formatEuros(s.monthlyFeeCents)}
                        <span className="text-xs text-[var(--color-fg-muted)] font-normal ml-0.5">
                          /mes
                        </span>
                      </span>
                    )}
                    <Link
                      href={`/admin/servicios/${s.id}`}
                      className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                      aria-label="Abrir servicio"
                    >
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* FACTURAS */}
        <TabsContent value="facturas">
          <div className="mt-6">
            {invoices.length === 0 ? (
              <EmptyState
                icon={<Receipt strokeWidth={1.5} />}
                title="Sin facturas"
                description="Aún no hay facturas emitidas para este cliente."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/admin/facturas/${inv.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm tnum font-medium text-[var(--color-fg-strong)]">
                            {inv.number}
                          </span>
                          <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
                            {INVOICE_STATUS_LABEL[inv.status]}
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-[var(--color-fg-muted)] tnum">
                          {inv.issuedAt ? formatDate(inv.issuedAt) : 'Sin emitir'}
                        </p>
                      </div>
                      <span className="font-mono text-sm tnum font-medium text-[var(--color-fg-strong)] shrink-0">
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

        {/* TICKETS */}
        <TabsContent value="tickets">
          <div className="mt-6">
            {tickets.length === 0 ? (
              <EmptyState
                icon={<HeadphonesIcon strokeWidth={1.5} />}
                title="Sin tickets"
                description="Este cliente no ha abierto tickets aún."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
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
                        <p className="text-sm text-[var(--color-fg-strong)] truncate">
                          {t.subject}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] shrink-0 hidden sm:inline">
                        {formatDate(t.createdAt)}
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

        {/* DOCUMENTOS */}
        <TabsContent value="documentos">
          <div className="mt-6">
            {documents.length === 0 ? (
              <EmptyState
                icon={<FolderOpen strokeWidth={1.5} />}
                title="Sin documentos"
                description="No hay documentos asociados a este cliente."
              />
            ) : (
              <ul className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
                {documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <FileText
                      className="h-4 w-4 text-[var(--color-fg-muted)] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-[var(--color-fg-strong)] truncate">
                        {d.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                        {d.category} · {(d.sizeBytes / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    {!d.visibleToClient && (
                      <Badge variant="outline">Privado staff</Badge>
                    )}
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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
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
      className={`flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden ${className ?? ''}`}
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
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold whitespace-nowrap inline-flex items-center gap-1.5">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3 inline-flex items-center text-[var(--color-fg-subtle)]">
            {icon}
          </span>
        )}
        {label}
      </span>
      <span className="text-[var(--color-fg)] text-right truncate min-w-0 flex-1">
        {children}
      </span>
    </div>
  );
}

function Empty() {
  return <span className="text-[var(--color-fg-subtle)]">—</span>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateLong(date: Date): string {
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
