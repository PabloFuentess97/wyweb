import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import { z } from 'zod';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/blog',
  include: '**/*.mdx',
  schema: z.object({
    content: z.string(),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(300),
    publishedAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    author: z.string(),
    category: z.enum([
      'diseno-web',
      'saas',
      'ecommerce',
      'seo',
      'mantenimiento',
      'branding',
      'casos',
      'agencia',
    ]),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
  transform: async (post, ctx) => {
    const body = await compileMDX(ctx, post);
    const slug = post._meta.path.replace(/\.mdx$/, '');
    return {
      ...post,
      slug,
      body,
      readingTime: estimateReadingTime(post.content),
    };
  },
});

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 220;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export default defineConfig({
  content: [posts],
});
