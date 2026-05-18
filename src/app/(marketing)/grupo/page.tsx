import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Compass,
  HandHeart,
  Microscope,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBlock } from '@/components/marketing/cta-block';

export const metadata: Metadata = {
  title: 'La agencia',
  description:
    'Wyweb es una agencia de diseño web, SaaS a medida y mantenimiento. Equipo pequeño, foco técnico y entrega medible.',
  alternates: { canonical: '/grupo' },
};

const values = [
  {
    Icon: Microscope,
    title: 'Rigor técnico',
    description:
      'Cada decisión está justificada con métricas. Sin "ya verás", sin atajos que rompen en producción.',
  },
  {
    Icon: ShieldCheck,
    title: 'Compromiso medible',
    description:
      'Cumplimos plazos y SLAs. Si algo se desvía, lo decimos cuanto antes y proponemos plan B.',
  },
  {
    Icon: HandHeart,
    title: 'Relación larga',
    description:
      'No buscamos clientes de un proyecto. La mayoría se quedan en mantenimiento mensual durante años.',
  },
  {
    Icon: Compass,
    title: 'Honestidad',
    description:
      'Si tu necesidad no encaja con lo que hacemos bien, lo decimos. Recomendamos a otros si hace falta.',
  },
  {
    Icon: Sparkles,
    title: 'Iteración continua',
    description:
      'Entregar la web no es el final. Medimos, ajustamos y mejoramos cada mes con datos reales.',
  },
  {
    Icon: Wrench,
    title: 'Ingeniería sólida',
    description:
      'Stack moderno, tipado, accesible y testado. Nada de plantillas ni builders que generan deuda.',
  },
] as const;

const timeline = [
  {
    year: '2020',
    title: 'Wyweb nace',
    description:
      'Empezamos como freelance haciendo webs para autónomos y pymes locales. Una al mes, todo a mano.',
  },
  {
    year: '2022',
    title: 'Equipo de tres',
    description:
      'Se incorporan dos personas más: diseño UI/UX y desarrollo backend. Stack en Next.js como estándar.',
  },
  {
    year: '2023',
    title: 'Primer SaaS a medida',
    description:
      'Entregamos la primera plataforma multi-tenant: autenticación, facturación recurrente y panel admin.',
  },
  {
    year: '2024',
    title: 'Mantenimiento como producto',
    description:
      'Lanzamos el servicio mensual con hosting gestionado y bolsa de horas. Más del 70% de clientes lo contrata.',
  },
  {
    year: '2026',
    title: 'Hoy',
    description:
      'Equipo de 5 personas 100% remoto, +60 proyectos entregados, foco en pymes españolas que quieren producto serio.',
  },
] as const;

export default function GrupoPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] pt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>La agencia</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
              <span>00</span>
              <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
              <span>LA AGENCIA</span>
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.05]">
              Equipo pequeño, foco técnico, entrega medible.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Diseñamos y construimos webs y SaaS a medida desde 2020. Sin plantillas
              genéricas ni promesas de ranking. Lo que decimos en la primera reunión
              es lo que entregamos.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
            <Button variant="accent" size="md" asChild className="self-start lg:self-end">
              <Link href="/contacto">
                Hablar con el equipo
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="01"
            eyebrow="CÓMO TRABAJAMOS"
            title="Seis principios que aplicamos en cada proyecto."
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {values.map((v, i) => (
              <li
                key={v.title}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-accent)]">
                    <v.Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
                  {v.title}
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  {v.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <SectionHeader
            number="02"
            eyebrow="HISTORIA"
            title="De freelance a agencia, paso a paso."
          />
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            {timeline.map((t) => (
              <li
                key={t.year}
                className="flex flex-col gap-2 border-t-2 border-[var(--color-accent)] pt-4"
              >
                <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
                  {t.year}
                </p>
                <h3 className="text-sm font-semibold text-[var(--color-fg-strong)] leading-snug">
                  {t.title}
                </h3>
                <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                  {t.description}
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
            eyebrow="¿TRABAJAMOS JUNTOS?"
            title="Cuéntanos tu proyecto."
            description="Primera reunión sin compromiso. Si encaja, te planteamos diseño, plazos y presupuesto."
            primaryCta={{ label: 'Solicitar propuesta', href: '/contacto' }}
            secondaryCta={{
              label: 'hola@wyweb.es',
              href: 'mailto:hola@wyweb.es',
            }}
          />
        </div>
      </section>
    </>
  );
}
