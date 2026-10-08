'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Headphones, PlayCircle, Radio } from 'lucide-react';

import { DAYS, SCHEDULE, formatDurationLabel, isSlotLive, type Day, type ShowSlot } from '@/lib/site';
import { usePlayerStore } from '@/store/player';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';
import { SectionHead } from './SectionHead';

/**
 * 5. Show schedule
 *
 * EFFECT-24 — shimmer skeleton rows that match the real row dimensions exactly
 *   (same 5-column grid, same 64px min-height), `aria-busy` on the container,
 *   plain non-shimmering grey under reduced motion, zero CLS.
 *   The server renders real rows first ("Schedule: SSR for real-time show data")
 *   so the skeleton is used for day switches and background refreshes, never
 *   as a first-paint placeholder — that keeps LCP early and the HTML crawlable.
 *
 * EFFECT-15 — horizontal scroll-snap rail of day tabs, labelled
 *   "Schedule days, 7 items.", keyboard navigable, plain wrapped grid under
 *   reduced motion.
 *
 * Each time slot shows: show name, presenter, duration, a Listen button when a
 * recording exists, and a Live badge when the show is currently on air.
 */

export interface ScheduleProps {
  initialSchedule: ShowSlot[];
  initialGeneratedAt: string;
  /** Optional widget rendered beside the schedule (EFFECT-27 studio cluster). */
  aside?: React.ReactNode;
}

