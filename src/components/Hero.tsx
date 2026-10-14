import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';
import { SITE } from '@/lib/site';
import { LivePlayButton } from './site/PlayButtons';
import { HeroOnAir } from './site/OnAir';

export function Hero({ initialTime }: { initialTime: string }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container hero-layout">
        <div className="hero-copy"><p className="eyebrow">Nairobi’s community. On your frequency.</p><h1 id="home-title"><span>Good music.</span><span>Real voices.</span><em>Your Nairobi.</em></h1><p>From the first matatu to the last dance. The music, the people and the stories that make this city ours.</p><div className="button-row"><LivePlayButton /><Link className="button button--ghost" href="/shows">Discover our shows <ArrowUpRight size={16} aria-hidden="true" /></Link></div><div className="hero-footnote"><Headphones size={13} aria-hidden="true" />91.7 FM in Nairobi. A little closer, wherever you are.</div></div>
        <div className="hero-visual"><div className="hero-visual__photo"><Image src="/images/studio/broadcast-mic-green.jpg" alt="Studio microphone and headphones, ready for the next voice on air" fill priority sizes="(max-width: 760px) 100vw, 45vw" /></div><div className="hero-visual__top"><span><span className="status-dot" />THE NAIROBI FREQUENCY</span><span>EST. IN THE COMMUNITY</span></div><div className="hero-frequency" aria-label="91.7 FM"><strong>91.7</strong><span>TURN IT UP.</span></div><div className="hero-caption">Made in Nairobi.<br /><span>Heard everywhere.</span></div><HeroOnAir initialTime={initialTime} /></div>
      </div>
      {!SITE.streamConfigured && <span className="sr-only">The web player currently uses clearly labelled demo audio, not a live broadcast.</span>}
    </section>
  );
}
