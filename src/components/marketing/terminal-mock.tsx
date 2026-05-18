import { cn } from '@/lib/utils';

export type TerminalLine =
  | { type: 'prompt'; user?: string; host?: string; cwd?: string; cmd: string }
  | { type: 'output'; text: string; tone?: 'default' | 'success' | 'muted' | 'accent' | 'danger' }
  | { type: 'blank' };

type Props = {
  title?: string;
  lines: readonly TerminalLine[];
  className?: string;
};

export function TerminalMock({
  title = 'uxea-cloud — bash',
  lines,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--ink-1000)] text-[var(--ink-50)] shadow-[var(--shadow-3)]',
        className,
      )}
      role="img"
      aria-label="Sesión de terminal demo"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 bg-black/30">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50 truncate">
          {title}
        </p>
        <span className="font-mono text-[10px] text-white/30">●●●</span>
      </header>

      <div className="p-5 md:p-6 font-mono text-[12px] md:text-[13px] leading-[1.65] tnum overflow-x-auto">
        {lines.map((line, i) => {
          if (line.type === 'blank') {
            return <div key={i} className="h-4" aria-hidden />;
          }
          if (line.type === 'prompt') {
            return (
              <div key={i} className="flex flex-wrap items-baseline gap-1 mb-1">
                <span className="text-emerald-400 select-none">
                  {line.user ?? 'pablo'}@{line.host ?? 'uxea-edge-01'}
                </span>
                <span className="text-white/40 select-none">:</span>
                <span className="text-sky-400 select-none">{line.cwd ?? '~/infra'}</span>
                <span className="text-white/40 select-none">$</span>
                <span className="text-white/95">{line.cmd}</span>
              </div>
            );
          }
          const toneClass =
            line.tone === 'success'
              ? 'text-emerald-400'
              : line.tone === 'accent'
                ? 'text-sky-300'
                : line.tone === 'muted'
                  ? 'text-white/45'
                  : line.tone === 'danger'
                    ? 'text-red-400'
                    : 'text-white/80';
          return (
            <pre
              key={i}
              className={cn('whitespace-pre-wrap break-all m-0 mb-0.5', toneClass)}
            >
              {line.text}
            </pre>
          );
        })}
        <span className="inline-block h-3 w-1.5 bg-white/80 align-middle ml-0.5 animate-pulse" />
      </div>
    </div>
  );
}
