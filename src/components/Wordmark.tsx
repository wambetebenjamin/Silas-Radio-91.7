'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';

/**
 * EFFECT-08 — "SILAS RADIO" wordmark that self-draws stroke by stroke.
 *
 * - Path length measured at runtime with `getTotalLength()`, then driven
 *   through `stroke-dasharray` / `stroke-dashoffset`.
 * - Draws once on mount; `replay` re-runs it (used by the nav logo click and
 *   gallery card 2).
 * - Reused as the preloader wordmark.
 * - Under reduced motion the wordmark is simply present, fully drawn.
 *
 * Letterforms are stroke-drawn geometric capitals fitting a 10 x 14 grid,
 * matching the stencil-display character of the design source's Rockville Solid.
 */

type Stroke = string;

/** Each letter is one or more stroke path strings on a 10-wide, 14-tall grid. */
const GLYPHS: Record<string, Stroke[]> = {
  S: ['M8.6 1.4 C6.4 0.2 2.4 0.5 1.7 3.2 C1 5.9 4.4 6.6 6.4 7.2 C8.9 7.9 9.4 10.4 7.4 12.2 C5.4 14 1.9 13.6 1.2 12.1'],
  I: ['M5 1 L5 13'],
  L: ['M2 1 L2 13 L9 13'],
  A: ['M1 13 L5 1 L9 13', 'M2.6 8.6 L7.4 8.6'],
  R: ['M2 13 L2 1 L6.2 1 C8.6 1 9.3 4.4 6.2 6.2 L2 6.2', 'M5.2 6.2 L9 13'],
  D: ['M2 13 L2 1 L5.4 1 C9.6 1 10.4 13 5.4 13 Z'],
  O: ['M5 1 C1.2 1 0.6 4 0.6 7 C0.6 10 1.2 13 5 13 C8.8 13 9.4 10 9.4 7 C9.4 4 8.8 1 5 1 Z'],
  ' ': [],
};

const WORD = 'SILAS RADIO';
const LETTER_WIDTH = 12;
const LETTER_GAP = 3; // extra for spaces
const HEIGHT = 14;

export interface WordmarkProps {
  /** CSS colour for the strokes. */
  color?: string;
  /** Width of the rendered svg in px (height follows the ratio). */
  width?: number;
  /** Milliseconds for the full draw. */
  duration?: number;
  /** Increment to replay the animation. */
  replayKey?: number;
  className?: string;
  /** Accessible label; set to null for decorative usage. */
  label?: string | null;
}

export function Wordmark({
  color = 'currentColor',
  width = 320,
  duration = 1600,
  replayKey = 0,
  className = '',
  label = 'Silas Radio 91.7',
}: WordmarkProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  // Total width: letters + extra gap where a space occurs
  const totalUnits = WORD.split('').reduce(
    (sum, char) => sum + (char === ' ' ? LETTER_GAP + 4 : LETTER_WIDTH),
    0,
  );
  const height = (width / totalUnits) * HEIGHT;

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('path'));
    if (!strokes.length) return;

    // Path length measured at runtime (spec requirement).
    const lengths = strokes.map((path) => {
      try {
        return path.getTotalLength();
      } catch {
        return 0;
      }
    });

    const total = lengths.reduce((sum, value) => sum + value, 0) || 1;

    if (reduced) {
      strokes.forEach((path) => {
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
      });
      setDrawn(true);
      return;
    }

    let elapsedBefore = 0;
    strokes.forEach((path, index) => {
      const length = lengths[index] || 1;
      const share = (length / total) * duration;
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.transition = `stroke-dashoffset ${Math.max(share, 120)}ms cubic-bezier(0.22,0.61,0.36,1) ${elapsedBefore}ms, opacity 200ms linear ${elapsedBefore}ms`;
      // force a frame so the transition applies
      void path.getBoundingClientRect();
      path.style.strokeDashoffset = '0';
      elapsedBefore += Math.max(share, 120) * 0.82;
    });

    const timer = setTimeout(() => setDrawn(true), duration + 200);
    return () => clearTimeout(timer);
  }, [duration, reduced]);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey, reduced]);

  let cursor = 0;

  return (
    <svg
      ref={svgRef}
      className={`sr-wordmark ${className}`}
      data-done={drawn}
      viewBox={`0 0 ${totalUnits} ${HEIGHT}`}
      width={width}
      height={height}
      role={label ? 'img' : 'presentation'}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      style={{ color }}
    >
      {WORD.split('').map((char, charIndex) => {
        const glyph = GLYPHS[char] ?? [];
        const offset = cursor;
        cursor += char === ' ' ? LETTER_GAP + 4 : LETTER_WIDTH;

        if (char === ' ') return null;

        return (
          <g key={`${char}-${charIndex}`} transform={`translate(${offset}, 0)`}>
            {glyph.map((d, strokeIndex) => (
              <path key={strokeIndex} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
