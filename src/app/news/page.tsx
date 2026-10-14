import { PageHero } from '@/components/site/PageHero';
import { NewsCatalogue } from '@/components/site/Catalogues';
import { getAllNews } from '@/lib/news';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Community stories', 'Stories, music and conversations from Nairobi, published by the Silas Radio 91.7 community desk.', '/news', '/images/culture/nairobi-expressway.jpg');
export const revalidate = 120;
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const articles = (await getAllNews()).map(({ content, ...summary }) => { void content; return summary; });
  return <><PageHero eyebrow="From the community desk" title="The city has a story." description="The people making things happen. The music bringing us together. A closer look at life on our side of the frequency." breadcrumb="Stories" /><section className="section section--white"><div className="container"><NewsCatalogue articles={articles} initialQuery={params.q} initialCategory={params.category} /></div></section></>;
}
