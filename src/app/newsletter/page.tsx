import Image from 'next/image';
import { PageHero } from '@/components/site/PageHero';
import { NewsletterForm } from '@/components/NewsletterForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('The weekly playlist', 'Sign up for music discoveries, community stories and updates from the Silas Radio 91.7 studio. Your kind of radio, in your inbox.', '/newsletter');
export default function NewsletterPage() {
  return <><PageHero eyebrow="A little radio in your inbox" title="Your Friday, on a good note." description="New tracks to love. Stories to share. A little news from the studio. Get closer to the music and people on your frequency." breadcrumb="The weekly playlist" /><section className="section"><div className="container story-split"><div className="story-split__image"><Image src="/images/studio/turntable-closeup.jpg" alt="A record ready to play on a turntable" fill sizes="(max-width: 760px) 100vw, 50vw" priority /></div><div><p className="eyebrow">The weekly playlist</p><h2>A fresh reason to turn it up.</h2><p>Choose the sounds you love and leave the discoveries to us. Sign up for our weekly mix of music and community updates.</p><NewsletterForm /></div></div></section></>;
}
