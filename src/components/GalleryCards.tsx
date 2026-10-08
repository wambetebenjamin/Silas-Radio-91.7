'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Wordmark } from './Wordmark';
import { useInViewport, useReducedMotion } from '@/hooks/useMotionAndLayout';

/* ==========================================================================
   Card 1 — EFFECT-07: SVG line-art signal waves emanating from a tower,
   looping while in the viewport. role="img"; static under reduced motion.
   ========================================================================== */
export function SignalWavesCard() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewport(ref, { threshold: 0.4 });

  return (
    <div ref={ref} className="sr-gcard__art" style={{ color: '#c9a6ff' }}>
      <svg
        viewBox="0 0 200 200"
        width="170"
        height="170"
        role="img"
        aria-label="Silas Radio signal animation."
        data-static={reduced}
      >
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          {/* tower */}
          <path d="M100 172 L100 84" />
          <path d="M84 172 L100 96 L116 172" />
          <path d="M92 140 L108 140 M88 158 L112 158" />
          <circle cx="100" cy="76" r="6" fill="currentColor" stroke="none" />
        </g>

        {/* looping signal waves while in viewport */}
        <g fill="none" stroke="#5c00ce" strokeWidth="2.5" strokeLinecap="round">
          {[0, 1, 2, 3].map((index) => (
            <path
              key={index}
              className={`sr-signal-wave sr-signal-wave--${(index % 3) + 1}`}
              d={
                index % 2 === 0
                  ? `M${124 + index * 12} ${76 - index * 12} a ${28 + index * 12} ${28 + index * 12} 0 0 1 0 ${(28 + index * 12) * 2}`
                  : `M${76 - index * 12} ${76 - index * 12} a ${28 + index * 12} ${28 + index * 12} 0 0 0 0 ${(28 + index * 12) * 2}`
              }
              style={{ animationPlayState: inView && !reduced ? 'running' : 'paused' }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Card 2 — EFFECT-08: reuses the self-drawn SILAS RADIO wordmark.
   ========================================================================== */
export function WordmarkCard() {
  const [replay, setReplay] = useState(0);
  return (
    <div className="sr-gcard__art" style={{ color: '#ffffff' }}>
      <div className="grid justify-items-center gap-4">
        <Wordmark width={220} duration={1500} replayKey={replay} color="#ffffff" label={null} />
        <button type="button" className="sr-btn sr-btn--ghost-light" onClick={() => setReplay((v) => v + 1)}>
          Replay the draw
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Card 3 — EFFECT-09: SVG morph cycling mic → headphones → speaker with
   matched points. Reversible on mouse-out, triggered by focus,
   crossfade under reduced motion.
   ========================================================================== */

/** All three shapes are 24-point polygons so the interpolation is 1:1. */
const SHAPES: number[][][] = [
  // 0 — microphone
  [
    [86, 24], [96, 26], [104, 34], [110, 46], [112, 60], [112, 78], [110, 92], [104, 104],
    [96, 112], [86, 114], [76, 112], [68, 104], [62, 92], [60, 78], [60, 60], [62, 46],
    [68, 34], [76, 26], [92, 122], [82, 140], [74, 156], [86, 166], [104, 166], [116, 156],
  ],
  // 1 — headphones
  [
    [60, 60], [66, 46], [78, 34], [92, 28], [106, 34], [118, 46], [124, 60], [126, 76],
    [124, 92], [118, 104], [112, 92], [112, 74], [108, 62], [96, 54], [82, 58], [72, 68],
    [68, 82], [68, 100], [60, 104], [54, 92], [50, 76], [52, 64], [70, 116], [118, 116],
  ],
  // 2 — speaker
  [
    [66, 30], [82, 26], [100, 26], [118, 28], [130, 36], [134, 54], [136, 76], [136, 98],
    [134, 118], [130, 138], [118, 148], [100, 152], [82, 150], [68, 142], [60, 124], [58, 100],
    [58, 76], [60, 52], [86, 92], [104, 92], [112, 106], [104, 120], [86, 120], [78, 106],
  ],
];

function lerpShape(from: number[][], to: number[][], t: number): number[][] {
  return from.map(([x, y], index) => {
    const [tx, ty] = to[index];
    return [x + (tx - x) * t, y + (ty - y) * t];
  });
}

function toPath(points: number[][]): string {
  return `${points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`;
}

export function MorphCard() {
  const reduced = useReducedMotion();
  const [target, setTarget] = useState(0);
  const [path, setPath] = useState(() => toPath(SHAPES[0]));
  const currentRef = useRef<number[][]>(SHAPES[0]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const goal = SHAPES[target];
      const next = lerpShape(currentRef.current, goal, 0.12);
      // stop when close enough, to avoid burning frames forever
      const settled = next.every(([x, y], index) => Math.abs(x - goal[index][0]) < 0.4 && Math.abs(y - goal[index][1]) < 0.4);
      currentRef.current = settled ? goal : next;
      setPath(toPath(currentRef.current));
      if (settled && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [target, reduced]);

  if (reduced) {
    // Crossfade under reduced motion instead of morphing geometry.
    return (
      <div className="sr-gcard__art" style={{ color: '#7ee787' }}>
        <svg viewBox="0 0 200 200" width="170" height="170" role="img" aria-label="Microphone, headphones and speaker icons crossfading.">
          {SHAPES.map((shape, index) => (
            <path
              key={index}
              className="sr-morph__shape"
              d={toPath(shape)}
              data-visible={index === target}
              style={{ opacity: index === target ? 1 : 0, transition: 'opacity 200ms linear' }}
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="sr-gcard__art" style={{ color: '#7ee787' }}>
      <div className="grid justify-items-center gap-3">
        <svg viewBox="0 0 200 200" width="165" height="165" role="img" aria-label="Morphing icon cycling between a microphone, headphones and a speaker.">
          <path className="sr-morph__shape" d={path} />
        </svg>
        <div
          className="flex gap-2"
          onMouseLeave={() => setTarget(0)}
          onFocus={() => setTarget(2)}
          onBlur={() => setTarget(0)}
        >
          {['Mic', 'Headphones', 'Speaker'].map((label, index) => (
            <button
              key={label}
              type="button"
              className="sr-btn sr-btn--ghost-light"
              onMouseEnter={() => setTarget(index)}
              onFocus={() => setTarget(index)}
              aria-pressed={target === index}
              aria-label={`Morph to ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Card 4 — EFFECT-13: SVG mascot, a cartoon DJ at a turntable, reacting to
   hover and focus. aria-hidden. Static pose under reduced motion.
   The waving variant is exported for the advertising CTA band.
   ========================================================================== */
export function MascotCard({ waving = false }: { waving?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className="sr-gcard__art" data-static={reduced}>
      <svg viewBox="0 0 180 160" width="180" height="150" aria-hidden="true">
        {/* turntable */}
        <rect x="16" y="104" width="148" height="42" rx="6" fill="#241b33" stroke="#5c00ce" strokeWidth="2" />
        <circle cx="52" cy="125" r="17" fill="#111" stroke="#673ab7" strokeWidth="2" />
        <circle cx="52" cy="125" r="4" fill="#5c00ce" />
        <rect x="86" y="112" width="8" height="26" rx="2" fill="#8a8a96" />
        <rect x="104" y="112" width="8" height="26" rx="2" fill="#8a8a96" />
        <rect x="124" y="116" width="30" height="18" rx="3" fill="#2f2540" stroke="#7e00ad" strokeWidth="1.5" />

        {/* DJ body */}
        <path d="M62 104 L62 76 C62 66 70 58 80 58 L100 58 C110 58 118 66 118 76 L118 104 Z" fill="#5c00ce" />
        {/* head + headphones */}
        <circle cx="90" cy="42" r="18" fill="#8d5524" />
        <path d="M72 40 a18 18 0 0 1 36 0" fill="none" stroke="#111" strokeWidth="4" />
        <rect x="68" y="38" width="7" height="12" rx="3" fill="#111" />
        <rect x="105" y="38" width="7" height="12" rx="3" fill="#111" />
        <circle cx="84" cy="44" r="2.4" fill="#111" />
        <circle cx="96" cy="44" r="2.4" fill="#111" />
        <path d="M84 52 q6 5 12 0" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />

        {/* arms — the right arm waves in the advertising variant */}
        <path d="M64 78 L44 96" stroke="#8d5524" strokeWidth="7" strokeLinecap="round" />
        <g className={waving ? 'sr-mascot__arm' : undefined}>
          <path d="M116 78 L138 92" stroke="#8d5524" strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* spinning disc */}
        <g className="sr-mascot__disc">
          <circle cx="150" cy="52" r="14" fill="#0d0d0d" stroke="#c9a6ff" strokeWidth="2" />
          <circle cx="150" cy="52" r="3" fill="#7e00ad" />
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Card 5 — EFFECT-14: faux-3D vinyl record built from stacked CSS layers with
   pointer-driven tilt. No WebGL. Flat under reduced motion.
   ========================================================================== */
export function VinylCard() {
  const reduced = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div className="sr-gcard__art">
      <div
        ref={sceneRef}
        className="sr-vinyl-scene"
        onPointerMove={(event) => {
          if (reduced) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          setTilt({ x: py * -22, y: px * 26 });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        role="img"
        aria-label="Vinyl record rendered in stacked CSS layers, tilting with pointer movement."
      >
        <div
          className="sr-vinyl"
          style={{
            transform: reduced
              ? 'none'
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          }}
        >
          <span className="sr-vinyl__disc" />
          <span className="sr-vinyl__shine" />
          <span className="sr-vinyl__label" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Card 6 — EFFECT-16: mixed-media collage — Nairobi skyline cut-out, radio
   tower vector, grain overlay. Lazy-loaded dimensioned images. Static under RM.
   ========================================================================== */
export function CollageCard() {
  return (
    <div className="sr-gcard__art">
      <div className="sr-collage">
        <div className="sr-collage__photo">
          <Image
            src="/images/culture/nairobi-skyline.jpg"
            alt="Cut-out of the Nairobi city skyline used in the station collage."
            width={500}
            height={750}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 60vw, 260px"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <span className="sr-collage__grain" aria-hidden="true" />
        <svg className="sr-collage__tower" viewBox="0 0 90 120" aria-hidden="true">
          <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
            <path d="M45 118 L45 34" />
            <path d="M30 118 L45 44 L60 118" />
            <path d="M36 84 L54 84 M33 100 L57 100" />
            <circle cx="45" cy="26" r="5" fill="#f44336" stroke="none" />
            <path d="M58 14 q16 12 0 24" />
            <path d="M32 14 q-16 12 0 24" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ==========================================================================
   Card 7 — EFFECT-17: liquid gooey blob on hover, SVG filter with a bounded
   region. The same filter (#sr-gooey-filter) is used on the 404 page.
   ========================================================================== */
export function GooeyCard() {
  const reduced = useReducedMotion();
  return (
    <div className="sr-gcard__art">
      <div className={`sr-gooey ${reduced ? 'sr-gooey--static' : ''}`} aria-hidden="true">
        <span className="sr-gooey__blob sr-gooey__blob--a" />
        <span className="sr-gooey__blob sr-gooey__blob--b" />
        <span className="sr-gooey__blob sr-gooey__blob--c" />
      </div>
    </div>
  );
}

/* ==========================================================================
   Card 8 — EFFECT-19: isometric radio station interior assembling on scroll,
   true 120-degree axes. Fully assembled under reduced motion.
   ========================================================================== */
export function IsometricCard() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewport(ref, { threshold: 0.35 });

  const assembled = reduced || inView;

  return (
    <div ref={ref} className="sr-gcard__art">
      <svg
        viewBox="0 0 220 190"
        width="210"
        height="180"
        className="sr-iso"
        data-assembled={assembled}
        role="img"
        aria-label="Isometric illustration of the Silas Radio studio: desk, microphone and monitor assembling into place."
      >
        <g className="sr-iso__piece">
          {/* floor plate on true 120-degree isometric axes */}
          <path d="M110 150 L190 106 L110 62 L30 106 Z" fill="#241b33" stroke="#5c00ce" strokeWidth="2" />
        </g>
        <g className="sr-iso__piece">
          {/* back walls */}
          <path d="M30 106 L30 54 L110 10 L110 62 Z" fill="#1b1230" stroke="#673ab7" strokeWidth="2" />
          <path d="M190 106 L190 54 L110 10 L110 62 Z" fill="#150e26" stroke="#673ab7" strokeWidth="2" />
        </g>
        <g className="sr-iso__piece">
          {/* desk */}
          <path d="M70 118 L120 90 L160 112 L110 140 Z" fill="#3a2c56" stroke="#c9a6ff" strokeWidth="1.6" />
          <path d="M70 118 L70 128 L110 150 L110 140 Z" fill="#231839" stroke="#c9a6ff" strokeWidth="1.4" />
          <path d="M110 140 L110 150 L160 122 L160 112 Z" fill="#1d1530" stroke="#c9a6ff" strokeWidth="1.4" />
        </g>
        <g className="sr-iso__piece">
          {/* microphone + boom on the desk */}
          <path d="M96 92 L96 74" stroke="#e9e3f5" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="91" y="60" width="10" height="15" rx="4" fill="#5c00ce" stroke="#e9e3f5" strokeWidth="1.6" />
          <path d="M96 74 L110 84" stroke="#e9e3f5" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <g className="sr-iso__piece">
          {/* monitor + speaker */}
          <path d="M128 84 L146 74 L162 84 L144 94 Z" fill="#0f0a1e" stroke="#7ee787" strokeWidth="1.6" />
          <rect x="60" y="96" width="14" height="10" rx="2" fill="#0f0a1e" stroke="#ffd166" strokeWidth="1.4" />
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Card 9 — EFFECT-21: hand-drawn doodle of musical notes and sound waves.
   Decorative, aria-hidden, kept clear of any labels.
   ========================================================================== */
export function DoodleCard() {
  return (
    <div className="sr-gcard__art">
      <svg viewBox="0 0 220 160" width="215" height="150" aria-hidden="true">
        <g fill="none" stroke="#c9a6ff" strokeWidth="1.8" strokeLinecap="round">
          {/* stave-free note doodles */}
          <path d="M34 118 C34 104 34 78 34 62" />
          <path d="M34 62 C48 58 56 62 60 68" />
          <ellipse cx="26" cy="120" rx="9" ry="6.5" transform="rotate(-18 26 120)" fill="#c9a6ff" stroke="none" />
          <path d="M92 108 C92 96 92 76 92 64" />
          <path d="M92 64 C106 60 112 64 116 70" />
          <ellipse cx="84" cy="110" rx="9" ry="6.5" transform="rotate(-18 84 110)" fill="#c9a6ff" stroke="none" />
          <path d="M34 62 C60 46 92 46 116 70" />
          {/* sound waves */}
          <path d="M138 44 q14 16 0 32" />
          <path d="M152 36 q22 24 0 48" />
          <path d="M166 28 q30 32 0 64" />
          <path d="M180 20 q38 40 0 80" />
          {/* falling notes */}
          <ellipse cx="188" cy="126" rx="8" ry="6" transform="rotate(-20 188 126)" fill="#7ee787" stroke="none" />
          <path d="M196 122 L196 104" stroke="#7ee787" />
          <ellipse cx="150" cy="140" rx="7" ry="5" transform="rotate(-20 150 140)" fill="#ffd166" stroke="none" />
          <path d="M157 137 L157 122" stroke="#ffd166" />
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Card 10 — EFFECT-31: stop-motion of a vinyl record spinning and a needle
   dropping, 8–12fps, single sprite sheet. Halts off-screen. Static first
   frame under reduced motion.
   Frame size 240x200, 12 frames → sprite sheet 2880x200.
   ========================================================================== */
export function StopMotionCard() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewport(ref, { threshold: 0.25 });

  return (
    <div ref={ref} className="sr-gcard__art">
      <div
        className="sr-spritesheet"
        role="img"
        aria-label="Stop-motion animation of a vinyl record spinning while the needle drops onto it."
        data-paused={!inView}
        data-reduced={reduced}
        style={reduced ? { animation: 'none', backgroundPosition: '0 0' } : undefined}
      />
      <p className="sr-meta mt-2 mb-0">12 frames · stepped at 8fps · halts off-screen</p>
    </div>
  );
}
