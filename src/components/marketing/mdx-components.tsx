import Link from 'next/link';
import { AlertCircle, Info, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { highlightCode } from '@/lib/shiki';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'warning' | 'success' | 'note';

const toneClasses: Record<Tone, string> = {
  info: 'border-l-[var(--color-info)] [&_.callout-icon]:text-[var(--color-info)]',
  warning:
    'border-l-[var(--color-warning)] [&_.callout-icon]:text-[var(--color-warning)]',
  success:
    'border-l-[var(--color-success)] [&_.callout-icon]:text-[var(--color-success)]',
  note: 'border-l-[var(--color-fg-muted)] [&_.callout-icon]:text-[var(--color-fg-muted)]',
};

const toneIcons: Record<Tone, React.ReactNode> = {
  info: <Info className="h-4 w-4" strokeWidth={1.5} />,
  warning: <AlertCircle className="h-4 w-4" strokeWidth={1.5} />,
  success: <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />,
  note: <Info className="h-4 w-4" strokeWidth={1.5} />,
};

function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        'my-8 flex gap-3 rounded-r-[var(--radius-3)] border-l-4 bg-[var(--color-bg-subtle)] p-4',
        toneClasses[tone],
      )}
    >
      <span className="callout-icon mt-0.5 shrink-0">{toneIcons[tone]}</span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {title && (
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--color-fg-strong)]">
            {title}
          </p>
        )}
        <div className="text-sm text-[var(--color-fg)] leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">
          {children}
        </div>
      </div>
    </aside>
  );
}

async function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const lang = (className ?? '').replace('language-', '') || 'text';
  const code = String(children ?? '').replace(/\n$/, '');
  const html = await highlightCode(code, lang);
  return (
    <div className="relative my-6 group">
      {lang !== 'text' && (
        <span className="absolute right-3 top-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] z-10 pointer-events-none">
          {lang}
        </span>
      )}
      <div
        className="overflow-x-auto rounded-[var(--radius-3)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] [&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-[1.65] [&_code]:bg-transparent [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function InlineCode({ children, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      className="rounded-[var(--radius-1)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-1 py-0.5 font-mono text-[0.875em] text-[var(--color-fg-strong)]"
      {...props}
    >
      {children}
    </code>
  );
}

function MDXAnchor({
  href = '#',
  children,
  ...props
}: React.ComponentProps<'a'>) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent)] underline-offset-4 hover:underline inline-flex items-baseline gap-0.5"
        {...props}
      >
        {children}
        <ArrowUpRight className="h-3 w-3 self-center" strokeWidth={1.5} />
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="text-[var(--color-accent)] underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

function HeadingTwo({ children, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className="mt-12 mb-3 text-2xl md:text-3xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight scroll-mt-24"
      {...props}
    >
      {children}
    </h2>
  );
}

function HeadingThree({ children, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className="mt-8 mb-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  );
}

function Paragraph({ children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className="my-4 text-base text-[var(--color-fg)] leading-relaxed"
      {...props}
    >
      {children}
    </p>
  );
}

function UnorderedList({ children, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className="my-5 list-disc pl-6 marker:text-[var(--color-fg-subtle)] [&>li]:my-1.5 [&>li]:pl-1 text-[var(--color-fg)] leading-relaxed"
      {...props}
    >
      {children}
    </ul>
  );
}

function OrderedList({ children, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className="my-5 list-decimal pl-6 marker:text-[var(--color-fg-subtle)] marker:font-mono marker:text-sm [&>li]:my-1.5 [&>li]:pl-1 text-[var(--color-fg)] leading-relaxed"
      {...props}
    >
      {children}
    </ol>
  );
}

function Blockquote({ children, ...props }: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className="my-6 border-l-2 border-[var(--color-accent)] pl-5 italic text-[var(--color-fg)]"
      {...props}
    >
      {children}
    </blockquote>
  );
}

function MdxTable({ children, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="my-6 overflow-x-auto rounded-[var(--radius-3)] border border-[var(--color-border)]">
      <table
        className="w-full border-collapse text-sm [&_th]:bg-[var(--color-bg-subtle)] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-mono [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:font-semibold [&_th]:text-[var(--color-fg-muted)] [&_th]:border-b [&_th]:border-[var(--color-border)] [&_td]:px-4 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-[var(--color-border)] [&_tr:last-child_td]:border-b-0 [&_td]:text-[var(--color-fg)]"
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function HorizontalRule(props: React.ComponentProps<'hr'>) {
  return <hr className="my-10 border-0 border-t border-[var(--color-border)]" {...props} />;
}

export const mdxComponents = {
  h2: HeadingTwo,
  h3: HeadingThree,
  p: Paragraph,
  a: MDXAnchor,
  ul: UnorderedList,
  ol: OrderedList,
  blockquote: Blockquote,
  table: MdxTable,
  hr: HorizontalRule,
  code: InlineCode,
  pre: ({ children }: React.ComponentProps<'pre'>) => {
    // children is <code className="language-xxx">content</code>
    if (
      children &&
      typeof children === 'object' &&
      'props' in children &&
      children.props
    ) {
      const { className, children: codeChildren } = children.props as {
        className?: string;
        children?: React.ReactNode;
      };
      return <CodeBlock className={className}>{codeChildren}</CodeBlock>;
    }
    return <pre>{children}</pre>;
  },
  Callout,
};
