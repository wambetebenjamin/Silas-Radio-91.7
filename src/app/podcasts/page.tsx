import { Info } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { PodcastCatalogue } from '@/components/site/Catalogues';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Podcasts & listening library', 'Explore Silas Radio’s on-demand listening library. Try audio previews, discover shows and keep listening as you browse.', '/podcasts', '/images/studio/turntable-closeup.jpg');
export default async function PodcastsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  return <><PageHero eyebrow="Good company, whenever you need it" title="Your time. Your play button." description="Explore the world behind our shows. Press play and keep browsing — your audio follows you, not the other way around." breadcrumb="Podcasts" /><section className="section"><div className="container"><PodcastCatalogue initialQuery={params.q} initialCategory={params.category} /><div className="notice"><Info size={18} aria-hidden="true" /><p><strong>A note from the studio.</strong> These are sample-audio previews from the supplied design archive, not recordings of the named shows. Published episodes will appear here when they’re available.</p></div></div></section></>;
}
