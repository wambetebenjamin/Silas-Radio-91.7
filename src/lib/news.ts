import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * MDX news + community stories.
 *
 * Files live in /content/news/*.mdx. The list and detail pages are statically
 * generated with ISR revalidate 120 (see src/app/news/page.tsx and
 * src/app/news/[slug]/page.tsx).
 */

export const NEWS_REVALIDATE_SECONDS = 120;
export const NEWS_DIR = path.join(process.cwd(), 'content', 'news');

export interface NewsFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  category: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
}

export interface NewsArticle extends NewsFrontmatter {
  content: string;
  readingMinutes: number;
}

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function getAllNews(): Promise<NewsArticle[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(NEWS_DIR);
  } catch {
    return [];
  }

  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(NEWS_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        const fm = data as Partial<NewsFrontmatter>;
        return {
          title: fm.title ?? 'Untitled',
          slug: fm.slug ?? file.replace(/\.mdx$/, ''),
          date: fm.date ?? '1970-01-01',
          author: fm.author ?? 'Silas Radio Newsroom',
          excerpt: fm.excerpt ?? '',
          category: fm.category ?? 'Community',
          image: fm.image ?? '/images/culture/nairobi-skyline.jpg',
          imageAlt: fm.imageAlt ?? '',
          featured: Boolean(fm.featured),
          content,
          readingMinutes: estimateReadingMinutes(content),
        } satisfies NewsArticle;
      }),
  );

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const all = await getAllNews();
  return all.find((article) => article.slug === slug) ?? null;
}

export function formatNewsDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}
