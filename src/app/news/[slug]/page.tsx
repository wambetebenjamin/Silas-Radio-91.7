import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getAllNews, getNewsBySlug, formatNewsDate } from '@/lib/news';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/metadata';
import { Breadcrumbs, SectionHeading } from '@/components/site/PageHero';
import { StoryCard } from '@/components/site/Cards';

export const revalidate = 120;
export async function generateStaticParams() { return (await getAllNews()).map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getNewsBySlug((await params).slug);
  if (!article) notFound();
  const metadata = pageMetadata(article.title, article.excerpt, `/news/${article.slug}`, article.image);
  return { ...metadata, authors: [{ name: article.author }], openGraph: { ...metadata.openGraph, type: 'article', publishedTime: article.date, authors: [article.author] } };
}
export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getNewsBySlug((await params).slug);
  if (!article) notFound();
  const related = (await getAllNews()).filter((item) => item.slug !== article.slug).slice(0, 3);
  const structured = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description: article.excerpt, datePublished: article.date, author: { '@type': 'Person', name: article.author }, image: `${SITE.url}${article.image}`, mainEntityOfPage: `${SITE.url}/news/${article.slug}`, publisher: { '@id': `${SITE.url}/#station` } };
  return <><article className="section--white"><div className="container pt-7"><Breadcrumbs items={[{ label: 'Stories', href: '/news' }, { label: article.category }]} /><header className="article-heading"><span className="tag tag--purple">{article.category}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-meta"><span>By {article.author}</span><time dateTime={article.date}>{formatNewsDate(article.date)}</time><span>{article.readingMinutes} min read</span></div></header><div className="article-image"><Image src={article.image} alt={article.imageAlt || article.title} fill priority sizes="(max-width: 760px) 100vw, 90vw" /></div><div className="article-content"><div className="sr-prose"><MDXRemote source={article.content} components={{ a: ({ href, children }) => href?.startsWith('/') ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a> }} /></div><div className="article-back"><Link className="text-link" href="/news"><ArrowLeft size={16} aria-hidden="true" />All community stories</Link><Link className="text-link" href="/contact">Send a story tip <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} /></article>{related.length > 0 && <section className="section"><div className="container"><SectionHeading eyebrow="Keep the conversation going" title="More from our corner of Nairobi." /><div className="grid-three">{related.map((item) => <StoryCard key={item.slug} article={item} />)}</div></div></section>}</>;
}
