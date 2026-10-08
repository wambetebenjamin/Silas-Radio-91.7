import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Headphones, Radio, Users } from 'lucide-react';

import { SITE, SCHEDULE, TIMEZONE } from '@/lib/site';
import { getAllNews, formatNewsDate } from '@/lib/news';
import { Hero } from '@/components/Hero';
import { PresenceBoard } from '@/components/PresenceBoard';
import { Scrollytelling } from '@/components/Scrollytelling';
import { Schedule } from '@/components/Schedule';
import { NeumorphicStudio } from '@/components/NeumorphicStudio';
import { Presenters } from '@/components/Presenters';
import { Gallery } from '@/components/Gallery';
import { ArStudioTour } from '@/components/ArStudioTour';
import { SongRequestForm } from '@/components/SongRequestForm';
import { Advertising } from '@/components/Advertising';
import { Contest } from '@/components/Contest';
import { NewsletterSection } from '@/components/NewsletterSection';
import { ContactSection } from '@/components/ContactSection';
import { SectionHead } from '@/components/SectionHead';

/**
 * Home page.
 *
 * The schedule is server-rendered with the value of `new Date()` at request
 * time so the Live badge is true to the Nairobi clock on first paint, then the
 * client refreshes it every 60 seconds (see Schedule.tsx). `revalidate = 30`
 * keeps the edge cache warm without ever serving a stale badge for long.
 */
export const revalidate = 30;

export default async function HomePage() {
  const news = await getAllNews();
  const featured = news.slice(0, 3);
  const generatedAt = new Date().toISOString();

  return (
    <>
      {/* 2. Hero — EFFECT-01, 04, 06, 18, 23 */}
      <Hero />

      {/* 11. Presence live board — EFFECT-05 */}
      <PresenceBoard />

      {/* 4. Scrollytelling radio journey — EFFECT-02 */}
      <Scrollytelling />

      {/* 5. Show schedule — EFFECT-24, EFFECT-15 + 12. Neumorphic studio widget — EFFECT-27 */}
      <Schedule
        initialSchedule={SCHEDULE}
        initialGeneratedAt={generatedAt}
        aside={<NeumorphicStudio />}
      />

      {/* 6. Presenters — EFFECT-26 */}
      <Presenters />

      {/* 7. Broadcasts gallery — EFFECT-07/08/09/13/14/16/17/19/21/31 */}
      <Gallery />

      {/* 8. AR studio tour — EFFECT-03 */}
      <ArStudioTour />

      {/* 9. Song request and dedication — EFFECT-12, EFFECT-29 */}
      <SongRequestForm />

      {/* 10. Advertising sponsorship packages — EFFECT-30 */}
      <Advertising withEnquiryForm={false} />

      {/* 13. Contests and giveaways */}
      <Contest />

      {/* 14. News teaser */}
      <section className="spad" aria-labelledby="news-teaser-heading" style={{ background: '#fff' }}>
        <div className="sr-container">
          <SectionHead
            id="news-teaser-heading"
            eyebrow="Community desk"
            ghost="STORIES"
            title="News and community stories"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {featured.map((article) => (
              <li key={article.slug}>
                <article className="sr-news-card">
                  <Image
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    width={800}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="sr-news-card__img"
                  />
                  <div className="sr-news-card__body">
                    <p className="sr-meta mb-0">
                      {article.category} · {formatNewsDate(article.date)} · {article.readingMinutes} min read
                    </p>
                    <h3>
                      <Link href={`/news/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p>{article.excerpt}</p>
                    <Link className="sr-btn sr-btn--outline mt-auto" href={`/news/${article.slug}`}>
                      Read the story
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link className="sr-btn sr-btn--primary" href="/news">
              All community stories
            </Link>
          </div>
        </div>
      </section>

      {/* 15. Newsletter */}
      <NewsletterSection />

      {/* 16. Contact */}
      <ContactSection />

      {/* Podcast strip — cross-links the podcast section of the site */}
      <section className="spad" aria-labelledby="podcast-strip-heading" style={{ background: '#0b0018' }}>
        <div className="sr-container grid gap-6 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <p className="sr-eyebrow !text-[#c9a6ff]">Missed it live?</p>
            <h2 id="podcast-strip-heading" className="text-white text-[30px] font-bold">
              Every show becomes a podcast episode
            </h2>
            <p className="text-white/75 max-w-[60ch]">
              Amaka Early Drive, Midday Community Hour, Sheng Express and Genre Night are cut and
              published with the music kept in. Subscribe on Spotify or Apple Podcasts, or listen
              right here on the site.
            </p>
            <ul className="flex flex-wrap gap-3 mt-4">
              <li>
                <Link className="sr-btn sr-btn--white" href="/podcasts">
                  <Headphones size={16} aria-hidden="true" /> Browse podcasts
                </Link>
              </li>
              <li>
                <a className="sr-btn sr-btn--ghost-light" href={SITE.social.spotify} target="_blank" rel="noopener noreferrer">
                  Spotify
                </a>
              </li>
              <li>
                <a className="sr-btn sr-btn--ghost-light" href={SITE.social.applePodcasts} target="_blank" rel="noopener noreferrer">
                  Apple Podcasts
                </a>
              </li>
            </ul>
          </div>
          <ul className="grid gap-3">
            {[
              { icon: Radio, label: 'Live 24 hours', value: '91.7 FM · online' },
              { icon: Calendar, label: 'Shows a week', value: `${SCHEDULE.length} blocks` },
              { icon: Users, label: 'Listener time zone', value: TIMEZONE },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3 text-white/85">
                <span className="sr-footer__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="sr-meta block !text-white/60">{label}</span>
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
