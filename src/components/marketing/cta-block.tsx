import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EngineeredGrid } from '@/components/marketing/engineered-grid';
import { cn } from '@/lib/utils';

type Cta = { label: string; href: string };

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  className?: string;
};

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

export function CtaBlock({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: Props) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 md:px-12 md:py-16',
        className,
      )}
    >
      <EngineeredGrid variant="dots" density="md" fade="all" className="opacity-70" />

      <div className="relative flex flex-col items-start gap-6 max-w-3xl">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.05]">
          {title}
        </h2>
        {description && (
          <p className="text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-2">
          {primaryCta && <CtaButton variant="accent" cta={primaryCta} primary />}
          {secondaryCta && <CtaButton variant="secondary" cta={secondaryCta} />}
        </div>
      </div>
    </section>
  );
}

function CtaButton({
  variant,
  cta,
  primary,
}: {
  variant: 'accent' | 'secondary';
  cta: Cta;
  primary?: boolean;
}) {
  const external = isExternal(cta.href);
  const isMail = cta.href.startsWith('mailto:');
  const Icon = external ? ArrowUpRight : primary ? ArrowRight : isMail ? Mail : ArrowRight;
  const inner = (
    <>
      {!primary && isMail && <Icon className="h-4 w-4" strokeWidth={1.5} />}
      <span>{cta.label}</span>
      {(primary || external) && !isMail && (
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      )}
    </>
  );

  if (external || isMail) {
    return (
      <Button variant={variant} size="lg" asChild>
        <a
          href={cta.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {inner}
        </a>
      </Button>
    );
  }
  return (
    <Button variant={variant} size="lg" asChild>
      <Link href={cta.href}>{inner}</Link>
    </Button>
  );
}
