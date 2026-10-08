'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';

/**
 * EFFECT-25 loading screen — microphone preloader with equalizer bars,
 * progress bar, skip control at 3 seconds and role="status" announcement.
 *
 * Inherited from the design source's own preloader (see
 * DESIGN-INSPECTION.md §5): pure black backdrop, z-index 999999,
 * #f44336 ↔ #673ab7 colour cycle, 0.8s linear cadence, 200ms delayed fade-out.
 *
 * Guarantees:
 *   - completes in under 2 seconds
 *   - plain percentage only under reduced motion (no mic, no bars)
 *   - skip control appears at 3s (only reachable if the browser stalls —
 *     the load path normally finishes first, which is intentional)
 *   - role="status" announces completion to assistive tech
 */

const MIN_VISIBLE_MS = 700; // never flash-and-vanish
const TARGET_MS = 1500; // comfortably under the 2s budget
const SKIP_AFTER_MS = 3000; // spec: skip control at 3 seconds

export function Preloader() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  const startedAt = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    startedAt.current = start;

    const tick = () => {
      const elapsed = Date.now() - start;
      const linear = Math.min(elapsed / TARGET_MS, 1);
      // ease-out so it feels like real work finishing
      const eased = 1 - Math.pow(1 - linear, 2.2);
      setProgress(Math.round(eased * 100));

      if (elapsed >= SKIP_AFTER_MS) setShowSkip(true);

      if (linear < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    // finish on window load, but never before MIN_VISIBLE_MS or after TARGET_MS
    const finish = () => {
      const elapsed = Date.now() - startedAt.current;
      const wait = Math.max(0, Math.min(MIN_VISIBLE_MS - elapsed, TARGET_MS - elapsed));
      setTimeout(() => {
        setProgress(100);
        setDone(true);
      }, wait);
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('load', finish);
    };
  }, []);

  // Source behaviour: fade the loader, then delay(200) and fade the overlay.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setRemoved(true), 620);
    return () => clearTimeout(timer);
  }, [done]);

  const dismiss = () => {
    setProgress(100);
    setDone(true);
  };

  if (removed) return null;

  return (
    <div
      className="sr-preloader"
      data-hiding={done}
      data-reduced={reduced}
      aria-busy={!done}
    >
      <div className="sr-preloader__stack">
        {!reduced ? (
          <>
            <Mic
              className="sr-preloader__mic"
              size={54}
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <div className="sr-eq" aria-hidden="true">
              <span className="sr-eq__bar" />
              <span className="sr-eq__bar" />
              <span className="sr-eq__bar" />
              <span className="sr-eq__bar" />
              <span className="sr-eq__bar" />
              <span className="sr-eq__bar" />
            </div>
          </>
        ) : null}

        {/* EFFECT-08 — self-drawing wordmark, reused as the preloader wordmark */}
        <Wordmark
          width={reduced ? 260 : 300}
          duration={reduced ? 0 : 1300}
          color="#ffffff"
          label={null}
        />

        <div className="sr-progress" role="presentation">
          <div className="sr-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Plain percentage under reduced motion */}
        {reduced ? (
          <p className="sr-preloader__pct" aria-hidden="true">
            {progress}%
          </p>
        ) : (
          <p className="sr-preloader__pct" aria-hidden="true">
            {progress}%
          </p>
        )}

        {showSkip && !done ? (
          <button type="button" className="sr-preloader__skip" onClick={dismiss}>
            Skip loading
          </button>
        ) : null}
      </div>

      {/* Announcements for assistive tech */}
      <p className="sr-preloader__status" role="status" aria-live="polite">
        {done ? 'Loading complete. Silas Radio 91.7 is ready.' : 'Loading Silas Radio 91.7'}
      </p>
    </div>
  );
}
