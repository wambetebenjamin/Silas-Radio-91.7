'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, List, Radio, Ticket, Users, Volume2 } from 'lucide-react';

import { PACKAGES, SITE } from '@/lib/site';
import { SectionHead } from './SectionHead';
import { MascotCard } from './GalleryCards';

/**
 * 10. Advertising sponsorship packages (EFFECT-30)
 *
 * - A 3D page-flip catalog viewer for the rate card and media kit built purely
 *   with CSS transforms; pages are mounted lazily (only the current spread is
 *   in the DOM), keyboard prev/next works, the page number is announced and a
 *   text reading-mode toggle switches the book into a plain, accessible list.
 * - The four packages are also printed on the page, each with icon, placement,
 *   reach, starting price in KES, inclusions and a "Request a Proposal" CTA.
 * - The waving mascot variant appears in the advertising CTA band.
 */

interface CatalogPage {
  title: string;
  kind: 'cover' | 'rates' | 'audience' | 'kit' | 'back';
  rows?: { label: string; value: string }[];
  bullets?: string[];
}

const PAGES: CatalogPage[] = [
  { title: 'Silas Radio 91.7 — Rate Card and Media Kit', kind: 'cover' },
  {
    title: 'Rate card',
    kind: 'rates',
    rows: PACKAGES.map((pkg) => ({
      label: pkg.name,
      value: `KES ${pkg.priceKES} ${pkg.priceNote}`,
    })),
  },
  {
    title: 'Audience',
    kind: 'audience',
    rows: [
      { label: 'Weekly listeners', value: '118,000' },
      { label: 'Primetime share (05:00–09:00)', value: '41%' },
      { label: 'Core age', value: '18–35 (62%)' },
      { label: 'Nairobi commuters reached daily', value: '34,000' },
      { label: 'Diaspora streams per month', value: '27,400' },
      { label: 'Monthly site visits', value: '41,000' },
      { label: 'Newsletter subscribers', value: '9,400' },
      { label: 'Podcast downloads per month', value: '16,900' },
    ],
  },
  {
    title: 'Media kit',
    kind: 'kit',
    bullets: [
      'Spot production: script edit, studio voice-over and music bed included.',
      'Creative approvals within one working day.',
      'All reads are recorded and archived for your compliance records.',
      'Geo-targeted digital inventory across the site and newsletter.',
      'Weekly performance reporting dashboard.',
      'Insertion orders accepted monthly, quarterly or by campaign.',
    ],
  },
  { title: 'Thank you — let’s build the campaign', kind: 'back' },
];

