import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SectionHeader } from '@/components/marketing/section-header';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { TechStack } from '@/components/marketing/tech-stack';
import { CaseCard } from '@/components/marketing/case-card';
import { CtaBlock } from '@/components/marketing/cta-block';
import { ServiceCard } from '@/components/marketing/service-card';
import { services, type Service } from '@/lib/data/services';

type Props = {
  service: Service;
};

export function ServicePageTemplate({ service }: Props) {
  const related = service.related.map((slug) => services[slug]);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative">
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
                <BreadcrumbLink asChild>
                  <Link href="/servicios">Servicios</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{service.titleShort}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
              <span>{service.index}</span>
              <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
              <span>{service.eyebrow}</span>
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.04]">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
              {service.lead}
            </p>
            <p className="text-base text-[var(--color-fg)] leading-relaxed max-w-2xl">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button variant="accent" size="lg" asChild>
                <Link href="/contacto">
                  Solicitar propuesta
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/servicios">Ver otros servicios</Link>
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-3)] bg-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] border border-[color-mix(in_oklab,var(--color-accent)_20%,var(--color-border))] text-[var(--color-accent)]">
              <service.Icon className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                CATEGORÍA
              </p>
              <p className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)]">
                {service.category}
              </p>
            </div>
            <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                FORMATO
              </p>
              <p className="text-sm text-[var(--color-fg)]">
                Servicio gestionado con SLA
              </p>
            </div>
            <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                COBERTURA
              </p>
              <p className="text-sm text-[var(--color-fg)]">España peninsular y Baleares</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative py-20 md:py-24 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="01"
            eyebrow="QUÉ INCLUYE"
            title="Cubrimos todo el ciclo del servicio."
            description="Auditoría inicial, diseño, despliegue, configuración, monitorización y soporte. Sin contratar piezas a terceros para lo crítico."
          />
          <FeatureGrid features={service.features} />
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="relative py-20 md:py-24">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="02"
            eyebrow="STACK · PARTNERS"
            title="Tecnologías con las que trabajamos a diario."
            description="Selección consciente, no oportunista. Hardware certificado, software con comunidad y soporte real. Te explicamos siempre por qué cada elección."
          />
          <div className="border-t border-[var(--color-border)] pt-8">
            <TechStack items={service.techStack} />
          </div>
        </div>
      </section>

      {/* ─── CASE (opcional) ─── */}
      {service.case && (
        <section className="relative py-20 md:py-24 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
            <SectionHeader
              number="03"
              eyebrow="CASO REAL"
              title={service.case.title}
            />
            <CaseCard
              industry={service.case.industry}
              customer={service.case.customer}
              title={service.case.title}
              quote={service.case.quote}
              attribution={service.case.attribution}
              stats={service.case.stats}
            />
          </div>
        </section>
      )}

      {/* ─── RELATED ─── */}
      {related.length > 0 && (
        <section className="relative py-20 md:py-24">
          <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
            <SectionHeader
              number={service.case ? '04' : '03'}
              eyebrow="OTROS SERVICIOS"
              title="Combina lo que necesites."
              description="Las decisiones técnicas no viven aisladas. Te ayudamos a integrar."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((rel) => (
                <ServiceCard
                  key={rel.slug}
                  index={rel.index}
                  title={rel.titleShort}
                  description={rel.lead}
                  href={`/servicios/${rel.slug}`}
                  Icon={rel.Icon}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative py-12 md:py-20">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <CtaBlock
            eyebrow="SIGUIENTE PASO"
            title={
              <>
                ¿Quieres una propuesta concreta?
                <br />
                <span className="text-[var(--color-fg-muted)]">
                  Auditamos tu situación y te respondemos en 24h hábiles.
                </span>
              </>
            }
            description="Sin compromiso ni alta. Si encaja, planteamos arquitectura, plazos y SLA. Si no, te decimos a quién recurrir."
            primaryCta={{ label: 'Solicitar propuesta', href: '/contacto' }}
            secondaryCta={{ label: 'hola@wyweb.es', href: 'mailto:hola@wyweb.es' }}
          />
        </div>
      </section>

      {/* JSON-LD Service schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.titleShort,
            description: service.lead,
            provider: {
              '@type': 'Organization',
              name: 'Wyweb',
              url: 'https://wyweb.es',
              email: 'hola@wyweb.es',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'ES',
              },
            },
            areaServed: { '@type': 'Country', name: 'España' },
            serviceType: service.category,
          }),
        }}
      />
    </>
  );
}

/** Define el badge de categoría visible en el listing — placeholder no usado aquí. */
export function ServiceCategoryBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="accent">{children}</Badge>;
}
