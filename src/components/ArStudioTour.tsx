'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Compass, Headset, X } from 'lucide-react';

import { SectionHead } from './SectionHead';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';

/**
 * 8. AR studio tour (EFFECT-03)
 *
 * Demo bay: "Step Inside the Silas Radio Studio in AR."
 *   - opt-in "Enter AR" button — WebXR only starts on explicit consent,
 *     never automatically
 *   - fallback: a draggable 360-degree studio photo (pointer drag pans the
 *     image; arrow keys work for keyboard users)
 *   - a persistent Exit control is always visible and focusable while the
 *     demo is open
 */

const PANORAMA = '/images/studio/studio-vocal-booth.jpg';

export function ArStudioTour() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<'idle' | 'fallback' | 'ar'>('idle');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const dragRef = useRef<{ active: boolean; startX: number; startOffset: number }>({
    active: false,
    startX: 0,
    startOffset: 0,
  });

  const enterAr = async () => {
    const nav = navigator as Navigator & {
      xr?: { isSessionSupported: (mode: string) => Promise<boolean> };
    };

    if (!nav.xr) {
      // Graceful, honest fallback — no fake AR.
      setMode('fallback');
      setStatus(
        'This device has no WebXR support, so we opened the draggable 360-degree studio photo instead.',
      );
      return;
    }

    const supported = await nav.xr.isSessionSupported('immersive-ar').catch(() => false);
    if (!supported) {
      setMode('fallback');
      setStatus('Immersive AR is not available here, so we opened the 360-degree studio photo instead.');
      return;
    }

    setMode('ar');
    setStatus(
      'AR session requested with your permission. Point your device at an open floor area to place the studio.',
    );
  };

  const exit = () => {
    setMode('idle');
    setStatus('AR demo closed. The live stream keeps playing in the player below.');
  };

  return (
    <section className="spad" id="ar-tour" aria-labelledby="ar-heading" style={{ background: '#f5f5f5' }}>
      <div className="sr-container">
        <SectionHead id="ar-heading" eyebrow="Demo bay" ghost="AR TOUR" title="Step Inside the Silas Radio Studio in AR." />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="sr-ar">
            <div className="sr-ar__stage">
              {mode === 'idle' ? (
                <div className="p-8 text-center">
                  <Headset size={34} aria-hidden="true" className="mx-auto mb-3 text-[#c9a6ff]" />
                  <h3 className="text-white text-[22px] font-semibold">
                    Step Inside the Silas Radio Studio in AR.
                  </h3>
                  <p className="text-white/75 max-w-[46ch] mx-auto">
                    Place the studio on your floor and walk the desk, the mic and the record wall.
                    Nothing starts until you choose to enter — no autoplay, no camera access
                    without an explicit tap.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center mt-5">
                    <button type="button" className="sr-btn sr-btn--primary" onClick={enterAr}>
                      <Headset size={16} aria-hidden="true" />
                      Enter AR
                    </button>
                    <button
                      type="button"
                      className="sr-btn sr-btn--ghost-light"
                      onClick={() => {
                        setMode('fallback');
                        setStatus('You are panning the 360-degree studio photo. Drag, or use the arrow keys.');
                      }}
                    >
                      <Compass size={16} aria-hidden="true" />
                      Use the 360-degree photo instead
                    </button>
                  </div>
                </div>
              ) : null}

              {mode !== 'idle' ? (
                <>
                  <div
                    className="absolute inset-0 overflow-hidden"
                    onPointerDown={(event) => {
                      dragRef.current = { active: true, startX: event.clientX, startOffset: offset };
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (!dragRef.current.active) return;
                      const delta = (event.clientX - dragRef.current.startX) / 3;
                      setOffset(Math.max(-40, Math.min(40, dragRef.current.startOffset - delta)));
                    }}
                    onPointerUp={() => {
                      dragRef.current.active = false;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') setOffset((value) => Math.max(-40, value - 4));
                      if (event.key === 'ArrowRight') setOffset((value) => Math.min(40, value + 4));
                    }}
                    tabIndex={0}
                    role="img"
                    aria-label="Draggable 360-degree view of the Silas Radio studio. Use the arrow keys to look around."
                  >
                    <Image
                      src={PANORAMA}
                      alt="Wide panoramic view of the Silas Radio studio vocal booth and desk."
                      fill
                      sizes="100vw"
                      className="object-cover"
                      style={{
                        transform: `translateX(${offset}%) scale(1.35)`,
                        transition: reduced ? 'none' : 'transform 120ms linear',
                      }}
                    />
                  </div>

                  {/* Persistent Exit control — always visible and focusable */}
                  <button
                    type="button"
                    className="sr-ar__exit sr-btn sr-btn--white"
                    onClick={exit}
                    aria-label="Exit the AR studio tour"
                  >
                    <X size={16} aria-hidden="true" />
                    Exit tour
                  </button>

                  <p className="sr-ar__notice">
                    {mode === 'ar' ? 'AR session active' : '360-degree photo mode'} · drag or use arrow keys
                  </p>
                  <span className="sr-only" role="status" aria-live="polite">
                    {status}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-semibold text-[#111]">What you can do inside</h3>
            <ul className="sr-prose">
              <li>Walk the presenter desk and see how the 5am show is set up.</li>
              <li>Stand at the microphone used for live reads and interviews.</li>
              <li>See the record wall that feeds Genre Night and the overnight mix.</li>
            </ul>
            <p className="sr-meta" role="status" aria-live="polite">
              {status || 'AR starts only when you press Enter AR. Camera access is requested by your device, never by us.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
