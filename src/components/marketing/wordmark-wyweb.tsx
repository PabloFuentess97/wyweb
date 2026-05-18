import { cn } from '@/lib/utils';

type Props = React.HTMLAttributes<HTMLDivElement>;

/**
 * Wordmark gigante "WYWEB" para el footer.
 * Tamaño fluido con clamp(), tracking ajustado, domina visualmente sin
 * desbordar.
 */
export function WordmarkWyweb({ className, ...props }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative w-full overflow-hidden select-none',
        'leading-[0.82] tracking-[-0.03em]',
        className,
      )}
      {...props}
    >
      <span
        className="block font-sans font-bold text-[var(--color-fg-strong)] text-center"
        style={{
          fontSize: 'clamp(5rem, 24vw, 20rem)',
          letterSpacing: '-0.04em',
          fontFeatureSettings: '"ss01"',
        }}
      >
        WYWEB
      </span>
      <span className="absolute right-2 -bottom-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)]">
        ES · {new Date().getFullYear()}
      </span>
    </div>
  );
}
