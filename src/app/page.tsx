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
      <section className="section home-shows"><div className="container"><SectionHeading eyebrow="Programmes" title="Shows on Silas Radio" href="/shows" linkLabel="All shows" /><div className="grid-three">{featuredShows.map((show) => <ShowCard key={show.id} show={show} />)}</div><div className="genre-strip" aria-label="Music on Silas Radio">{['AFROBEAT', 'BENGA', 'GENGETONE', 'BONGO FLAVA', 'R&B & SOUL'].map((genre) => <span key={genre}>{genre}</span>)}</div></div></section>
      <section className="section section--dark"><div className="container"><SectionHeading eyebrow="On demand" title="Listen back" href="/podcasts" linkLabel="The listening library" light /><div className="grid-three">{EPISODES.map((episode) => <EpisodeCard key={episode.slug} episode={episode} />)}</div></div></section>
      <section className="section section--white"><div className="container"><SectionHeading eyebrow="Community desk" title="News and stories" href="/news" linkLabel="All stories" /><div className="grid-three">{news.slice(0, 3).map((article) => <StoryCard key={article.slug} article={article} />)}</div></div></section>
      <CommunityBanner />
      <section className="section"><div className="container newsletter-section"><div><p className="eyebrow">Newsletter</p><h2>The weekly playlist</h2><p>New tracks, station news and community stories from Nairobi, sent every Friday.</p></div><NewsletterForm /></div></section>
    </>
  );
}
