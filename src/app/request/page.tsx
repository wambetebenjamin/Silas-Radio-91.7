import Link from 'next/link';
import { ArrowUpRight, Music2 } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { StationForm } from '@/components/site/StationForm';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Request a song', 'What would you like to hear on Silas Radio 91.7? Send a song request or dedicate a track to someone in your community.', '/request');
export default function RequestPage() {
  return <><PageHero eyebrow="Make the next song yours" title="For you. For someone special." description="A favourite record can say a lot. Send us a song and a dedication, and let’s put a little feeling into the frequency." breadcrumb="Request a song" /><section className="section"><div className="container contact-layout"><div className="contact-details"><p className="eyebrow">Your voice on our playlist</p><h2>What’s your song?</h2><p>Tell us the artist, the title and who it’s for. Add your preferred show so the request can find its way to the right microphone.</p><div className="notice"><Music2 size={20} aria-hidden="true" /><p>We can’t promise every request will make it on air, but every dedication is welcome. Keep messages friendly and suitable for everyone listening.</p></div><div className="related-links"><Link href="/schedule">Find the right show <ArrowUpRight size={18} aria-hidden="true" /></Link><a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">Prefer WhatsApp? Say hello <ArrowUpRight size={18} aria-hidden="true" /></a></div><p className="sr-meta mt-6">Your phone number is used only if we need to check something about your request.</p></div><StationForm mode="request" /></div></section></>;
}
