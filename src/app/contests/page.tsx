import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Ticket } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CONTESTS } from '@/lib/contests';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Contests & giveaways', 'Stay up to date with Silas Radio 91.7 giveaways, read the contest rules and explore past prizes.', '/contests');
export default function ContestsPage() {
  const contest = CONTESTS[0];
  return <><PageHero eyebrow="A little extra for our listening family" title="Good things come to listeners." description="Music, memories and a reason to keep your radio close. Find out what’s happening with giveaways on your frequency." breadcrumb="Contests & giveaways" /><section className="section"><div className="container"><div className="notice"><Ticket size={20} aria-hidden="true" /><p><strong>No contests are accepting entries right now.</strong> We’ll share the next giveaway on air and through the weekly playlist.</p></div><article className="contest-feature"><div className="contest-feature__image"><Image src="/images/studio/turntable-closeup.jpg" alt="A vinyl record on a turntable" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="contest-feature__copy"><span className="tag tag--lime">From the archive · Entries closed</span><h2>{contest.title}</h2><p>{contest.prize}</p><p>Entries closed on 5 December 2025 at 21:00 EAT. This giveaway is kept here for reference; we are not collecting new entries.</p><Link className="text-link" href="/legal/terms#contest-terms">Read the contest terms <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article></div></section><section className="community-band"><div className="container"><div><h2>Don’t miss the next good thing.</h2><p>Join the weekly playlist for station news and upcoming giveaways.</p></div><Link href="/newsletter" className="button button--primary">Keep me in the loop <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section></>;
}
