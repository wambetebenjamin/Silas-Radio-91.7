import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Info } from 'lucide-react';
import { EPISODES, getEpisode, getShow } from '@/lib/programming';
import { pageMetadata } from '@/lib/metadata';
import { Breadcrumbs, SectionHeading } from '@/components/site/PageHero';
import { EpisodePlayButton } from '@/components/site/PlayButtons';
import { EpisodeCard } from '@/components/site/Cards';

export function generateStaticParams() { return EPISODES.map((episode) => ({ slug: episode.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const episode = getEpisode((await params).slug);
  if (!episode) notFound();
  return pageMetadata(episode.title, episode.description, `/podcasts/${episode.slug}`, episode.image);
}
export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const episode = getEpisode((await params).slug);
  if (!episode) notFound();
  const show = getShow(episode.showId)!;
  return <><section className="detail-hero"><div className="container"><Breadcrumbs items={[{ label: 'Podcasts', href: '/podcasts' }, { label: show.name }]} /><div className="detail-layout"><div><span className="tag tag--accent">Audio preview · {episode.number}</span><h1>{episode.title}</h1><p className="detail-intro">{episode.description}</p><div className="detail-meta"><Link href={`/shows/${show.id}`}>{show.name}</Link><Link href={`/presenters/${show.presenterSlug}`}>With {show.presenter}</Link></div><div className="button-row"><EpisodePlayButton episode={episode} /><Link href={`/shows/${show.id}`} className="button button--ghost">About the show <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div><div className="detail-image"><Image src={episode.image} alt={`Audio preview artwork for ${show.name}`} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div></div></div></section><section className="section"><div className="container detail-body"><div><p className="eyebrow">About this audio</p><h2>What the player can do</h2><p>The player stays with you as you move around the site. You can pause, skip back 15 seconds, change the playback speed, or drag the progress bar to pick up where you left off.</p><div className="notice"><Info size={18} aria-hidden="true" /><p>This is sample music supplied with the design template. It demonstrates the on-demand player and is <strong>not an episode or a recording of {show.name}</strong>.</p></div><p>To hear the station instead, switch back to radio in the listening room.</p><Link href="/listen" className="text-link">Back to radio <ArrowUpRight size={16} aria-hidden="true" /></Link></div><aside className="host-panel"><p className="eyebrow">The programme</p><h3>{show.name}</h3><p className="mt-4">{show.description}</p><Link href={`/shows/${show.id}`} className="text-link">See the show page <ArrowUpRight size={16} aria-hidden="true" /></Link><br /><Link href={`/presenters/${show.presenterSlug}`} className="text-link">About {show.presenter.split(' ')[0]} <ArrowUpRight size={16} aria-hidden="true" /></Link></aside></div></section><section className="section section--white"><div className="container"><SectionHeading eyebrow="More previews" title="Other items in the library" href="/podcasts" linkLabel="All audio previews" /><div className="grid-three">{EPISODES.filter((item) => item.slug !== episode.slug).map((item) => <EpisodeCard key={item.slug} episode={item} />)}</div></div></section></>;
}
