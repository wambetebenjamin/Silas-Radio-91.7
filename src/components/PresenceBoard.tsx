'use client';

import { Pause, Play, Users } from 'lucide-react';

import { SITE } from '@/lib/site';
import { formatListeners, useListeners } from '@/hooks/useListeners';
import { usePlayerStore } from '@/store/player';

/**
 * 11. Presence live board (EFFECT-05)
 *
 * "9,014 listeners online now" counter above the player, plus coloured listener
 * dots that appear around the play button representing concurrent listeners.
 *
 * Realtime updates arrive over the /api/ws stream with optimistic local updates,
 * automatic reconnection and a graceful single-visitor state.
 */

const DOT_COLORS = ['#7ee787', '#5c00ce', '#f44336', '#673ab7', '#22e6ff', '#ffd166', '#ff49d0'];

export function PresenceBoard() {
  const { count, status, singleVisitor } = useListeners(SITE.presenceSeed);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggle = usePlayerStore((state) => state.toggle);

  // One dot per ~1.6k listeners, capped so the ring stays readable.
  const dotCount = Math.min(14, Math.max(3, Math.round(count / 1600)));

  return (
    <section
      className="sr-section sr-section--dark py-10"
      aria-labelledby="presence-heading"
      data-status={status}
    >
      <div className="sr-container flex flex-col items-center gap-6 text-center">
        <div>
          <h2 id="presence-heading" className="text-white text-[26px] font-bold">
            <span className="font-display text-[42px] align-middle mr-2">{formatListeners(count)}</span>
            listeners online now
          </h2>
          <p className="sr-meta" role="status" aria-live="polite">
            {singleVisitor
              ? 'You are the first one here today — welcome. The stream is live from Nairobi.'
              : status === 'live'
                ? 'Live from Nairobi, 91.7 FM and online'
                : status === 'reconnecting'
                  ? 'Reconnecting to the listener board…'
                  : 'Connecting to the listener board…'}
          </p>
        </div>

        {/* Coloured listener dots around the play button */}
        <div className="sr-presence">
          <div className="sr-presence__dots" aria-hidden="true">
            {Array.from({ length: dotCount }).map((_, index) => {
              const angle = (index / dotCount) * Math.PI * 2;
              const radius = 54 + (index % 3) * 11;
              return (
                <span
                  key={index}
                  className="sr-presence__dot"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px - 3.5px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px - 3.5px)`,
                    background: DOT_COLORS[index % DOT_COLORS.length],
                    animationDelay: `${index * 60}ms`,
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            className="sr-player__btn sr-player__btn--play"
            onClick={toggle}
            aria-label={isPlaying ? 'Pause the live stream' : 'Play the live stream'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
          </button>
        </div>

        <p className="sr-meta flex items-center gap-2">
          <Users size={13} aria-hidden="true" />
          {dotCount} groups of concurrent listeners represented around the play button
        </p>
      </div>
    </section>
  );
}
