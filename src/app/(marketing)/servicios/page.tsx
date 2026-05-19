import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBlock } from '@/components/marketing/cta-block';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { serviceList } from '@/lib/data/services';

export const metadata: Metadata = {
  title: 'Servicios · diseño web, SaaS, ecommerce y SEO',
  description:
    'Seis servicios cerrados: diseño web, SaaS a medida, ecommerce, SEO, mantenimiento y branding. Para autónomos, pymes y empresas.',
  alternates: { canonical: '/servicios' },
};

export default function ServiciosHub() {
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
              <BreadcrumbPage>Servicios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-16 md:py-24 flex flex-col gap-6 max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
            <span>00</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
            <span>HUB · SERVICIOS</span>
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.04]">
            Seis capacidades que combinamos
            <br className="hidden md:block" /> según tu proyecto.
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-3xl">
            Diseño web, SaaS a medida, ecommerce, SEO, mantenimiento y branding. La
            mayoría de proyectos mezclan tres o cuatro — te ayudamos a decidir cuáles
            encajan en tu caso.
          </p>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="relative pb-12">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <ul className="flex flex-col">
            {serviceList.map((service, i) => {
              const isLast = i === serviceList.length - 1;
              return (
                <li key={service.slug}>
                  <Link
                    href={`/servicios/${service.slug}`}
                    className={`group flex flex-col gap-4 lg:gap-8 lg:flex-row lg:items-center py-8 md:py-10 border-t border-[var(--color-border)] ${isLast ? 'border-b' : ''} transition-colors hover:bg-[var(--color-surface)] -mx-[var(--container-padding)] px-[var(--container-padding)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]`}
                  >
                    <div className="flex items-start gap-4 lg:w-32 shrink-0">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold pt-1.5">
                        {service.index}
                      </span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-3)] bg-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] border border-[color-mix(in_oklab,var(--color-accent)_20%,var(--color-border))] text-[var(--color-accent)]">
                        <service.Icon className="h-6 w-6" />
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                          {service.titleShort}
                        </h2>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <p className="text-base text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
                        {service.lead}
                      </p>
                      <ul className="flex flex-wrap gap-1.5 mt-1">
                        {service.features.slice(0, 4).map((f) => (
                          <li
                            key={f.title}
                            className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5"
                          >
                            {f.title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors lg:self-center">
                      Ver servicio
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="relative py-20 md:py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="06"
            eyebrow="CÓMO TRABAJAMOS"
            title="Cuatro fases. Sin sorpresas."
            description="El proceso es el mismo independientemente de la categoría. Lo que cambia es el detalle técnico."
          />
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-border)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border)]">
            {[
              {
                step: '01',
                title: 'Auditoría inicial',
                description:
                  'Visitamos, medimos, documentamos lo que hay y entendemos los objetivos reales.',
              },
              {
                step: '02',
                title: 'Diseño + propuesta',
                description:
                  'Arquitectura propuesta, alternativas con tradeoffs, plazos y precio cerrado.',
              },
              {
                step: '03',
                title: 'Despliegue',
                description:
                  'Instalación, configuración, pruebas y entrega. Documentación viva al final.',
              },
              {
                step: '04',
                title: 'Mantenimiento',
                description:
                  'Hosting gestionado, monitorización 24/7 y bolsa de horas mensuales para iterar.',
              },
            ].map((phase) => (
              <li
                key={phase.step}
                className="flex flex-col gap-3 p-6 bg-[var(--color-surface)]"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold">
                  FASE {phase.step}
                </span>
                <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-tight">
                  {phase.title}
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  {phase.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-12 md:py-20">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <CtaBlock
            eyebrow="¿NO SABES POR DÓNDE EMPEZAR?"
            title={
              <>
                Una conversación de 30 minutos
                <br />
                <span className="text-[var(--color-fg-muted)]">basta para saberlo.</span>
              </>
            }
            description="Cuéntanos la situación y te decimos qué auditaríamos primero. Sin venderte nada."
            primaryCta={{ label: 'Solicitar propuesta', href: '/contacto' }}
            secondaryCta={{ label: 'hola@wyweb.net', href: 'mailto:hola@wyweb.net' }}
          />
        </div>
      </section>
    </>
  );
}
