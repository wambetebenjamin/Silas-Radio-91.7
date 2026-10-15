import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CommunityBanner() {
  return <section className="community-band"><div className="container"><div><h2>Send us a story, a song or a tip</h2><p>If there is something the city should hear, the studio is open.</p></div><Link className="button button--primary" href="/contact">Contact the studio <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section>;
}
