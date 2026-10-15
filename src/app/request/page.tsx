import Link from 'next/link';
import { ArrowUpRight, Music2 } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { StationForm } from '@/components/site/StationForm';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Request a song', 'What would you like to hear on Silas Radio 91.7? Send a song request or dedicate a track to someone in your community.', '/request');
export default function RequestPage() {
  return <><PageHero eyebrow="Song requests" title="Request a song" description="Tell us the artist and the track, and who you are dedicating it to. Requests are passed to the presenter of the show you choose." breadcrumb="Request a song" /><section className="section"><div className="container contact-layout"><div className="contact-details"><p className="eyebrow">Before you send</p><h2>What to include</h2><p>Give us the artist, the song title and the name of the person it is for. Choose a show from the list so the request reaches the right presenter.</p><div className="notice"><Music2 size={20} aria-hidden="true" /><p>We cannot promise every request will make it to air, and presenters keep the final say on their playlist. Please keep dedications suitable for a general audience.</p></div><div className="related-links"><Link href="/schedule">See the weekly schedule <ArrowUpRight size={18} aria-hidden="true" /></Link><a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">Send it on WhatsApp <ArrowUpRight size={18} aria-hidden="true" /></a></div><p className="sr-meta mt-6">Your phone number is used only if we need to check something about your request.</p></div><StationForm mode="request" /></div></section></>;
}
