import Image from 'next/image';
import { PageHero } from '@/components/site/PageHero';
import { NewsletterForm } from '@/components/NewsletterForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('The weekly playlist', 'Sign up for music discoveries, community stories and updates from the Silas Radio 91.7 studio, sent every Friday.', '/newsletter');
export default function NewsletterPage() {
  return <><PageHero eyebrow="Newsletter" title="The weekly playlist" description="One email a week from the studio: new tracks we are playing, station news and the stories our community desk has published." breadcrumb="The weekly playlist" /><section className="section"><div className="container story-split"><div className="story-split__image"><Image src="/images/studio/turntable-closeup.jpg" alt="A record ready to play on a turntable" fill sizes="(max-width: 760px) 100vw, 50vw" priority /></div><div><p className="eyebrow">Sent every Friday</p><h2>What lands in your inbox</h2><p>Pick the sounds you want to hear about and we will send the rest. You can unsubscribe from any issue.</p><NewsletterForm /></div></div></section></>;
}
