import { cn } from '@/lib/utils';

type Props = {
  /** Número de sección, ej. "01" o "02" — se renderiza en mono uppercase. */
  number?: string;
  /** Eyebrow tras el número, ej. "GRUPO UXEA SOLUCIONES". */
  eyebrow?: string;
  /** Título principal. */
  title: React.ReactNode;
  /** Texto secundario opcional. */
  description?: React.ReactNode;
  /** Alineación. */
  align?: 'left' | 'center';
  /** Tamaño del título. */
  size?: 'sm' | 'md' | 'lg';
  /** className extra */
  className?: string;
  /** Slot para acciones a la derecha (botón, link…). Solo align=left. */
  actions?: React.ReactNode;
};

export function SectionHeader({
  number,
  eyebrow,
  title,
  description,
  align = 'left',
  size = 'md',
  className,
  actions,
}: Props) {
  const eyebrowText = [number, eyebrow].filter(Boolean).join(' / ');

  return (
    <header
      className={cn(
        'flex gap-6 mb-10',
        align === 'center'
          ? 'flex-col items-center text-center'
          : 'flex-col md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center')}>
        {eyebrowText && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            {eyebrowText}
          </p>
        )}
        <h2
          className={cn(
            'font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.05]',
            size === 'sm' && 'text-2xl md:text-3xl max-w-2xl',
            size === 'md' && 'text-3xl md:text-4xl max-w-3xl',
            size === 'lg' && 'text-4xl md:text-5xl max-w-4xl',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed',
              align === 'center' ? 'max-w-2xl' : 'max-w-2xl',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && align === 'left' && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
