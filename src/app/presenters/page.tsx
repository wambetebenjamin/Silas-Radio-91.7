import { PageHero } from '@/components/site/PageHero';
import { PresenterCard } from '@/components/site/Cards';
import { CommunityBanner } from '@/components/site/CommunityBanner';
import { PRESENTERS } from '@/lib/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Our presenters', 'Meet the voices of Silas Radio 91.7. Get to know our Nairobi presenters, their programmes and the stories behind the microphone.', '/presenters');
export default function PresentersPage() {
  return <><PageHero eyebrow="The people behind your favourite company" title="Familiar voices. Real people." description="Early risers, crate diggers, storytellers and city explorers. Meet the people who bring their own little piece of Nairobi to the microphone." breadcrumb="Presenters" /><section className="section"><div className="container presenter-grid">{PRESENTERS.map((presenter) => <PresenterCard key={presenter.slug} presenter={presenter} />)}</div></section><CommunityBanner /></>;
}
