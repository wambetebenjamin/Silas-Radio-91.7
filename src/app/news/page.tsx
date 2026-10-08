import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getAllNews, formatNewsDate, NEWS_REVALIDATE_SECONDS } from '@/lib/news';
import { SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';

// News is ISR-revalidated every 120 seconds.
export const revalidate = 120;

export const metadata: Metadata = {
  title: 'News and community stories',
  description:
    'Community journalism from Nairobi: transport, county services, music and the stories that shape the city, published by the Silas Radio 91.7 newsroom.',
  alternates: { canonical: '/news' },
  openGraph: {
    title: 'News and community stories | Silas Radio 91.7',
    description: 'Community journalism from Nairobi, published by the Silas Radio 91.7 newsroom.',
    type: 'website',
    url: `${SITE.url}/news`,
  },
};

export default async function NewsIndexPage() {
  const articles = await getAllNews();
  const [lead, ...rest] = articles;

  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead as="h1" eyebrow="Community desk" ghost="NEWS" title="News and community stories" />
        <p className="sr-lead mb-8">
          Reported in Nairobi, for Nairobi. Written by the presenters and producers who cover these
          streets every day, and revalidated every {NEWS_REVALIDATE_SECONDS} seconds.
        </p>

        {lead ? (
          <article className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center mb-12">
            <Image
              src={lead.image}
              alt={lead.imageAlt || lead.title}
              width={1200}
              height={750}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="rounded-[12px] object-cover w-full h-full max-h-[420px]"
              priority
            />
            <div>
              <p className="sr-meta">
                {lead.category} · {formatNewsDate(lead.date)} · {lead.readingMinutes} min read
              </p>
              <h2 className="font-heading text-[30px] font-bold text-[#111] mt-2">
                <Link href={`/news/${lead.slug}`}>{lead.title}</Link>
              </h2>
              <p className="mt-3">{lead.excerpt}</p>
              <p className="sr-meta">By {lead.author}</p>
              <Link className="sr-btn sr-btn--primary mt-3" href={`/news/${lead.slug}`}>
                Read the story
              </Link>
            </div>
          </article>
        ) : (
          <p className="sr-meta">The newsroom is preparing the first stories.</p>
        )}

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <li key={article.slug}>
              <article className="sr-news-card">
                <Image
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  width={800}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="sr-news-card__img"
                  loading="lazy"
                />
                <div className="sr-news-card__body">
                  <p className="sr-meta mb-0">
                    {article.category} · {formatNewsDate(article.date)} · {article.readingMinutes} min read
                  </p>
                  <h3>
                    <Link href={`/news/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p>{article.excerpt}</p>
                  <p className="sr-meta mb-0">By {article.author}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
