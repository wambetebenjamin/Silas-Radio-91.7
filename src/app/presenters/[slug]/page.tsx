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
  const firstName = presenter.name.split(' ')[0];
  return <><section className="detail-hero"><div className="container"><Breadcrumbs items={[{ label: 'Presenters', href: '/presenters' }, { label: presenter.name }]} /><div className="detail-layout"><div><p className="eyebrow">Presenter</p><h1>{presenter.name}</h1><p className="detail-intro">{presenter.bio}</p><div className="detail-meta"><span>{presenter.showDays}</span><span>{presenter.showTimes}</span></div><div className="button-row"><Link className="button button--accent" href="/request">Send a shout-out <ArrowUpRight size={16} aria-hidden="true" /></Link><a className="button button--ghost" href={presenter.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={16} aria-hidden="true" />Follow the station</a></div></div><div className="detail-image detail-image--portrait"><Image src={presenter.image} alt={presenter.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div></div></div></section><section className="section"><div className="container"><SectionHeading eyebrow={`Shows hosted by ${firstName}`} title={shows.length ? `Where to hear ${firstName}` : 'Production work'} href="/presenters" linkLabel="All presenters" />{shows.length ? <div className="grid-three">{shows.map((show) => <ShowCard key={show.id} show={show} />)}</div> : <div className="detail-body"><div><p>Otieno works at the podcast desk, producing the studio conversations that deserve a second listen. See the listening library for what is published, and watch for new sessions.</p><Link href="/podcasts" className="button button--primary">Open the listening library <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div>}</div></section><section className="community-band"><div className="container"><div><h2>Book a presenter for your event</h2><p>Presenter appearances, live reads and event partnerships are arranged through our advertising team.</p></div><Link href={presenter.bookEventsHref} className="button button--primary">Enquire about a booking <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section></>;
}
