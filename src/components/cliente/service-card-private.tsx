import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  LayoutDashboard,
  Palette,
  Search,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatEuros } from '@/lib/utils';
import {
  SERVICE_CATEGORY_LABEL,
  SERVICE_STATUS_BADGE,
  SERVICE_STATUS_LABEL,
  SLA_TIER_LABEL,
} from '@/lib/ui-variants';
import type { ServiceListItem } from '@/lib/db/queries/services';

const CATEGORY_ICONS = {
  'web-design': LayoutDashboard,
  saas: Code2,
  ecommerce: ShoppingBag,
  seo: Search,
  maintenance: Wrench,
  branding: Palette,
} as const;

const SLA_TONE: Record<string, string> = {
  none: 'text-[var(--color-fg-subtle)]',
  bronze: 'text-[#A87D4F]',
  silver: 'text-[var(--color-fg-muted)]',
  gold: 'text-[var(--color-warning)]',
  platinum: 'text-[var(--color-info)]',
};

type Props = {
  service: ServiceListItem;
};

export function ServiceCardPrivate({ service }: Props) {
  const Icon = CATEGORY_ICONS[service.category];
  const isInactive = service.status !== 'active';

  return (
    <Link
      href={`/area-cliente/servicios/${service.id}`}
      className="group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-colors hover:border-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] group-hover:text-[var(--color-accent)] transition-colors">
          <Icon className="h-5 w-5" />
        </span>
        <Badge variant={SERVICE_STATUS_BADGE[service.status]} dot>
          {SERVICE_STATUS_LABEL[service.status]}
        </Badge>
      </header>

      <div className="px-5 pt-3 pb-4 flex flex-col gap-1.5 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] tnum">
          {service.code}
        </p>
        <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-tight">
          {service.name}
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
          {SERVICE_CATEGORY_LABEL[service.category]}
        </p>
        {service.description && (
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed mt-1 line-clamp-2">
            {service.description}
          </p>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          {service.slaTier !== 'none' && (
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${SLA_TONE[service.slaTier] ?? ''}`}
            >
              SLA {SLA_TIER_LABEL[service.slaTier]}
            </span>
          )}
          {service.monthlyFeeCents !== null && (
            <span
              className={`font-mono text-sm tnum font-semibold ${
                isInactive ? 'text-[var(--color-fg-subtle)]' : 'text-[var(--color-fg-strong)]'
              }`}
            >
              {formatEuros(service.monthlyFeeCents)}
              <span className="text-[var(--color-fg-muted)] text-xs font-normal ml-0.5">
                /mes
              </span>
            </span>
          )}
        </div>
        <ArrowRight
          className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-fg)] group-hover:translate-x-0.5 transition-all"
          strokeWidth={1.5}
        />
      </footer>
    </Link>
  );
}
