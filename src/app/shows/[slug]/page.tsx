import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import { SHOWS, EPISODES, getShow, getPresenter, showDays } from '@/lib/programming';
import { pageMetadata } from '@/lib/metadata';
import { Breadcrumbs, SectionHeading } from '@/components/site/PageHero';
import { LivePlayButton } from '@/components/site/PlayButtons';
import { ShowCard } from '@/components/site/Cards';

export function generateStaticParams() { return SHOWS.map((show) => ({ slug: show.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const show = getShow((await params).slug);
  if (!show) notFound();
  return pageMetadata(show.name, `${show.description} With ${show.presenter}, ${showDays(show.days)}, ${show.start} to ${show.end} EAT.`, `/shows/${show.id}`, show.image);
}
export default async function ShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const show = getShow((await params).slug);
  if (!show) notFound();
  const presenter = getPresenter(show.presenterSlug)!;
  const preview = EPISODES.find((episode) => episode.showId === show.id);
  const related = SHOWS.filter((item) => item.id !== show.id && item.category === show.category).slice(0, 3);
  const firstName = presenter.name.split(' ')[0];
  return <><section className="detail-hero"><div className="container"><Breadcrumbs items={[{ label: 'Shows', href: '/shows' }, { label: show.name }]} /><div className="detail-layout"><div><span className="tag tag--accent">{show.category} on 91.7</span><h1>{show.name}</h1><p className="detail-intro">{show.description}</p><div className="detail-meta"><span><CalendarDays size={15} aria-hidden="true" />{showDays(show.days)}</span><span><Clock3 size={15} aria-hidden="true" />{show.start} to {show.end} EAT</span></div><div className="button-row"><LivePlayButton /><Link className="button button--ghost" href="/request">Send a dedication <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div><div className="detail-image"><Image src={show.image} alt={`${show.name} with ${show.presenter}`} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div></div></div></section><section className="section"><div className="container detail-body"><div><p className="eyebrow">About this show</p><h2>How {firstName} runs it</h2><p>{show.note}</p><p>If you have a question, a story or a song for this show, send the studio a message. Presenters read contributions during the programme and pass on what they cannot fit in.</p><dl className="show-facts"><div><dt>Frequency</dt><dd>91.7 FM · Nairobi</dd></div><div><dt>Online</dt><dd>Streamed worldwide</dd></div><div><dt>Broadcast slot</dt><dd>{show.duration} · {showDays(show.days)}</dd></div><div><dt>Presenter</dt><dd><Link href={`/presenters/${presenter.slug}`}>{presenter.name}</Link></dd></div></dl><div className="related-links">{preview && <Link href={`/podcasts/${preview.slug}`}>Hear the audio preview <ArrowUpRight size={20} aria-hidden="true" /></Link>}<Link href="/schedule">See the weekly schedule <ArrowUpRight size={20} aria-hidden="true" /></Link><Link href="/contact">Send the studio a message <ArrowUpRight size={20} aria-hidden="true" /></Link></div></div><aside className="host-panel"><div className="host-panel__person"><Image src={presenter.image} alt={presenter.imageAlt} width={72} height={72} /><div><p className="eyebrow">Presenter</p><h3>{presenter.name}</h3></div></div><p>{presenter.bio}</p><Link className="text-link" href={`/presenters/${presenter.slug}`}>Full profile <ArrowUpRight size={16} aria-hidden="true" /></Link></aside></div></section>{related.length > 0 && <section className="section section--white"><div className="container"><SectionHeading eyebrow="More in this category" title="Related shows" href="/shows" linkLabel="All shows" /><div className="grid-three">{related.map((item) => <ShowCard key={item.id} show={item} />)}</div></div></section>}</>;
}
