import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CATEGORY_LABELS, POST_CATEGORIES, paginatePosts, publishedPosts, type PostCategory } from '@/lib/blog';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog · Notas técnicas, casos y aprendizajes',
  description:
    'Conectividad, redes, IoT, telefonía IP. Notas técnicas y casos reales del equipo de Wyweb.',
  alternates: { canonical: '/blog' },
};

type SearchParams = {
  page?: string;
  cat?: string;
  tag?: string;
};

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pageNum = Number.parseInt(params.page ?? '1', 10);
  const category = params.cat as PostCategory | undefined;
  const tag = params.tag;

  let filtered = publishedPosts;
  if (category && (POST_CATEGORIES as readonly string[]).includes(category)) {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (tag) {
    filtered = filtered.filter((p) => p.tags.includes(tag));
  }

  const { items, totalPages, currentPage, total } = paginatePosts(filtered, pageNum);

  const buildHref = (next: Partial<SearchParams>) => {
    const sp = new URLSearchParams();
    if (next.cat ?? params.cat) sp.set('cat', (next.cat ?? params.cat)!);
    if (next.tag ?? params.tag) sp.set('tag', (next.tag ?? params.tag)!);
    if (next.page) sp.set('page', next.page);
    const q = sp.toString();
    return q ? `/blog?${q}` : '/blog';
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] pt-8 md:pt-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-16 md:py-20 flex flex-col gap-6 max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)] flex items-center gap-2">
            <span>00</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" aria-hidden />
            <span>BLOG · DESDE EL TALLER</span>
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-[var(--color-fg-strong)] leading-[1.04]">
            Notas técnicas, casos y aprendizajes.
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-3xl">
            Lo que aprendemos en cada despliegue. Sin SEO basura, sin recetas genéricas:
            decisiones reales y los criterios que aplicamos al tomarlas.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="relative border-t border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-6">
          <nav className="flex flex-wrap items-center gap-2" aria-label="Filtrar por categoría">
            <Link
              href={buildHref({ cat: undefined, page: undefined })}
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] border text-sm font-medium transition-colors',
                !category
                  ? 'bg-[var(--color-fg-strong)] text-[var(--color-bg)] border-[var(--color-fg-strong)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]',
              )}
            >
              Todos
              <span className="ml-2 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                {publishedPosts.length}
              </span>
            </Link>
            {POST_CATEGORIES.map((c) => {
              const count = publishedPosts.filter((p) => p.category === c).length;
              if (count === 0) return null;
              const active = category === c;
              return (
                <Link
                  key={c}
                  href={buildHref({ cat: c, page: undefined })}
                  className={cn(
                    'inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] border text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--color-fg-strong)] text-[var(--color-bg)] border-[var(--color-fg-strong)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]',
                  )}
                >
                  {CATEGORY_LABELS[c]}
                  <span className="ml-2 font-mono text-[10px] tnum text-[var(--color-fg-subtle)]">
                    {count}
                  </span>
                </Link>
              );
            })}
            {tag && (
              <Link
                href={buildHref({ tag: undefined, page: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] border border-[var(--color-accent)] text-[var(--color-accent)] bg-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] text-sm font-medium hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,var(--color-surface))]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
                  TAG
                </span>
                <span>{tag}</span>
                <span className="font-mono text-[11px] opacity-70" aria-hidden>
                  ×
                </span>
              </Link>
            )}
          </nav>
        </div>
      </section>

      {/* LIST */}
      <section className="relative pb-16">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          {items.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] p-12 text-center bg-[var(--color-bg-subtle)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mb-2">
                NO HAY POSTS
              </p>
              <p className="text-base text-[var(--color-fg)]">
                No hay artículos con estos filtros.{' '}
                <Link
                  href="/blog"
                  className="text-[var(--color-accent)] hover:underline underline-offset-4"
                >
                  Quitar filtros
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((post, i) => {
                const offset = (currentPage - 1) * 12 + i + 1;
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col h-full gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-fg-muted)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
                    >
                      <header className="flex items-center justify-between">
                        <Badge variant="outline">{CATEGORY_LABELS[post.category]}</Badge>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold">
                          {String(offset).padStart(3, '0')}
                        </span>
                      </header>
                      <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-snug flex-1 group-hover:text-[var(--color-accent)] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed line-clamp-3">
                        {post.description}
                      </p>
                      <footer className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-auto">
                        <time dateTime={post.publishedAt}>
                          {formatPostDate(post.publishedAt)}
                        </time>
                        <span>{post.readingTime} min lectura</span>
                      </footer>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-between border-t border-[var(--color-border)] pt-6"
              aria-label="Paginación"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                PÁGINA {currentPage} / {totalPages} · {total} POSTS
              </p>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildHref({ page: String(currentPage - 1) })}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm hover:border-[var(--color-fg-muted)] transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Anterior
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm text-[var(--color-fg-subtle)] opacity-45 cursor-not-allowed">
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Anterior
                  </span>
                )}
                {currentPage < totalPages ? (
                  <Link
                    href={buildHref({ page: String(currentPage + 1) })}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm hover:border-[var(--color-fg-muted)] transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-2)] border border-[var(--color-border)] text-sm text-[var(--color-fg-subtle)] opacity-45 cursor-not-allowed">
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                )}
              </div>
            </nav>
          )}
        </div>
      </section>

      {/* CTA suave */}
      <section className="relative pb-16">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
                ¿TE INTERESA UN TEMA?
              </p>
              <p className="text-base text-[var(--color-fg)] leading-relaxed">
                Sugiere temas o pregúntanos por casos concretos. Solemos contestar.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors self-start"
            >
              Escribir al equipo
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(iso))
    .toUpperCase();
}
