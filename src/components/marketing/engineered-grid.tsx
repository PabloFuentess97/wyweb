import { cn } from '@/lib/utils';

type Variant = 'lines' | 'dots' | 'cross';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  density?: 'sm' | 'md' | 'lg';
  fade?: 'top' | 'bottom' | 'all' | 'none';
};

const sizeMap: Record<NonNullable<Props['density']>, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

export function EngineeredGrid({
  className,
  variant = 'lines',
  density = 'md',
  fade = 'all',
  ...props
}: Props) {
  const size = sizeMap[density];
  const stroke = 'color-mix(in oklab, var(--color-fg) 6%, transparent)';

  const bg =
    variant === 'dots'
      ? `radial-gradient(circle at 1px 1px, ${stroke} 1px, transparent 0)`
      : variant === 'cross'
        ? `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(90deg, ${stroke} 1px, transparent 1px)`
        : `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(90deg, ${stroke} 1px, transparent 1px)`;

  const mask =
    fade === 'top'
      ? 'linear-gradient(to bottom, transparent, black 30%, black)'
      : fade === 'bottom'
        ? 'linear-gradient(to top, transparent, black 30%, black)'
        : fade === 'all'
          ? 'radial-gradient(ellipse 90% 70% at center, black 30%, transparent 100%)'
          : 'none';

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
      style={{
        backgroundImage: bg,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: '0 0',
        WebkitMaskImage: mask !== 'none' ? mask : undefined,
        maskImage: mask !== 'none' ? mask : undefined,
      }}
      {...props}
    />
  );
}
