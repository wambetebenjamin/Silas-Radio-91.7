'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/hooks/useMotionAndLayout';

/**
 * 4. Scrollytelling radio journey — EFFECT-02, pinned four beats:
 *   Beat 1: A presenter arrives at the studio at 5am.
 *   Beat 2: The mic goes live and Nairobi tunes in.
 *   Beat 3: A community story changes the conversation.
 *   Beat 4: Music carries the city through the day.
 *
 * IntersectionObserver drives the active beat. Wheel speed is never hijacked:
 * the story is a normal scroll region (position: sticky), so trackpads, keyboard
 * scrolling and screen-reader navigation all behave natively.
 *
 * Under reduced motion the whole section collapses to a flat, stacked article.
 */

const BEATS = [
  {
    id: 'arrive',
    index: '05:00',
    title: 'A presenter arrives at the studio',
    body: 'The first coffee is poured on Kimathi Street while the city is still dark. Today’s running order is written by hand: traffic on Thika Road, a missing water bill, a wedding in Kayole.',
    image: '/images/studio/broadcast-desk-duo.jpg',
    alt: 'Two presenters at the Silas Radio broadcast desk with microphones and headphones.',
  },
  {
    id: 'on-air',
    index: '06:00',
    title: 'The mic goes live and Nairobi tunes in',
    body: 'The ON AIR light turns red. Within ten minutes matatus from Ngong to Ruiru are tuned to 91.7 and the request line starts filling up.',
    image: '/images/studio/broadcast-mic-green.jpg',
    alt: 'A studio condenser microphone on a boom arm under studio lighting.',
  },
  {
    id: 'story',
    index: '12:30',
    title: 'A community story changes the conversation',
    body: 'A listener from Mathare calls in about a blocked drainage channel. By the afternoon the ward office has answered on air, and the story is the lead of the evening bulletin.',
    image: '/images/culture/community-interview.jpg',
    alt: 'A community member speaking into a microphone during a live interview.',
  },
  {
    id: 'music',
    index: '19:00',
    title: 'Music carries the city through the day',
    body: 'Benga at dusk, gengetone on the commute, and the overnight mix that keeps the frequency warm until the next 5am.',
    image: '/images/studio/turntable-closeup.jpg',
    alt: 'Close-up of a turntable and mixer used for the evening and overnight shows.',
  },
] as const;

export function Scrollytelling() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beatRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const elements = beatRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!elements.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index ?? 0);
            setActive(index);
          }
        }
      },
      { rootMargin: '-38% 0px -44% 0px', threshold: [0, 0.4, 0.8] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [reduced]);

  /* Reduced motion: flat stacked article, no pinning, no observer. */
  if (reduced) {
    return (
      <section className="sr-section sr-section--dark spad" aria-labelledby="story-heading">
        <div className="sr-container">
          <div className="sr-section-head sr-section-head--light">
            <p className="sr-section-head__ghost" aria-hidden="true">
              ONE DAY
            </p>
            <span className="sr-eyebrow">A day on 91.7</span>
            <h2 id="story-heading">One day, four beats, one city</h2>
          </div>

          <ol className="grid gap-8 md:grid-cols-2">
            {BEATS.map((beat) => (
              <li key={beat.id}>
                <article className="sr-card">
                  <div className="relative aspect-[16/10]">
                    <Image src={beat.image} alt={beat.alt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
                  </div>
                  <div className="sr-card__body">
                    <p className="sr-meta">{beat.index} EAT</p>
                    <h3 className="sr-card__title">{beat.title}</h3>
                    <p>{beat.body}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="sr-section sr-section--dark" aria-labelledby="story-heading">
      <div className="sr-container">
        <div className="sr-section-head sr-section-head--light pt-16">
          <p className="sr-section-head__ghost" aria-hidden="true">
            ONE DAY
          </p>
          <span className="sr-eyebrow">A day on 91.7</span>
          <h2 id="story-heading">One day, four beats, one city</h2>
        </div>

        <div className="sr-scroll-story">
          <div className="sr-scroll-story__sticky">
            {/* Pinned media panel — the image follows the active beat */}
            <div className="sr-scroll-story__media">
              {BEATS.map((beat, index) => (
                <Image
                  key={beat.id}
                  src={beat.image}
                  alt={beat.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                  style={{
                    opacity: active === index ? 1 : 0,
                    transition: 'opacity 380ms cubic-bezier(0.22,0.61,0.36,1)',
                  }}
                  priority={index === 0}
                />
              ))}
              <div className="sr-scroll-story__progress" aria-hidden="true">
                <span style={{ width: `${((active + 1) / BEATS.length) * 100}%`, transition: 'width 300ms linear' }} />
              </div>
            </div>

            <ol className="sr-scroll-story__beats">
              {BEATS.map((beat, index) => (
                <li
                  key={beat.id}
                  data-index={index}
                  ref={(element) => {
                    beatRefs.current[index] = element;
                  }}
                  className="sr-beat"
                  data-active={active === index}
                >
                  <p className="sr-beat__index">
                    Beat {index + 1} · {beat.index} EAT
                  </p>
                  <h3>{beat.title}</h3>
                  <p>{beat.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
