import { allPosts, type Post } from 'content-collections';

export type { Post };

export const POSTS_PER_PAGE = 12;

const isProd = process.env.NODE_ENV === 'production';

export const POST_CATEGORIES = [
  'diseno-web',
  'saas',
  'ecommerce',
  'seo',
  'mantenimiento',
  'branding',
  'casos',
  'agencia',
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  'diseno-web': 'Diseño web',
  saas: 'SaaS',
  ecommerce: 'Ecommerce',
  seo: 'SEO',
  mantenimiento: 'Mantenimiento',
  branding: 'Branding',
  casos: 'Casos',
  agencia: 'Agencia',
};

/** Posts publicados ordenados por fecha desc. Excluye drafts en producción. */
export const publishedPosts: Post[] = allPosts
  .filter((p) => !isProd || !p.draft)
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

/**
 * Todos los posts (incluyendo drafts) ordenados por fecha desc.
 * Solo para uso en el backoffice (`/admin/contenido`).
 */
export const allPostsForAdmin: Post[] = [...allPosts].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export function getPostBySlug(slug: string): Post | undefined {
  return publishedPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: PostCategory): Post[] {
  return publishedPosts.filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return publishedPosts.filter((p) => p.tags.includes(tag));
}

export function getAllTags(): string[] {
  const tagCounts = new Map<string, number>();
  for (const post of publishedPosts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagCounts.keys()).sort();
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const candidates = publishedPosts.filter((p) => p.slug !== post.slug);
  // Score: same category +3, tag match +1
  const scored = candidates.map((p) => {
    let score = 0;
    if (p.category === post.category) score += 3;
    score += p.tags.filter((t) => post.tags.includes(t)).length;
    return { post: p, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function paginatePosts(posts: Post[], page: number): {
  items: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
} {
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const items = posts.slice(start, start + POSTS_PER_PAGE);
  return { items, total, totalPages, currentPage };
}