export function Schedule({ initialSchedule, initialGeneratedAt, aside }: ScheduleProps) {
  const reduced = useReducedMotion();
  const [slots, setSlots] = useState<ShowSlot[]>(initialSchedule);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const [day, setDay] = useState<Day | 'all'>(() => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' }) as Day;
    return DAYS.includes(today) ? today : 'all';
  });
  const [busy, setBusy] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const refresh = useCallback(
    async (showSkeleton: boolean) => {
      if (showSkeleton) setBusy(true);
      try {
        const response = await fetch('/api/schedule', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { schedule: ShowSlot[]; generatedAt: string };
        setSlots(data.schedule);
        setGeneratedAt(data.generatedAt);
      } catch {
        /* keep the server-rendered schedule */
      } finally {
        if (showSkeleton) setBusy(false);
      }
    },
    [],
  );

  // Background refresh keeps the Live badge true to the Nairobi clock.
  useEffect(() => {
    const stale = Date.now() - new Date(generatedAt).getTime() > 60_000;
    void refresh(stale);
    const timer = setInterval(() => void refresh(false), 60_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDay = (next: Day | 'all') => {
    setDay(next);
    void refresh(true); // day switches show the skeleton rows
  };

  // Recompute live flags client-side so the badge flips without a refetch.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => forceTick((value) => value + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const visible = useMemo(() => {
    const now = new Date();
    const list = day === 'all' ? slots : slots.filter((slot) => slot.days.includes(day));
    return list.map((slot) => ({ ...slot, live: isSlotLive(slot, now) }));
  }, [day, slots]);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = DAYS.length; // includes the "All week" tab at index 0
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % (last + 1);
    if (event.key === 'ArrowLeft') next = (index - 1 + last + 1) % (last + 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next !== index) {
      event.preventDefault();
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <section className="sr-section sr-section--light spad" id="schedule" aria-labelledby="schedule-heading">
      <div className="sr-container">
        <SectionHead
          id="schedule-heading"
          eyebrow="Today on 91.7"
          ghost="SCHEDULE"
          title="Shows and schedule"
        />

        {/* EFFECT-15 — scroll-snap day rail (plain wrapped grid under RM) */}
        <div
          className={reduced ? 'flex flex-wrap gap-2 mb-6' : 'sr-rail mb-6'}
          role="tablist"
          aria-label="Schedule days, 7 items."
        >
          <button
            type="button"
            role="tab"
            ref={(element) => {
              tabRefs.current[0] = element;
            }}
            aria-selected={day === 'all'}
            className="sr-rail__tab"
            onClick={() => handleDay('all')}
            onKeyDown={(event) => onTabKeyDown(event, 0)}
            tabIndex={day === 'all' ? 0 : -1}
          >
            All week
          </button>
          {DAYS.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              ref={(element) => {
                tabRefs.current[index + 1] = element;
              }}
              aria-selected={day === label}
              className="sr-rail__tab"
              onClick={() => handleDay(label)}
              onKeyDown={(event) => onTabKeyDown(event, index + 1)}
              tabIndex={day === label ? 0 : -1}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={aside ? 'grid gap-6 lg:grid-cols-[1.45fr_1fr] items-start' : undefined}>
        {/* EFFECT-24 — aria-busy container; skeleton rows match real dimensions */}
        <div
          className="rounded-[10px] border border-[#ebebeb] bg-white overflow-hidden"
          aria-busy={busy}
          aria-live="polite"
        >
          {busy
            ? Array.from({ length: Math.min(visible.length || 5, 6) }).map((_, index) => (
                <div className="sr-skel-row" key={`skel-${index}`} aria-hidden="true">
                  <span className="sr-skel sr-skel--badge" />
                  <span className="sr-skel" />
                  <span className="sr-skel" />
                  <span className="sr-skel sr-skel--badge" />
                  <span className="sr-skel sr-skel--btn" />
                </div>
              ))
            : visible.map((slot) => (
                <ScheduleRow key={`${slot.id}-${day}`} slot={slot} live={slot.live} />
              ))}

          {!busy && visible.length === 0 ? (
            <p className="p-6 sr-meta">No shows scheduled for this day yet.</p>
          ) : null}
        </div>

          {/* EFFECT-27 — neumorphic studio widget beside the schedule */}
          {aside ? <div className="lg:sticky lg:top-24">{aside}</div> : null}
        </div>

        <p className="sr-meta mt-3">
          Times are East Africa Time (UTC+3). Schedule last checked{' '}
          {new Date(generatedAt).toLocaleTimeString('en-KE', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Nairobi',
          })}
          .
        </p>
      </div>
    </section>
  );
}

function ScheduleRow({ slot, live }: { slot: ShowSlot; live: boolean }) {
  const play = usePlayerStore((state) => state.play);
  const setTrack = usePlayerStore((state) => state.setTrack);

  return (
    <div
      className="grid items-center gap-4 px-4 py-3 border-b border-[#ebebeb] last:border-b-0 min-h-[64px]"
      style={{ gridTemplateColumns: 'minmax(96px, 110px) minmax(0, 1.6fr) minmax(0, 1fr) auto' }}
      data-live={live}
    >
      <p className="sr-meta mb-0 whitespace-nowrap">
        {formatDurationLabel(slot.start, slot.end)}
      </p>

      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold text-[#111] truncate">{slot.name}</h3>
        <p className="sr-meta mb-0 truncate">
          {slot.presenter} · {slot.duration}
        </p>
        <p className="sr-meta mb-0 mt-1 hidden md:block">{slot.description}</p>
      </div>

      <div className="hidden md:flex flex-wrap items-center gap-2">
        {live ? (
          <span className="sr-badge sr-badge--live">
            <Radio size={12} aria-hidden="true" /> Live now
          </span>
        ) : null}
        {slot.hasRecording ? (
          <span className="sr-badge sr-badge--recorded">
            <Headphones size={12} aria-hidden="true" /> Recording
          </span>
        ) : (
          <span className="sr-badge sr-badge--soon">
            <Calendar size={12} aria-hidden="true" /> Live only
          </span>
        )}
      </div>

      <div className="flex justify-end">
        {slot.hasRecording ? (
          <button
            type="button"
            className="sr-btn sr-btn--outline"
            onClick={() => {
              setTrack({
                id: slot.id,
                title: `${slot.name} — recorded episode`,
                artist: slot.presenter,
                presenter: slot.presenter,
                show: slot.name,
                durationSeconds: 1800,
                streamUrl: '/audio/stream/demo-02.mp3',
                isLive: false,
                shareUrl: `${window.location.origin}/#schedule`,
              });
              play();
              document.getElementById('player')?.scrollIntoView({ block: 'nearest' });
            }}
            aria-label={`Listen to a recorded episode of ${slot.name} with ${slot.presenter}`}
          >
            <PlayCircle size={15} aria-hidden="true" />
            Listen
          </button>
        ) : (
          <span className="sr-meta">On air only</span>
        )}
      </div>
    </div>
  );
}

export { SCHEDULE };
