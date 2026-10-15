import { Info } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { PodcastCatalogue } from '@/components/site/Catalogues';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Podcasts & listening library', 'On-demand audio from Silas Radio 91.7. Try the labelled sample-audio previews and explore the shows behind them.', '/podcasts', '/images/studio/turntable-closeup.jpg');
export default async function PodcastsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  return <><PageHero eyebrow="On demand" title="The listening library" description="Audio you can start whenever you like. The player at the bottom of the page keeps running while you browse." breadcrumb="Podcasts" /><section className="section"><div className="container"><PodcastCatalogue initialQuery={params.q} initialCategory={params.category} /><div className="notice"><Info size={18} aria-hidden="true" /><p><strong>A note from the studio.</strong> Every item here is a sample-audio preview supplied with the design archive, not a recording of the named show. Published episodes will appear in this library once they exist.</p></div></div></section></>;
}
