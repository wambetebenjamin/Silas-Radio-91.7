import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Calendar, User } from 'lucide-react';

import { formatNewsDate, getAllNews, getNewsBySlug } from '@/lib/news';
import { SITE } from '@/lib/site';

// News articles are ISR-revalidated every 120 seconds.
export const revalidate = 120;

export async function generateStaticParams() {
  const articles = await getAllNews();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: 'Story not found' };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    authors: [{ name: article.author }],
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url: `${SITE.url}/news/${article.slug}`,
      siteName: SITE.name,
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image, width: 1200, height: 630, alt: article.imageAlt || article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => <table {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      style={{
        borderLeft: '3px solid #5c00ce',
        margin: '20px 0',
        padding: '4px 0 4px 18px',
        color: '#333',
        fontStyle: 'italic',
      }}
    />
  ),
};

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const all = await getAllNews();
  const related = all.filter((item) => item.slug !== article.slug).slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@id': `${SITE.url}/#station` },
    image: [`${SITE.url}${article.image}`],
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/news/${article.slug}` },
    articleSection: article.category,
    inLanguage: 'en-KE',
  };

  return (
    <article className="spad" style={{ background: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="sr-container">
        <nav aria-label="Breadcrumb" className="sr-meta mb-4">
          <Link href="/news">News</Link> · {article.category}
        </nav>

        <header className="max-w-[76ch]">
          <h1 className="font-heading text-[clamp(28px,5vw,46px)] font-bold text-[#111] leading-tight">
            {article.title}
          </h1>
          <p className="sr-lead mt-3">{article.excerpt}</p>
          <p className="sr-meta flex flex-wrap items-center gap-4 mt-4">
            <span className="flex items-center gap-2">
              <User size={13} aria-hidden="true" /> {article.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={13} aria-hidden="true" />
              <time dateTime={article.date}>{formatNewsDate(article.date)}</time>
            </span>
            <span>{article.readingMinutes} min read</span>
          </p>
        </header>

        <Image
          src={article.image}
          alt={article.imageAlt || article.title}
          width={1200}
          height={700}
          sizes="(max-width: 1024px) 100vw, 900px"
          className="rounded-[12px] my-8 w-full object-cover max-h-[520px]"
          priority
        />

        <div className="sr-prose">
          <MDXRemote source={article.content} components={mdxComponents} />
        </div>

        {related.length ? (
          <section className="mt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-heading text-[24px] font-bold text-[#111] mb-4">
              More from the newsroom
            </h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <article className="sr-news-card">
                    <div className="sr-news-card__body">
                      <p className="sr-meta mb-0">
                        {item.category} · {formatNewsDate(item.date)}
                      </p>
                      <h3>
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p>{item.excerpt}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
