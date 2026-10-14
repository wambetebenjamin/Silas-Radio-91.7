'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { EPISODES, SHOWS } from '@/lib/programming';
import { EpisodeCard, ShowCard, StoryCard, type ArticleSummary } from './Cards';

function useFilters(initialQuery: string, initialCategory: string) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const update = (nextQuery: string, nextCategory: string) => {
    setQuery(nextQuery); setCategory(nextCategory);
    const url = new URL(window.location.href);
    if (nextQuery.trim()) url.searchParams.set('q', nextQuery); else url.searchParams.delete('q');
    if (nextCategory !== 'all') url.searchParams.set('category', nextCategory); else url.searchParams.delete('category');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };
  return { query, category, update };
}

function Filters({ categories, allLabel, query, category, update, searchLabel }: {
  categories: string[]; allLabel: string; query: string; category: string;
  update: (query: string, category: string) => void; searchLabel: string;
}) {
  return <div className="catalogue-filters"><div className="filter-buttons" role="group" aria-label="Filter by category"><button type="button" aria-pressed={category === 'all'} onClick={() => update(query, 'all')}>{allLabel}</button>{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => update(query, item)}>{item}</button>)}</div><label className="search-field"><Search size={16} aria-hidden="true" /><span className="sr-only">{searchLabel}</span><input type="search" value={query} placeholder={searchLabel} onChange={(event) => update(event.target.value, category)} /></label></div>;
}

function NoResults({ clear }: { clear: () => void }) {
  return <div className="empty-state"><h3>Nothing on this frequency yet.</h3><p>Try another search or explore a different category.</p><button type="button" className="button button--outline" onClick={clear}>Clear filters</button></div>;
}

export function ShowCatalogue({ initialQuery = '', initialCategory = 'all' }: { initialQuery?: string; initialCategory?: string }) {
  const filters = useFilters(initialQuery, ['Music', 'Community', 'Culture'].includes(initialCategory) ? initialCategory : 'all');
  const visible = SHOWS.filter((show) => (filters.category === 'all' || show.category === filters.category) && `${show.name} ${show.presenter} ${show.description}`.toLowerCase().includes(filters.query.toLowerCase().trim()));
  return <><Filters {...filters} categories={['Music', 'Community', 'Culture']} allLabel="All shows" searchLabel="Find a show or presenter" /><p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'show' : 'shows'} on your frequency</p><div className="grid-three catalogue-grid">{visible.map((show) => <ShowCard key={show.id} show={show} />)}{!visible.length && <NoResults clear={() => filters.update('', 'all')} />}</div></>;
}

export function PodcastCatalogue({ initialQuery = '', initialCategory = 'all' }: { initialQuery?: string; initialCategory?: string }) {
  const filters = useFilters(initialQuery, ['Music', 'Community', 'Culture'].includes(initialCategory) ? initialCategory : 'all');
  const visible = EPISODES.filter((episode) => (filters.category === 'all' || episode.category === filters.category) && `${episode.title} ${SHOWS.find((show) => show.id === episode.showId)?.name}`.toLowerCase().includes(filters.query.toLowerCase().trim()));
  return <><Filters {...filters} categories={['Music', 'Community', 'Culture']} allLabel="All previews" searchLabel="Search the listening library" /><p className="result-count" role="status">{visible.length} audio {visible.length === 1 ? 'preview' : 'previews'}</p><div className="grid-three catalogue-grid">{visible.map((episode) => <EpisodeCard key={episode.slug} episode={episode} />)}{!visible.length && <NoResults clear={() => filters.update('', 'all')} />}</div></>;
}

export function NewsCatalogue({ articles, initialQuery = '', initialCategory = 'all' }: { articles: ArticleSummary[]; initialQuery?: string; initialCategory?: string }) {
  const categories = Array.from(new Set(articles.map((article) => article.category)));
  const filters = useFilters(initialQuery, categories.includes(initialCategory) ? initialCategory : 'all');
  const visible = articles.filter((article) => (filters.category === 'all' || article.category === filters.category) && `${article.title} ${article.excerpt} ${article.author}`.toLowerCase().includes(filters.query.toLowerCase().trim()));
  const showFeature = filters.category === 'all' && !filters.query.trim();
  const lead = showFeature ? visible[0] : null;
  const rest = lead ? visible.slice(1) : visible;
  return <><Filters {...filters} categories={categories} allLabel="All stories" searchLabel="Search community stories" /><p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'story' : 'stories'} from the community desk</p>{lead && <article className="news-feature"><Link className="news-feature__image" href={`/news/${lead.slug}`} aria-label={`Read ${lead.title}`}><Image src={lead.image} alt={lead.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 55vw" /><span className="image-tag">The lead story</span></Link><div><p className="eyebrow">{lead.category} · {lead.readingMinutes} min read</p><h2><Link href={`/news/${lead.slug}`}>{lead.title}</Link></h2><p>{lead.excerpt}</p><p className="sr-meta">By {lead.author} · {new Date(lead.date).toLocaleDateString('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Nairobi' })}</p><Link className="button button--primary" href={`/news/${lead.slug}`}>Read the story <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article>}<div className="grid-three catalogue-grid">{rest.map((article) => <StoryCard key={article.slug} article={article} />)}{!visible.length && <NoResults clear={() => filters.update('', 'all')} />}</div></>;
}
