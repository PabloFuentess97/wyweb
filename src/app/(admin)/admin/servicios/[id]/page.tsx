import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getActiveCustomersForSelect,
  getAdminServiceById,
} from '@/lib/db/queries/services-admin';
import {
  SERVICE_CATEGORY_LABEL,
  SERVICE_STATUS_BADGE,
  SERVICE_STATUS_LABEL,
  SLA_TIER_LABEL,
} from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';
import { ServiceForm } from '../service-form';
import { StatusWorkflow } from './status-workflow';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminServiceById(id);
  if (!detail) return { title: 'Servicio · Backoffice' };
  return {
    title: `${detail.service.code} · ${detail.service.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function ServicioAdminDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const [detail, customers] = await Promise.all([
    getAdminServiceById(id),
    getActiveCustomersForSelect(),
  ]);
  if (!detail) notFound();

  const { service } = detail;
  const editing = sp.edit === '1';

  // Asegurar que el customer actual esté disponible en el select aunque no esté activo
  const currentCustomer = customers.find((c) => c.id === service.customerId);
  const selectCustomers = currentCustomer
    ? customers
    : [
        ...customers,
        {
          id: service.customerId,
          legalName: service.customerName,
          cif: service.customerCif,
        },
      ];

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <Link
        href="/admin/servicios"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Servicios
      </Link>

      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] tnum">
            {service.code}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
            {service.name}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            <Link
              href={`/admin/clientes/${service.customerId}`}
              className="hover:text-[var(--color-accent)]"
            >
              {service.customerName}
            </Link>
            <span className="font-mono text-xs tnum text-[var(--color-fg-subtle)] ml-2">
              · {service.customerCif}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={SERVICE_STATUS_BADGE[service.status]} dot>
              {SERVICE_STATUS_LABEL[service.status]}
            </Badge>
            <Badge variant="outline">{SERVICE_CATEGORY_LABEL[service.category]}</Badge>
            {service.slaTier !== 'none' && (
              <Badge variant="accent">SLA {SLA_TIER_LABEL[service.slaTier]}</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!editing ? (
            <Button asChild variant="secondary" size="md">
              <Link href={`/admin/servicios/${service.id}?edit=1`}>Editar</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="md">
              <Link href={`/admin/servicios/${service.id}`}>Cancelar</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Status workflow */}
      {!editing && (
        <section className="mb-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <StatusWorkflow serviceId={service.id} currentStatus={service.status} />
        </section>
      )}

      {/* Content */}
      {editing ? (
        <ServiceForm
          mode="edit"
          serviceId={service.id}
          customers={selectCustomers}
          currentStatus={service.status}
          defaults={{
            customerId: service.customerId,
            name: service.name,
            description: service.description ?? '',
            category: service.category,
            status: service.status,
            slaTier: service.slaTier,
            startedAt: service.startedAt ?? '',
            endedAt: service.endedAt ?? '',
            monthlyFee:
              service.monthlyFeeCents !== null
                ? String(service.monthlyFeeCents)
                : '',
            metadata:
              Object.keys(service.metadata).length > 0
                ? JSON.stringify(service.metadata, null, 2)
                : '',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <DataRow label="Cliente">
              <Link
                href={`/admin/clientes/${service.customerId}`}
                className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)]"
              >
                {service.customerName}
              </Link>
            </DataRow>
          </DataCard>

          <DataCard title="Vigencia y facturación">
            <DataRow label="Cuota mensual">
              {service.monthlyFeeCents !== null && service.monthlyFeeCents > 0 ? (
                <span className="font-mono tnum font-semibold text-[var(--color-fg-strong)]">
                  {formatEuros(service.monthlyFeeCents)}
                  <span className="text-[var(--color-fg-muted)] font-normal ml-0.5">
                    /mes
                  </span>
                </span>
              ) : (
                <span className="text-[var(--color-fg-subtle)]">—</span>
              )}
            </DataRow>
            <DataRow label="Inicio">
              {service.startedAt ? (
                <span className="font-mono tnum">{formatDate(service.startedAt)}</span>
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
            <DataRow label="Creado">
              <span className="font-mono text-xs tnum">
                {formatDateLong(service.createdAt)}
              </span>
            </DataRow>
            <DataRow label="Actualizado">
              <span className="font-mono text-xs tnum">
                {formatDateLong(service.updatedAt)}
              </span>
            </DataRow>
          </DataCard>

          {service.description && (
            <DataCard title="Descripción" className="md:col-span-2">
              <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </DataCard>
          )}

          {Object.keys(service.metadata).length > 0 && (
            <DataCard title="Metadata técnica" className="md:col-span-2">
              <pre className="font-mono text-xs bg-[var(--color-bg-subtle)] rounded-[var(--radius-2)] p-3 overflow-x-auto text-[var(--color-fg)]">
                {JSON.stringify(service.metadata, null, 2)}
              </pre>
            </DataCard>
          )}
        </div>
      )}
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold whitespace-nowrap">
        {label}
      </span>
      <span className="text-[var(--color-fg)] text-right truncate min-w-0 flex-1">
        {children}
      </span>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
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
