import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ShowCatalogue } from '@/components/site/Catalogues';
import { CommunityBanner } from '@/components/site/CommunityBanner';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Our shows', 'Find your kind of radio. Explore Silas Radio’s music, culture and community programmes and meet the voices behind them.', '/shows');

export default async function ShowsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  return <><PageHero eyebrow="Ten shows. One city. Your frequency." title="Find your kind of radio." description="From the early commute to the small hours. Familiar voices, fresh discoveries, and a little something for every side of Nairobi." breadcrumb="Shows"><Link className="text-link" href="/schedule">See when we’re on air <ArrowUpRight size={16} aria-hidden="true" /></Link></PageHero><section className="section"><div className="container"><ShowCatalogue initialQuery={params.q} initialCategory={params.category} /></div></section><CommunityBanner /></>;
}
