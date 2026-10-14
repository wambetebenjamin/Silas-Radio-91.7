import { Hero } from '@/components/Hero';
import { FrequencyStrip } from '@/components/site/OnAir';
import { SectionHeading } from '@/components/site/PageHero';
import { ShowCard, EpisodeCard, StoryCard } from '@/components/site/Cards';
import { CommunityBanner } from '@/components/site/CommunityBanner';
import { LegacyNavigation } from '@/components/site/LegacyNavigation';
import { NewsletterForm } from '@/components/NewsletterForm';
import { SHOWS, EPISODES } from '@/lib/programming';
import { getAllNews } from '@/lib/news';

export const revalidate = 30;

export default async function HomePage() {
  const news = await getAllNews();
  const now = new Date().toISOString();
  const featuredShows = [SHOWS[0], SHOWS[2], SHOWS[3]];
  return (
    <>
      <LegacyNavigation />
      <Hero initialTime={now} />
      <FrequencyStrip initialTime={now} />
      <section className="section home-shows"><div className="container"><SectionHeading eyebrow="Find your kind of radio" title="A soundtrack for every hour." href="/shows" linkLabel="Explore all shows" /><div className="grid-three">{featuredShows.map((show) => <ShowCard key={show.id} show={show} />)}</div><div className="genre-strip" aria-label="Music on Silas Radio">{['AFROBEAT', 'BENGA', 'GENGETONE', 'BONGO FLAVA', 'R&B & SOUL'].map((genre) => <span key={genre}>{genre}</span>)}</div></div></section>
      <section className="section section--dark"><div className="container"><SectionHeading eyebrow="Good company, on your time" title="Press play. Stay a little longer." href="/podcasts" linkLabel="The listening library" light /><div className="grid-three">{EPISODES.map((episode) => <EpisodeCard key={episode.slug} episode={episode} />)}</div></div></section>
      <section className="section section--white"><div className="container"><SectionHeading eyebrow="From the community desk" title="The city has a story." href="/news" linkLabel="All community stories" /><div className="grid-three">{news.slice(0, 3).map((article) => <StoryCard key={article.slug} article={article} />)}</div></div></section>
      <CommunityBanner />
      <section className="section"><div className="container newsletter-section"><div><p className="eyebrow">A little radio in your inbox</p><h2>Your Friday, on a good note.</h2><p>New discoveries, favourite tracks and stories from our corner of Nairobi. Sign up for the weekly playlist.</p></div><NewsletterForm /></div></section>
    </>
  );
}
