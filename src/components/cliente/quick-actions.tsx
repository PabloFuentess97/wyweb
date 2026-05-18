import Link from 'next/link';
import {
  ArrowRight,
  FolderOpen,
  HeadphonesIcon,
  Plus,
  Receipt,
  Server,
  UserCircle,
} from 'lucide-react';

type QuickAction = {
  href: string;
  label: string;
  description: string;
  Icon: React.ComponentType<React.SVGAttributes<SVGSVGElement> & { strokeWidth?: number }>;
  primary?: boolean;
};

const ACTIONS: ReadonlyArray<QuickAction> = [
  {
    href: '/area-cliente/tickets/nuevo',
    label: 'Nuevo ticket',
    description: 'Abre una incidencia o consulta técnica',
    Icon: Plus,
    primary: true,
  },
  {
    href: '/area-cliente/servicios',
    label: 'Mis servicios',
    description: 'Ver servicios contratados y SLA',
    Icon: Server,
  },
  {
    href: '/area-cliente/facturas',
    label: 'Facturas',
    description: 'Histórico y descargas',
    Icon: Receipt,
  },
  {
    href: '/area-cliente/tickets',
    label: 'Mis tickets',
    description: 'Estado de tus consultas',
    Icon: HeadphonesIcon,
  },
  {
    href: '/area-cliente/documentos',
    label: 'Documentos',
    description: 'Contratos y certificados',
    Icon: FolderOpen,
  },
  {
    href: '/area-cliente/perfil',
    label: 'Perfil',
    description: 'Datos personales y preferencias',
    Icon: UserCircle,
  },
];

export function QuickActions() {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
          Accesos rápidos
        </h2>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group flex items-center gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] ${
              a.primary
                ? 'border-[var(--color-fg-strong)] hover:bg-[var(--color-bg-subtle)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-2)] shrink-0 ${
                a.primary
                  ? 'bg-[var(--color-fg-strong)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-strong)]'
              }`}
            >
              <a.Icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <p className="text-sm font-medium text-[var(--color-fg-strong)] leading-tight">
                {a.label}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] leading-snug truncate">
                {a.description}
              </p>
            </div>
            <ArrowRight
              className="h-3.5 w-3.5 text-[var(--color-fg-subtle)] shrink-0 group-hover:text-[var(--color-fg)] transition-colors"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
