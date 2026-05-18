import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Printer,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInvoiceForClient } from '@/lib/db/queries/invoices';
import { INVOICE_STATUS_BADGE, INVOICE_STATUS_LABEL } from '@/lib/ui-variants';
import { formatEuros } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return { title: 'Factura' };
  const detail = await getInvoiceForClient(id, session.user.customerIds);
  if (!detail) return { title: 'Factura' };
  return {
    title: `Factura ${detail.number}`,
    robots: { index: false, follow: false },
  };
}

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const inv = await getInvoiceForClient(id, session.user.customerIds);
  if (!inv) notFound();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      {/* Volver */}
      <Link
        href="/area-cliente/facturas"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Facturas
      </Link>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            FACTURA · SERIE {inv.series}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight font-mono tnum">
            {inv.number}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={INVOICE_STATUS_BADGE[inv.status]} dot>
              {INVOICE_STATUS_LABEL[inv.status]}
            </Badge>
            {inv.issuedAt && (
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-fg-muted)] tnum">
                EMITIDA {formatDate(inv.issuedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          {inv.pdfStorageKey ? (
            <Button asChild variant="primary" size="md">
              <a
                href={`/api/facturas/${inv.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Descargar PDF
              </a>
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-3)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] font-semibold">
                PDF EN PREPARACIÓN
              </span>
            </div>
          )}
          <Button variant="ghost" size="sm" disabled className="-mr-3">
            <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Imprimir</span>
          </Button>
        </div>
      </header>

      {/* Avisos por estado */}
      {inv.status === 'overdue' && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <AlertCircle
            className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-danger)]">
              FACTURA VENCIDA
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              Esta factura está fuera de plazo de pago{inv.dueAt ? ` (vencía ${formatDate(inv.dueAt)})` : ''}.
              Por favor, regulariza el pago para evitar la interrupción del servicio.
            </p>
          </div>
        </aside>
      )}

      {inv.status === 'paid' && inv.paidAt && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <CheckCircle2
            className="h-5 w-5 text-[var(--color-success)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <p className="text-sm text-[var(--color-fg)] leading-relaxed">
            Pagada el{' '}
            <strong className="font-medium text-[var(--color-fg-strong)]">
              {formatDate(inv.paidAt)}
            </strong>
            . Gracias.
          </p>
        </aside>
      )}

      {/* META: emisor / receptor / fechas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetaCard title="Emisor" Icon={Building2}>
          <p className="text-sm font-medium text-[var(--color-fg-strong)]">
            Wyweb
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] font-mono tnum">
            CIF B-XXXXXXXX
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1.5 leading-snug">
            España (100% remoto)
            <br />
            
          </p>
        </MetaCard>

        <MetaCard title="Receptor" Icon={Building2}>
          <p className="text-sm font-medium text-[var(--color-fg-strong)]">
            {inv.customer.legalName}
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] font-mono tnum">
            CIF {inv.customer.cif}
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1.5 leading-snug">
            {inv.customer.addressLine1}
            {inv.customer.addressLine2 && (
              <>
                <br />
                {inv.customer.addressLine2}
              </>
            )}
            <br />
            {inv.customer.postalCode} {inv.customer.city} · {inv.customer.country}
          </p>
        </MetaCard>

        <MetaCard title="Fechas" Icon={Calendar}>
          <DataLine label="Emisión">
            {inv.issuedAt ? (
              <span className="font-mono tnum">{formatDate(inv.issuedAt)}</span>
            ) : (
              '—'
            )}
          </DataLine>
          <DataLine label="Vencimiento">
            {inv.dueAt ? (
              <span className="font-mono tnum">{formatDate(inv.dueAt)}</span>
            ) : (
              '—'
            )}
          </DataLine>
          {inv.paidAt && (
            <DataLine label="Cobrada">
              <span className="font-mono tnum">{formatDate(inv.paidAt)}</span>
            </DataLine>
          )}
        </MetaCard>
      </section>

      {/* LÍNEAS */}
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden mb-6">
        <header className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center gap-2">
          <FileText
            className="h-3.5 w-3.5 text-[var(--color-fg-muted)]"
            strokeWidth={1.5}
          />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
            Líneas · {inv.lines.length}
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <Th>Descripción</Th>
                <Th align="right">Cant.</Th>
                <Th align="right">Precio</Th>
                <Th align="right">IVA</Th>
                <Th align="right">IRPF</Th>
                <Th align="right">Subtotal</Th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <Td>
                    <p className="text-[var(--color-fg-strong)]">{line.description}</p>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                      {Number.parseFloat(line.quantity).toFixed(2)}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-sm tnum">
                      {formatEuros(line.unitPriceCents)}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                      {Number.parseFloat(line.vatRate).toFixed(0)} %
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-xs tnum text-[var(--color-fg-muted)]">
                      {Number.parseFloat(line.irpfRate).toFixed(0)} %
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono text-sm tnum font-medium text-[var(--color-fg-strong)]">
                      {formatEuros(line.subtotalCents)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TOTALES */}
      <section className="flex flex-col items-end gap-1.5 mb-8">
        <div className="w-full md:max-w-md flex flex-col gap-1.5">
          <TotalRow label="Subtotal" value={formatEuros(inv.subtotalCents)} />
          {inv.vatCents > 0 && (
            <TotalRow label="IVA" value={`+ ${formatEuros(inv.vatCents)}`} />
          )}
          {inv.irpfCents > 0 && (
            <TotalRow
              label="IRPF retenido"
              value={`− ${formatEuros(inv.irpfCents)}`}
              negative
            />
          )}
          <div className="border-t border-[var(--color-border-strong)] pt-2 mt-1">
            <TotalRow
              label="Total"
              value={formatEuros(inv.totalCents)}
              emphasis
            />
          </div>
        </div>
      </section>

      {/* NOTAS */}
      {inv.notes && (
        <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-2">
            NOTAS
          </p>
          <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap">
            {inv.notes}
          </p>
        </section>
      )}

      {/* Footer legal */}
      <footer className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col gap-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold">
          INFORMACIÓN FISCAL
        </p>
        <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
          Esta factura se emite conforme a la normativa española vigente. Si necesitas
          una corrección o tienes dudas, contacta con{' '}
          <a
            href="mailto:facturacion@wyweb.es"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            facturacion@wyweb.es
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

function MetaCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: React.ComponentType<React.SVGAttributes<SVGSVGElement> & { strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <header className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3 text-[var(--color-fg-muted)]" strokeWidth={1.5} />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
          {title}
        </h3>
      </header>
      {children}
    </article>
  );
}

function DataLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </span>
      <span className="text-sm text-[var(--color-fg-strong)]">{children}</span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasis,
  negative,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={
          emphasis
            ? 'font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]'
            : 'font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)]'
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? 'font-mono text-2xl font-semibold tnum text-[var(--color-fg-strong)]'
            : `font-mono text-sm tnum ${negative ? 'text-[var(--color-fg-muted)]' : 'text-[var(--color-fg)]'}`
        }
      >
        {value}
      </span>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)] ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </td>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
