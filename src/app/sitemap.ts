import type { MetadataRoute } from 'next';

import { SITE, PRESENTERS } from '@/lib/site';
import { getAllNews } from '@/lib/news';

/**
 * Dynamic sitemap: static routes + presenters + every MDX news article.
 * Regenerated with the news revalidation window.
 */
export const revalidate = 120;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const news = await getAllNews();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE.url}/#schedule`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/podcasts`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/advertise`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/contests`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/legal/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/legal/cookie-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const presenterRoutes: MetadataRoute.Sitemap = PRESENTERS.map((presenter) => ({
    url: `${SITE.url}/?presenter=${presenter.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((article) => ({
    url: `${SITE.url}/news/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...presenterRoutes, ...newsRoutes];
}
