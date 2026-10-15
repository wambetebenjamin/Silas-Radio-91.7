import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ShowCatalogue } from '@/components/site/Catalogues';
import { CommunityBanner } from '@/components/site/CommunityBanner';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Our shows', 'The ten programmes on Silas Radio 91.7: music, culture and community shows from Nairobi, with presenters, categories and broadcast times.', '/shows');

export default async function ShowsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  return <><PageHero eyebrow="Ten programmes" title="What’s on Silas Radio" description="Browse by category or search by name. Each show page lists its presenter and the days it goes out." breadcrumb="Shows"><Link className="text-link" href="/schedule">See when we’re on air <ArrowUpRight size={16} aria-hidden="true" /></Link></PageHero><section className="section"><div className="container"><ShowCatalogue initialQuery={params.q} initialCategory={params.category} /></div></section><CommunityBanner /></>;
}
