import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CommunityBanner() {
  return <section className="community-band"><div className="container"><div><h2>A station with a place for you.</h2><p>Have a story, a song, or something the city should hear? We’re listening.</p></div><Link className="button button--primary" href="/contact">Let’s start a conversation <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section>;
}
