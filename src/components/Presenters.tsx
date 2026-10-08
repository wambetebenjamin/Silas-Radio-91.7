'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, Instagram, Mic, Ticket } from 'lucide-react';

import { PRESENTERS } from '@/lib/site';
import { SectionHead } from './SectionHead';

/**
 * 6. Presenters section (EFFECT-26)
 *
 * Hover reveals the bio and show time on each card in 400ms (in), 150ms (out),
 * gated behind `@media (hover: hover) and (pointer: fine)` so touch devices
 * never get a stuck hover state. The same reveal is available on focus-visible,
 * and a tap toggles it on touch.
 *
 * Each card: East African radio host photo, name, show name, show days and
 * times, social links and a "Book for Events" CTA.
 */
export function Presenters() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <section className="sr-section sr-section--pale spad" id="presenters" aria-labelledby="presenters-heading">
      <div className="sr-container">
        <SectionHead
          id="presenters-heading"
          eyebrow="The voices"
          ghost="PRESENTERS"
          title="Meet the presenters"
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRESENTERS.map((presenter) => {
            const open = openSlug === presenter.slug;
            return (
              <li key={presenter.slug}>
                <article
                  className="sr-presenter"
                  data-open={open}
                  tabIndex={0}
                  aria-labelledby={`presenter-${presenter.slug}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setOpenSlug(open ? null : presenter.slug);
                    }
                    if (event.key === 'Escape') setOpenSlug(null);
                  }}
                >
                  <Image
                    src={presenter.image}
                    alt={presenter.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="sr-presenter__img"
                  />
                  <span className="sr-presenter__scrim" aria-hidden="true" />

                  {/* Always-visible identity block */}
                  <div className="sr-presenter__static">
                    <h3 id={`presenter-${presenter.slug}`}>{presenter.name}</h3>
                    <p>{presenter.show}</p>
                  </div>

                  {/* Reveal layer — bio, show time, socials, booking CTA */}
                  <div className="sr-presenter__reveal">
                    <h3 className="text-[20px]">{presenter.name}</h3>
                    <p className="sr-meta !text-white/70 mb-0">{presenter.show}</p>
                    <p className="flex items-center gap-2 text-[13px] !text-white/90 mb-0">
                      <Calendar size={14} aria-hidden="true" />
                      {presenter.showDays} · {presenter.showTimes}
                    </p>
                    <p className="!text-white/85">{presenter.bio}</p>

                    <div className="flex flex-wrap gap-2 mt-1">
                      <a
                        className="sr-chip-link"
                        href={presenter.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${presenter.name} on Instagram`}
                      >
                        <Instagram size={14} aria-hidden="true" /> Instagram
                      </a>
                      <a
                        className="sr-chip-link"
                        href={presenter.social.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${presenter.name} on X`}
                      >
                        <Mic size={14} aria-hidden="true" /> X
                      </a>
                      <Link className="sr-chip-link" href={presenter.bookEventsHref}>
                        <Ticket size={14} aria-hidden="true" /> Book for Events
                      </Link>
                    </div>
                  </div>

                  {/* Touch toggle (media-hover gating handled in CSS) */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 z-[4] sr-btn sr-btn--ghost-light !min-h-[48px] !px-3 lg:hidden"
                    aria-expanded={open}
                    aria-controls={`presenter-${presenter.slug}-details`}
                    onClick={() => setOpenSlug(open ? null : presenter.slug)}
                  >
                    {open ? 'Hide' : 'Details'}
                  </button>
                  <span id={`presenter-${presenter.slug}-details`} className="sr-only">
                    Bio, show times, social links and booking for {presenter.name}
                  </span>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="sr-meta mt-5">
          Presenter photography is licensed from Pexels and Unsplash. Full credits in{' '}
          <span className="underline">image-credits.md</span>.
        </p>
      </div>
    </section>
  );
}
