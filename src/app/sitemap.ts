import type { MetadataRoute } from 'next';
import { SITE, PRESENTERS } from '@/lib/site';
import { SHOWS, EPISODES } from '@/lib/programming';
import { getAllNews } from '@/lib/news';

export const revalidate = 120;

/** Every entry is a real canonical page, never a hash or presenter query alias. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    '/', '/about', '/shows', '/schedule', '/presenters', '/podcasts', '/news', '/listen',
    '/studio', '/request', '/newsletter', '/advertise', '/contests', '/contact',
    '/legal/privacy-policy', '/legal/terms', '/legal/cookie-policy',
  ];
  const staticRoutes: MetadataRoute.Sitemap = pages.map((path) => ({
    url: `${SITE.url}${path}`, changeFrequency: path === '/schedule' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/legal') ? 0.3 : 0.8,
  }));
  const detailRoutes: MetadataRoute.Sitemap = [
    ...SHOWS.map((show) => `/shows/${show.id}`),
    ...PRESENTERS.map((person) => `/presenters/${person.slug}`),
    ...EPISODES.map((episode) => `/podcasts/${episode.slug}`),
  ].map((path) => ({ url: `${SITE.url}${path}`, changeFrequency: 'monthly', priority: 0.7 }));
  const newsRoutes: MetadataRoute.Sitemap = (await getAllNews()).map((article) => ({
    url: `${SITE.url}/news/${article.slug}`, lastModified: new Date(article.date), changeFrequency: 'monthly', priority: 0.7,
  }));
  return [...staticRoutes, ...detailRoutes, ...newsRoutes];
}