export function Advertising({ withEnquiryForm }: { withEnquiryForm: boolean }) {
  const [page, setPage] = useState(0);
  const [readingMode, setReadingMode] = useState(false);
  const bookRef = useRef<HTMLDivElement | null>(null);

  const turn = useCallback(
    (direction: 1 | -1) => {
      setPage((current) => {
        const next = current + direction;
        if (next < 0 || next > PAGES.length - 1) return current;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!bookRef.current?.contains(document.activeElement)) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        turn(1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [turn]);

  const current = PAGES[page];

  return (
    <section className="spad" id="advertising" aria-labelledby="advertising-heading" style={{ background: '#f5f5f5' }}>
      <div className="sr-container">
        <SectionHead
          id="advertising-heading"
          eyebrow="Sponsorship"
          ghost="ADVERTISE"
          title="Advertising and sponsorship packages"
        />
        <p className="sr-lead mb-8">
          Every package is built with the presenter, produced in our studio and reported weekly.
          Prices below are starting points in Kenyan Shillings, excluding VAT.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          {/* ---------------- EFFECT-30 page-flip catalog ---------------- */}
          <div className="sr-flip" data-reading={readingMode}>
            <div
              className="sr-flip__book"
              ref={bookRef}
              tabIndex={0}
              role="group"
              aria-label="Advertising rate card and media kit, page-flip viewer"
              aria-describedby="flip-instructions"
            >
              {readingMode ? (
                /* Reading mode: everything mounted as plain text */
                <div className="grid gap-6">
                  {PAGES.map((item, index) => (
                    <article key={item.title}>
                      <h3 className="text-white text-[18px] font-semibold mb-2">
                        Page {index + 1} — {item.title}
                      </h3>
                      {item.rows ? (
                        <dl>
                          {item.rows.map((row) => (
                            <div className="sr-flip__rate-row" key={row.label}>
                              <dt>{row.label}</dt>
                              <dd>{row.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {item.bullets ? (
                        <ul className="text-white/85 list-disc pl-5 grid gap-2">
                          {item.bullets.map((bullet) => (
                            <li key={bullet} className="list-disc">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {item.kind === 'cover' || item.kind === 'back' ? (
                        <p className="text-white/75">
                          {item.kind === 'cover'
                            ? 'Silas Radio 91.7 · Kimathi Street, Nairobi · ' + SITE.phone
                            : `Call ${SITE.phone} or email ${SITE.advertisingEmail}`}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                /* Page-flip mode: only the current page is mounted (lazy) */
                <article key={current.title} className="sr-flip__page">
                  <header>
                    <p className="sr-meta !text-white/60 mb-1">
                      Page {page + 1} of {PAGES.length}
                    </p>
                    <h3 className="text-white text-[20px] font-semibold">{current.title}</h3>
                  </header>

                  {current.kind === 'cover' ? (
                    <div className="grid gap-3">
                      <p className="font-display text-[54px] leading-none text-white/20">91.7</p>
                      <p className="text-white/85">
                        Programme highlights, audience data and the full rate card for Nairobi's
                        community station.
                      </p>
                      <p className="sr-meta !text-white/60">
                        {SITE.studioAddress.street} · {SITE.phone} · {SITE.advertisingEmail}
                      </p>
                    </div>
                  ) : null}

                  {current.rows ? (
                    <dl>
                      {current.rows.map((row) => (
                        <div className="sr-flip__rate-row" key={row.label}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {current.bullets ? (
                    <ul className="grid gap-2 text-white/85">
                      {current.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <Volume2 size={15} aria-hidden="true" className="mt-1 text-[#c9a6ff]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {current.kind === 'back' ? (
                    <p className="text-white/85">
                      Email {SITE.advertisingEmail} or WhatsApp {SITE.whatsappDisplay} and we will
                      send a proposal within one working day.
                    </p>
                  ) : null}
                </article>
              )}
            </div>

            <div className="sr-flip__controls">
              <button
                type="button"
                className="sr-btn sr-btn--ghost-light"
                onClick={() => turn(-1)}
                disabled={page === 0 || readingMode}
                aria-label="Previous page of the rate card"
              >
                <ChevronLeft size={16} aria-hidden="true" /> Prev
              </button>
              <button
                type="button"
                className="sr-btn sr-btn--ghost-light"
                onClick={() => turn(1)}
                disabled={page === PAGES.length - 1 || readingMode}
                aria-label="Next page of the rate card"
              >
                Next <ChevronRight size={16} aria-hidden="true" />
              </button>

              {/* Page number announcement */}
              <span className="sr-flip__counter" role="status" aria-live="polite">
                Page {page + 1} of {PAGES.length}
              </span>

              <button
                type="button"
                className="sr-btn sr-btn--outline ml-auto"
                onClick={() => setReadingMode((value) => !value)}
                aria-pressed={readingMode}
              >
                {readingMode ? <BookOpen size={15} aria-hidden="true" /> : <List size={15} aria-hidden="true" />}
                {readingMode ? 'Page-flip view' : 'Text reading mode'}
              </button>
            </div>

            <p id="flip-instructions" className="sr-meta mt-2">
              Focus the viewer and use the arrow keys to turn pages. Text reading mode prints every
              page as a plain list.
            </p>
          </div>

          {/* ---------------- Packages on-page ---------------- */}
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {PACKAGES.map((pkg) => (
                <li key={pkg.slug} className="h-full">
                  <article className={`sr-package ${pkg.featured ? 'sr-package--featured' : ''}`}>
                    <span className="sr-badge sr-badge--recorded w-fit">
                      {pkg.slug === 'show-naming-rights' ? (
                        <Radio size={12} aria-hidden="true" />
                      ) : pkg.slug === 'digital-on-air-bundle' ? (
                        <Users size={12} aria-hidden="true" />
                      ) : (
                        <Volume2 size={12} aria-hidden="true" />
                      )}
                      {pkg.featured ? 'Most requested' : 'Package'}
                    </span>
                    <h3 className="text-[19px] font-semibold text-[#111]">{pkg.name}</h3>
                    <p className="sr-meta mb-0">Placement: {pkg.placement}</p>
                    <p className="sr-meta mb-0">Reach: {pkg.reach}</p>
                    <p className="sr-package__price">
                      KES {pkg.priceKES}
                      <span className="sr-meta block">{pkg.priceNote}</span>
                    </p>
                    <ul>
                      {pkg.inclusions.map((item) => (
                        <li key={item}>
                          <Ticket size={14} aria-hidden="true" className="mt-1 text-[#5c00ce]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      className="sr-btn sr-btn--primary sr-btn--block mt-auto"
                      href={withEnquiryForm ? '#enquiry' : '/advertise#enquiry'}
                    >
                      Request a Proposal
                    </Link>
                  </article>
                </li>
              ))}
            </ul>

            {/* Advertising CTA band with the waving mascot variant (EFFECT-13) */}
            <div className="mt-6 sr-gcard" style={{ minHeight: 0 }}>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
                <div className="mix-blend-normal" style={{ width: 170, flex: '0 0 auto' }}>
                  <MascotCard waving />
                </div>
                <div>
                  <h3 className="text-white text-[19px] font-semibold">
                    Not sure which package fits?
                  </h3>
                  <p className="text-white/75">
                    Send us the campaign goal and budget. We will come back with a plan built from
                    the four packages above — or a mix of them.
                  </p>
                  <a
                    className="sr-btn sr-btn--white mt-2"
                    href={SITE.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Talk to the sales desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
