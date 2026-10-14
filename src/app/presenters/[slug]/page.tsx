import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { PRESENTERS } from '@/lib/site';
import { SHOWS, getPresenter } from '@/lib/programming';
import { pageMetadata } from '@/lib/metadata';
import { Breadcrumbs, SectionHeading } from '@/components/site/PageHero';
import { ShowCard } from '@/components/site/Cards';

export function generateStaticParams() { return PRESENTERS.map((person) => ({ slug: person.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const presenter = getPresenter((await params).slug);
  if (!presenter) notFound();
  return pageMetadata(presenter.name, presenter.bio, `/presenters/${presenter.slug}`, presenter.image);
}
export default async function PresenterPage({ params }: { params: Promise<{ slug: string }> }) {
  const presenter = getPresenter((await params).slug);
  if (!presenter) notFound();
  const shows = SHOWS.filter((show) => show.presenterSlug === presenter.slug);
  return <><section className="detail-hero"><div className="container"><Breadcrumbs items={[{ label: 'Presenters', href: '/presenters' }, { label: presenter.name }]} /><div className="detail-layout"><div><p className="eyebrow">Behind the microphone</p><h1>{presenter.name}</h1><p className="detail-intro">{presenter.bio}</p><div className="detail-meta"><span>{presenter.showDays}</span><span>{presenter.showTimes}</span></div><div className="button-row"><Link className="button button--lime" href="/request">Send a shout-out <ArrowUpRight size={16} aria-hidden="true" /></Link><a className="button button--ghost" href={presenter.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={16} aria-hidden="true" />Follow the station</a></div></div><div className="detail-image detail-image--portrait"><Image src={presenter.image} alt={presenter.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div></div></div></section><section className="section"><div className="container"><SectionHeading eyebrow={`In the studio with ${presenter.name.split(' ')[0]}`} title={shows.length ? 'Find me on your radio.' : 'A little more time with the story.'} href="/presenters" linkLabel="All presenters" />{shows.length ? <div className="grid-three">{shows.map((show) => <ShowCard key={show.id} show={show} />)}</div> : <div className="detail-body"><div><p>At the podcast desk, Otieno works on the conversations that deserve a second listen. Discover the listening library and keep an eye out for new studio sessions.</p><Link href="/podcasts" className="button button--primary">Explore the listening library <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div>}</div></section><section className="community-band"><div className="container"><div><h2>Bring a familiar voice to your event.</h2><p>Talk to our team about presenter appearances, partnerships and live reads.</p></div><Link href={presenter.bookEventsHref} className="button button--primary">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section></>;
}
