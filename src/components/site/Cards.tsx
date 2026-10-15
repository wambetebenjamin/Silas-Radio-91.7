import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { showDays, type Episode, type Show, getShow } from '@/lib/programming';
import type { Presenter } from '@/lib/site';
import type { NewsArticle } from '@/lib/news';
import { EpisodePlayButton } from './PlayButtons';

export function ShowCard({ show }: { show: Show }) {
  return (
    <article className="show-card">
      <Link href={`/shows/${show.id}`} className="show-card__image" aria-label={`Explore ${show.name}`}>
        <Image src={show.image} alt={`${show.name} with ${show.presenter}`} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" />
        <span className="image-tag">{show.category}</span><span className="circle-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
      </Link>
      <div className="show-card__meta"><span>{showDays(show.days)}</span><span>{show.start}–{show.end} EAT</span></div>
      <h3><Link href={`/shows/${show.id}`}>{show.name}</Link></h3><p>With {show.presenter}</p>
    </article>
  );
}

export function PresenterCard({ presenter }: { presenter: Presenter }) {
  return (
    <article className="presenter-card">
      <Link href={`/presenters/${presenter.slug}`} className="presenter-card__image" aria-label={`Meet ${presenter.name}`}><Image src={presenter.image} alt={presenter.imageAlt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" /><span className="circle-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span></Link>
      <p className="eyebrow">{presenter.showDays}</p><h3><Link href={`/presenters/${presenter.slug}`}>{presenter.name}</Link></h3><p>{presenter.show}</p>
    </article>
  );
}

export type ArticleSummary = Omit<NewsArticle, 'content'>;
export function StoryCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="story-card">
      <Link href={`/news/${article.slug}`} className="story-card__image" aria-label={`Read ${article.title}`}><Image src={article.image} alt={article.imageAlt || article.title} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span className="image-tag">{article.category}</span></Link>
      <p className="story-card__meta"><time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' })}</time><span><Clock3 size={12} aria-hidden="true" />{article.readingMinutes} min read</span></p>
      <h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link href={`/news/${article.slug}`} className="text-link">Read the story <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </article>
  );
}

export function EpisodeCard({ episode }: { episode: Episode }) {
  const show = getShow(episode.showId)!;
  return (
    <article className="episode-card">
      <div className="episode-card__cover"><Image src={episode.image} alt={`Audio preview artwork for ${show.name}`} fill sizes="(max-width: 600px) 100vw, 33vw" /><span className="episode-card__number">{episode.number}</span><span className="image-tag">Audio preview</span><EpisodePlayButton episode={episode} iconOnly /></div>
      <p className="eyebrow">{show.name}</p><h3><Link href={`/podcasts/${episode.slug}`}>{episode.title}</Link></h3><p>{show.presenter} <span aria-hidden="true">·</span> Sample audio only</p><Link href={`/podcasts/${episode.slug}`} className="text-link">About this preview <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </article>
  );
}
