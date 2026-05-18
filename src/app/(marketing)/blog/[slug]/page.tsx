import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { MDXContent } from '@content-collections/mdx/react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CtaBlock } from '@/components/marketing/cta-block';
import { mdxComponents } from '@/components/marketing/mdx-components';
import {
  CATEGORY_LABELS,
  getPostBySlug,
  getRelatedPosts,
  publishedPosts,
} from '@/lib/blog';

export function generateStaticParams() {
  return publishedPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post no encontrado' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: [...post.tags],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);

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
              <BreadcrumbLink asChild>
                <Link href="/blog">Blog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HEADER */}
      <article>
        <header className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] py-10 md:py-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/blog?cat=${post.category}`}
              className="inline-flex items-center gap-1 transition-colors"
            >
              <Badge variant="outline" className="hover:border-[var(--color-fg-muted)]">
                {CATEGORY_LABELS[post.category]}
              </Badge>
            </Link>
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-[1.1] max-w-3xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
            {post.description}
          </p>

          <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-[var(--color-border)] py-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" strokeWidth={1.5} />
              <dt className="sr-only">Publicado</dt>
              <dd>
                <time dateTime={post.publishedAt}>{formatLong(post.publishedAt)}</time>
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" strokeWidth={1.5} />
              <dt className="sr-only">Autor</dt>
              <dd>{post.author}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              <dt className="sr-only">Tiempo de lectura</dt>
              <dd>{post.readingTime} min</dd>
            </div>
          </dl>
        </header>

        {/* BODY */}
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] pb-16">
          <div className="max-w-[var(--container-prose)] mx-auto md:mx-0 [&>*:first-child]:mt-0">
            <MDXContent code={post.body} components={mdxComponents} />
          </div>
        </div>
      </article>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16">
          <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold mb-3">
              SIGUE LEYENDO
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight mb-8 max-w-2xl">
              Posts relacionados.
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col h-full gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-fg-muted)]"
                  >
                    <Badge variant="outline" className="self-start">
                      {CATEGORY_LABELS[p.category]}
                    </Badge>
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-snug flex-1 group-hover:text-[var(--color-accent)] transition-colors">
                      {p.title}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] mt-auto">
                      {p.readingTime} MIN · {formatShort(p.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* NAV BACK */}
      <section className="border-t border-[var(--color-border)] py-10">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)] flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Volver al blog
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors"
          >
            Hablar con el equipo
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="mx-auto w-full max-w-[var(--container-2xl)] px-[var(--container-padding)]">
          <CtaBlock
            eyebrow="¿TE HEMOS AYUDADO?"
            title={
              <>
                Si esto encaja con un caso real,
                <br />
                <span className="text-[var(--color-fg-muted)]">
                  hablemos del tuyo.
                </span>
              </>
            }
            description="Auditoría sin compromiso. Si encaja, te hacemos propuesta concreta."
            primaryCta={{ label: 'Solicitar propuesta', href: '/contacto' }}
            secondaryCta={{ label: 'hola@wyweb.es', href: 'mailto:hola@wyweb.es' }}
          />
        </div>
      </section>

      {/* JSON-LD Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Wyweb',
              url: 'https://wyweb.es',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://wyweb.es/blog/${post.slug}`,
            },
            keywords: post.tags.join(', '),
            articleSection: CATEGORY_LABELS[post.category],
          }),
        }}
      />
    </>
  );
}

function formatLong(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(new Date(iso))
    .toUpperCase();
}

function formatShort(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(iso))
    .toUpperCase();
}
