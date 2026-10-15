import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { pageMetadata } from '@/lib/metadata';

export const metadata = { ...pageMetadata('Listener accounts', 'Listener accounts are not available yet. You can listen to Silas Radio, browse shows and request songs without an account.', '/register'), robots: { index: false, follow: true } };
export default function RegisterPage() {
  return <><PageHero eyebrow="Listener accounts" title="Listen without an account" description="Browsing the shows, reading the schedule and sending a request do not require a sign-in." breadcrumb="Listener accounts" /><section className="section"><div className="container"><div className="account-notice"><Headphones size={46} aria-hidden="true" /><h2>Listener accounts are not open yet</h2><p>Features such as synced favourites and listening history are not available, so we are not collecting account details or passwords. Everything currently on the site is open to browse without signing in.</p><div className="button-row"><Link href="/listen" className="button button--primary">Open the listening room <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/newsletter" className="button button--outline">Get station updates</Link></div></div></div></section></>;
}
