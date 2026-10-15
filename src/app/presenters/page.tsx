import { PageHero } from '@/components/site/PageHero';
import { PresenterCard } from '@/components/site/Cards';
import { CommunityBanner } from '@/components/site/CommunityBanner';
import { PRESENTERS } from '@/lib/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Our presenters', 'The presenters of Silas Radio 91.7. Meet the Nairobi voices behind our programmes and see which shows they host.', '/presenters');
export default function PresentersPage() {
  return <><PageHero eyebrow="Who’s on air" title="The people on the microphone" description="Every presenter on 91.7, the shows they host and the days you can hear them." breadcrumb="Presenters" /><section className="section"><div className="container presenter-grid">{PRESENTERS.map((presenter) => <PresenterCard key={presenter.slug} presenter={presenter} />)}</div></section><CommunityBanner /></>;
}
