import { cn } from '@/lib/utils';

type Props = {
  items: readonly string[];
  className?: string;
};

export function TechStack({ items, className }: Props) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-1 gap-y-2 -mx-2',
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={item} className="flex items-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] px-2 py-1">
            {item}
          </span>
          {i < items.length - 1 && (
            <span
              aria-hidden
              className="font-mono text-[10px] text-[var(--color-fg-subtle)] select-none"
            >
              ·
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
