import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { pageMetadata } from '@/lib/metadata';

export const metadata = { ...pageMetadata('Listener accounts', 'Listener accounts are not available yet. You can listen to Silas Radio, browse shows and request songs without an account.', '/register'), robots: { index: false, follow: true } };
export default function RegisterPage() {
  return <><PageHero eyebrow="Part of the listening family" title="Good radio. No sign-in needed." description="You don’t need an account to find your favourite show, discover a new voice, or make yourself at home on our frequency." breadcrumb="Listener accounts" /><section className="section"><div className="container"><div className="account-notice"><Headphones size={46} aria-hidden="true" /><h2>Listener accounts aren’t open yet.</h2><p>Account features like synced favourites and listening history are not available. We’re not collecting account details or passwords. In the meantime, the station is yours to explore.</p><div className="button-row"><Link href="/listen" className="button button--primary">Open the listening room <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/newsletter" className="button button--outline">Get station updates</Link></div></div></div></section></>;
}
