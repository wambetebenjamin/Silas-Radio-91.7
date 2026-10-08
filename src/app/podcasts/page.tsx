import type { Metadata } from 'next';
import Link from 'next/link';
import { Headphones, PlayCircle, Rss } from 'lucide-react';

import { PRESENTERS, SCHEDULE, SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';
import { PodcastSeriesJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Podcasts',
  description:
    'Every Silas Radio 91.7 show becomes a podcast episode: Amaka Early Drive, Midday Community Hour, Sheng Express, Genre Night and the Studio Sessions.',
  alternates: { canonical: '/podcasts' },
  openGraph: {
    title: 'Podcasts | Silas Radio 91.7',
    description: 'Catch up on every show from Nairobi — subscribe on Spotify or Apple Podcasts.',
    type: 'website',
    url: `${SITE.url}/podcasts`,
  },
};

/**
 * Podcast catalogue. Each recorded show is exposed as a PodcastSeries with its
 * own JSON-LD, and each episode carries an Open Graph entry (the series page
 * below and /news/[slug] handle per-episode OG tags).
 */
export default function PodcastsPage() {
  const series = SCHEDULE.filter((slot) => slot.hasRecording).map((slot) => ({
    slot,
    presenter: PRESENTERS.find((person) => person.slug === slot.presenterSlug),
    episodes: [
      {
        title: `${slot.name} — ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long' })}`,
        date: new Date().toISOString().slice(0, 10),
        duration: slot.duration,
      },
      {
        title: `${slot.name} — the week in Nairobi`,
        date: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
        duration: slot.duration,
      },
    ],
  }));

  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead as="h1" eyebrow="On demand" ghost="PODCASTS" title="Podcasts from the studio" />
        <p className="sr-lead mb-8">
          Missed it live? Every show with a recording is cut and published with the music kept in.
          Subscribe on Spotify or Apple Podcasts, or press play here and keep browsing — the player
          at the bottom of the page never stops.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <a className="sr-btn sr-btn--primary" href={SITE.social.spotify} target="_blank" rel="noopener noreferrer">
            <Headphones size={16} aria-hidden="true" /> Spotify
          </a>
          <a className="sr-btn sr-btn--outline" href={SITE.social.applePodcasts} target="_blank" rel="noopener noreferrer">
            <Rss size={16} aria-hidden="true" /> Apple Podcasts
          </a>
          <a className="sr-btn sr-btn--outline" href={SITE.social.youtube} target="_blank" rel="noopener noreferrer">
            <PlayCircle size={16} aria-hidden="true" /> YouTube
          </a>
        </div>

        <ul className="grid gap-6 md:grid-cols-2">
          {series.map(({ slot, presenter }) => (
            <li key={slot.id}>
              <PodcastSeriesJsonLd
                name={slot.name}
                description={slot.description}
                presenter={slot.presenter}
                slug={slot.id}
                episodes={series.find((item) => item.slot.id === slot.id)?.episodes}
              />
              <article className="sr-card p-6">
                <p className="sr-meta mb-1">
                  {slot.presenter} · {slot.duration}
                </p>
                <h2 className="sr-card__title">{slot.name}</h2>
                <p>{slot.description}</p>
                <p className="sr-meta">
                  Show days: {slot.days.join(', ')} · {slot.start}–{slot.end} EAT
                </p>

                <h3 className="font-heading text-[16px] font-semibold text-[#111] mt-3">Latest episodes</h3>
                <ul className="grid gap-2">
                  {series
                    .find((item) => item.slot.id === slot.id)
                    ?.episodes.map((episode) => (
                      <li key={episode.title} className="flex items-center justify-between gap-3 border-b border-[#ebebeb] pb-2">
                        <span className="min-w-0">
                          <span className="block truncate">{episode.title}</span>
                          <span className="sr-meta">
                            {episode.date} · {episode.duration}
                          </span>
                        </span>
                        <Link className="sr-btn sr-btn--outline" href={`/podcasts#${slot.id}`}>
                          <PlayCircle size={14} aria-hidden="true" /> Play
                        </Link>
                      </li>
                    ))}
                </ul>

                {presenter ? (
                  <p className="sr-meta mt-3">
                    Presenter: {presenter.name} · {presenter.showTimes}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
