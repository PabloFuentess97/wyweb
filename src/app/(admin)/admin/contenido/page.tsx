import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertCircle,
  ExternalLink,
  Eye,
  FileEdit,
  FilePlus2,
  GitBranch,
  Info,
  PenSquare,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { allPostsForAdmin, CATEGORY_LABELS, type Post } from '@/lib/blog';
import { githubBlobUrl, githubEditUrl, githubNewFileUrl } from '@/lib/github';

export const metadata: Metadata = {
  title: 'Contenido · Backoffice',
  robots: { index: false, follow: false },
};

const CATEGORY_TONE: Record<
  string,
  'accent' | 'info' | 'success' | 'warning' | 'default' | 'outline'
> = {
  'diseno-web': 'info',
  saas: 'accent',
  ecommerce: 'success',
  seo: 'warning',
  mantenimiento: 'default',
  branding: 'outline',
  casos: 'default',
  agencia: 'outline',
};

export default async function ContenidoPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const sp = await searchParams;
  const filter = sp.filter === 'draft' || sp.filter === 'published' ? sp.filter : 'all';

  const posts = allPostsForAdmin;
  const total = posts.length;
  const drafts = posts.filter((p) => p.draft).length;
  const published = total - drafts;
  const filteredPosts =
    filter === 'draft'
      ? posts.filter((p) => p.draft)
      : filter === 'published'
        ? posts.filter((p) => !p.draft)
        : posts;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
            BACKOFFICE · CONTENIDO
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            Posts del blog
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Los posts viven en{' '}
            <span className="font-mono text-xs text-[var(--color-fg-strong)]">
              content/blog/*.mdx
            </span>{' '}
            del repositorio. La edición se hace en GitHub: cada cambio fusionado a{' '}
            <span className="font-mono text-xs text-[var(--color-fg-strong)]">main</span>{' '}
            dispara un nuevo build y publica los cambios.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <Button asChild variant="accent" size="md">
            <a
              href={githubNewFileUrl('content/blog')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FilePlus2 className="h-4 w-4" strokeWidth={1.5} />
              Crear nuevo post en GitHub
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href={githubBlobUrl('content/blog')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitBranch className="h-3.5 w-3.5" strokeWidth={1.5} />
              Abrir carpeta en GitHub
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            </a>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Total" value={String(total)} />
        <Stat label="Publicados" value={String(published)} tone="success" />
        <Stat label="Borradores" value={String(drafts)} tone="warning" />
      </div>

      {/* Aviso pipeline */}
      <aside
        className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-4"
        role="status"
      >
        <Info
          className="h-5 w-5 text-[var(--color-fg-muted)] shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)]">
            CONTENT-AS-CODE
          </p>
          <p className="text-sm text-[var(--color-fg)] leading-relaxed">
            Los borradores (<span className="font-mono text-xs">draft: true</span>) son visibles en
            desarrollo pero <strong>nunca se publican</strong> en producción. Para publicar, edita
            el frontmatter MDX y haz merge a{' '}
            <span className="font-mono text-xs">main</span>.
          </p>
        </div>
      </aside>

      {/* Filtro */}
      <nav
        className="flex items-center gap-1 mb-4 border-b border-[var(--color-border)] pb-2"
        aria-label="Filtrar por estado"
      >
        <FilterTab href="/admin/contenido" active={filter === 'all'}>
          Todos · {total}
        </FilterTab>
        <FilterTab href="/admin/contenido?filter=published" active={filter === 'published'}>
          Publicados · {published}
        </FilterTab>
        <FilterTab href="/admin/contenido?filter=draft" active={filter === 'draft'}>
          Borradores · {drafts}
        </FilterTab>
      </nav>

      {/* Lista */}
      {filteredPosts.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredPosts.map((post) => (
            <li key={post.slug}>
              <PostRow post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  const filePath = `content/blog/${post.slug}.mdx`;
  const editUrl = githubEditUrl(filePath);
  const blobUrl = githubBlobUrl(filePath);

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] transition-colors overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-4 md:p-5">
        {/* Main: title + meta */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {post.draft ? (
              <Badge variant="warning" dot>
                Borrador
              </Badge>
            ) : (
              <Badge variant="success" dot>
                Publicado
              </Badge>
            )}
            <Badge variant={CATEGORY_TONE[post.category] ?? 'outline'}>
              {CATEGORY_LABELS[post.category]}
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] tnum">
              {post.readingTime} min
            </span>
          </div>
          <h2 className="text-base md:text-lg font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-snug">
            {post.title}
          </h2>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
            {post.description}
          </p>
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <Meta label="Slug">
              <span className="font-mono text-[11px] tnum">{post.slug}</span>
            </Meta>
            <Meta label="Autor">{post.author}</Meta>
            <Meta label="Publicado">
              <span className="font-mono text-[11px] tnum">
                {formatDate(post.publishedAt)}
              </span>
            </Meta>
            {post.updatedAt && (
              <Meta label="Actualizado">
                <span className="font-mono text-[11px] tnum">
                  {formatDate(post.updatedAt)}
                </span>
              </Meta>
            )}
          </dl>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-[var(--radius-full)] px-2 py-0.5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex md:flex-col items-stretch gap-2 mt-4 md:mt-0 md:w-44 shrink-0">
          {post.draft ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="opacity-60 cursor-not-allowed"
              title="Los borradores no son accesibles públicamente"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Ver en sitio</span>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Ver en sitio</span>
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary" size="sm">
            <a href={blobUrl} target="_blank" rel="noopener noreferrer">
              <GitBranch className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Ver fuente</span>
            </a>
          </Button>
          <Button asChild variant="accent" size="sm">
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              <PenSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Editar en GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex items-center px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
        active
          ? 'text-[var(--color-fg-strong)] after:absolute after:left-0 after:right-0 after:bottom-[-9px] after:h-[2px] after:bg-[var(--color-accent)]'
          : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
      }`}
    >
      {children}
    </Link>
  );
}

function EmptyState({ filter }: { filter: string }) {
  const map = {
    draft: { title: 'No hay borradores', desc: 'Todos los posts están publicados.' },
    published: {
      title: 'No hay posts publicados',
      desc: 'Publica un borrador cambiando draft: false en su frontmatter.',
    },
    all: { title: 'Sin contenido', desc: 'Crea tu primer post en GitHub.' },
  } as const;
  const { title, desc } =
    filter === 'draft' || filter === 'published' ? map[filter] : map.all;

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="h-10 w-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <FileEdit
          className="h-5 w-5 text-[var(--color-fg-muted)]"
          strokeWidth={1.5}
        />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <p className="font-semibold text-[var(--color-fg-strong)]">{title}</p>
        <p className="text-sm text-[var(--color-fg-muted)]">{desc}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  const accentBorder =
    tone === 'success'
      ? 'border-l-2 border-l-[var(--color-success)]'
      : tone === 'warning'
        ? 'border-l-2 border-l-[var(--color-warning)]'
        : '';
  return (
    <article
      className={`flex flex-col gap-1 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] ${accentBorder}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold flex items-center gap-1.5">
        {tone === 'warning' && (
          <AlertCircle
            className="h-3 w-3 text-[var(--color-warning)]"
            strokeWidth={1.5}
          />
        )}
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold tnum tracking-[-0.02em] text-[var(--color-fg-strong)] leading-none">
        {value}
      </p>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5 text-xs">
      <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] font-semibold">
        {label}
      </dt>
      <dd className="text-[var(--color-fg)]">{children}</dd>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
    .format(new Date(date))
    .toUpperCase()
    .replace(/\./g, '');
}
