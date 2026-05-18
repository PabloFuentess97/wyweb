import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contacto · Wyweb',
  description:
    'Cuéntanos qué necesitas. Te respondemos en menos de 24h hábiles. Auditoría inicial sin compromiso.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] pt-8 md:pt-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contacto</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-12 md:py-16 max-w-3xl flex flex-col gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
            <span>00</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
            <span>HABLEMOS</span>
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.04]">
            Cuéntanos en qué andas.
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Primera reunión sin compromiso. Si encaja, te planteamos diseño, plazos y
            presupuesto. Si no, te decimos a quién recurrir.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="relative pb-20 md:pb-24">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* FORM */}
          <div className="lg:col-span-7 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-10">
            <header className="flex flex-col gap-2 mb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                01 / FORMULARIO
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                Escríbenos
              </h2>
              <p className="text-sm text-[var(--color-fg-muted)]">
                Los campos marcados con <span className="text-[var(--color-danger)]">*</span> son
                obligatorios. El resto nos ayudan a preparar mejor la respuesta.
              </p>
            </header>

            <ContactForm source="web-contact" />
          </div>

          {/* INFO LATERAL */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* Datos de contacto */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-4">
                02 / DIRECTO
              </p>
              <ul className="flex flex-col gap-4">
                <ContactRow
                  icon={<Mail strokeWidth={1.5} />}
                  label="Email"
                  value={
                    <a
                      href="mailto:hola@wyweb.es"
                      className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors font-medium"
                    >
                      hola@wyweb.es
                    </a>
                  }
                />
                <ContactRow
                  icon={<Phone strokeWidth={1.5} />}
                  label="Teléfono"
                  value={
                    <a
                      href="tel:+34900000000"
                      className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors font-medium"
                    >
                      +34 900 000 000
                    </a>
                  }
                />
                <ContactRow
                  icon={<MapPin strokeWidth={1.5} />}
                  label="Equipo"
                  value="España · 100% remoto"
                />
                <ContactRow
                  icon={<Clock strokeWidth={1.5} />}
                  label="Horario"
                  value="Lun–Vie · 9:00–18:30 · Soporte con SLA disponible"
                />
              </ul>
            </div>

            {/* Tiempo respuesta + SLA */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
                  TIEMPO DE RESPUESTA
                </p>
                <p className="text-sm text-[var(--color-fg)] leading-relaxed">
                  Mensajes web: <strong>menos de 24h hábiles</strong>. Clientes con
                  contrato de mantenimiento activo tienen prioridad según su nivel
                  de SLA.
                </p>
              </div>
            </div>

            {/* Privacidad */}
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold mb-2">
                PRIVACIDAD
              </p>
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                Tus datos viajan por TLS y se guardan en la UE. No los compartimos con
                terceros ni los usamos para marketing externo. Detalles en{' '}
                <Link
                  href="/legal/privacidad"
                  className="text-[var(--color-accent)] hover:underline underline-offset-4"
                >
                  /legal/privacidad
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)] [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
          {label}
        </span>
        <span className="text-sm text-[var(--color-fg)] leading-relaxed">{value}</span>
      </div>
    </li>
  );
}
