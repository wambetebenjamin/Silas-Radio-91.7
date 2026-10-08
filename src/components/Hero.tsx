'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Headphones, PlayCircle } from 'lucide-react';

import { SITE } from '@/lib/site';
import { HeroMicCanvas } from './HeroMicCanvas';
import { WaveformParticles } from './WaveformParticles';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';
import { formatListeners, useListeners } from '@/hooks/useListeners';
import { usePlayerStore } from '@/store/player';

/**
 * 2. Hero
 *
 * EFFECT-18 — animated gradient backdrop (background-position only, contrast
 *             verified: worst case #4b04c4 gives 10.2:1 against white text).
 * EFFECT-23 — sequenced entrance completes in under 1.6s; CTAs are focusable
 *             and clickable from the first paint (no pointer-events delay, no
 *             opacity hiding on interactive elements, no LCP delay).
 * EFFECT-04 — headline per-letter stagger; the keyword "Radio" gets a glitch
 *             pass; split glyphs are aria-hidden and a clean sentence is
 *             exposed to assistive tech.
 * EFFECT-06 — ambient waveform particles (see WaveformParticles).
 * EFFECT-01 — Three.js microphone (see HeroMicCanvas).
 * EFFECT-05 — live listener count, seeded server-side.
 */

const HEADLINE = 'Nairobi Speaks. Silas Radio Listens.';
const GLITCH_KEYWORD = 'Radio';

export function Hero() {
  const reduced = useReducedMotion();
  const listeners = useListeners(SITE.listenersSeed);
  const play = usePlayerStore((state) => state.play);
  const [phase, setPhase] = useState(reduced ? 2 : 0);

  // EFFECT-23 — one sequenced entrance; step 2 lands at 620ms, well inside 1.6s.
  useEffect(() => {
    if (reduced) {
      setPhase(2);
      return;
    }
    const first = window.setTimeout(() => setPhase(1), 40);
    const second = window.setTimeout(() => setPhase(2), 620);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [reduced]);

  const words = HEADLINE.split(' ');
  let letterCursor = 0;

  return (
    <section className="sr-hero" aria-labelledby="hero-heading">
      {/* EFFECT-18 — animated gradient backdrop */}
      <div
        className={`sr-gradient absolute inset-0 -z-10 ${reduced ? 'sr-gradient--static' : ''}`}
        aria-hidden="true"
      />

      {/* EFFECT-06 — ambient waveform particles, below 0.2 opacity */}
      <WaveformParticles reduced={reduced} />

      <div className="sr-container sr-hero__grid">
        <div>
          <p className="sr-hero__eyebrow" data-phase={phase}>
            <span className="sr-live-cta__dot" aria-hidden="true" />
            91.7 FM · Nairobi · On air 24 hours
          </p>

          {/* EFFECT-04 — per-letter stagger with a glitch pass on "Radio" */}
          <h1 id="hero-heading">
            <span className="sr-only">{HEADLINE}</span>
            <span aria-hidden="true">
              {words.map((word, wordIndex) => {
                const isGlitch = word.replace(/[^A-Za-z]/g, '') === GLITCH_KEYWORD;
                const letters = word.split('');
                return (
                  <span
                    key={`${word}-${wordIndex}`}
                    className={isGlitch ? 'sr-glitch' : undefined}
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      marginRight: '0.26em',
                      marginBottom: '0.06em',
                    }}
                  >
                    {letters.map((letter, letterIndex) => {
                      const delay = reduced ? 0 : Math.min(letterCursor * 26, 900);
                      letterCursor += 1;
                      return (
                        <span
                          key={`${letter}-${letterIndex}`}
                          className="sr-glitch-letter"
                          style={{
                            transform: reduced ? 'none' : `translateY(${phase >= 1 ? 0 : 14}px)`,
                            opacity: reduced ? 1 : phase >= 1 ? 1 : 0,
                            transition: reduced
                              ? 'none'
                              : `transform 420ms cubic-bezier(0.22,0.61,0.36,1) ${delay}ms, opacity 300ms linear ${delay}ms`,
                          }}
                        >
                          {letter}
                        </span>
                      );
                    })}

                    {/* glitch ghost layer — decorative duplicate of the keyword */}
                    {isGlitch && !reduced ? (
                      <span className="sr-glitch__ghost" data-glitching={phase >= 2}>
                        {word}
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </span>
          </h1>

          <p className="sr-hero__sub">
            Live 24 hours. Community stories. East African music. 91.7 FM and online.
          </p>

          {/* CTAs — interactive from the very first paint (EFFECT-23) */}
          <div className="sr-hero__ctas">
            <button
              type="button"
              className="sr-btn sr-btn--white"
              onClick={() => {
                play();
                document.getElementById('player')?.scrollIntoView({ block: 'nearest' });
              }}
            >
              <PlayCircle size={17} aria-hidden="true" />
              Listen Live
            </button>
            <Link className="sr-btn sr-btn--ghost-light" href="/#schedule">
              <Headphones size={17} aria-hidden="true" />
              Browse Shows
            </Link>
          </div>

          {/* Live listener count */}
          <p className="sr-hero__listeners" role="status" aria-live="polite">
            <span className="sr-hero__listenercount">{formatListeners(listeners.count)}</span>
            {' listening now'}
            {listeners.status === 'reconnecting' ? ' · reconnecting' : ''}
          </p>
        </div>

        {/* EFFECT-01 — Three.js microphone, drag/arrow-key orbit, poster fallback */}
        <HeroMicCanvas
          poster={
            <div className="sr-hero__poster">
              <div>
                <p className="font-display text-[64px] leading-none text-white/25">91.7</p>
                <p className="text-white/85 mt-3">
                  Audio-only presentation. The interactive 3D microphone is disabled because your
                  device requests reduced motion.
                </p>
                <p className="sr-meta text-white/60 mt-2">
                  Poster: Silas Radio studio microphone, 91.7 FM Nairobi.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}
