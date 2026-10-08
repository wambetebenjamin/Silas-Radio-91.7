import { NextResponse } from 'next/server';
import { NEWS_REVALIDATE_SECONDS, getAllNews } from '@/lib/news';

// ISR revalidate 120 for news (see NEWS_REVALIDATE_SECONDS for the value).
export const revalidate = 120;

/**
 * GET /api/news — MDX articles as JSON.
 *
 * The HTML pages (/news and /news/[slug]) are generated statically with
 * ISR revalidate 120; this endpoint exposes the same content to clients and
 * lets an external dashboard verify what is published.
 *
 * Query params:
 *   ?limit=6       — cap the number of items
 *   ?category=...  — filter by frontmatter category
 *   ?slug=...      — return a single article body
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? 0);
  const category = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');

  const articles = await getAllNews();

  if (slug) {
    const article = articles.find((item) => item.slug === slug);
    if (!article) {
      return NextResponse.json({ ok: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(
      { ok: true, article },
      { headers: { 'Cache-Control': `s-maxage=${NEWS_REVALIDATE_SECONDS}, stale-while-revalidate=60` } },
    );
  }

  let items = articles;
  if (category) {
    items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }
  if (limit > 0) items = items.slice(0, limit);

  return NextResponse.json(
    {
      ok: true,
      count: items.length,
      revalidateSeconds: NEWS_REVALIDATE_SECONDS,
      items,
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${NEWS_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    },
  );
}
