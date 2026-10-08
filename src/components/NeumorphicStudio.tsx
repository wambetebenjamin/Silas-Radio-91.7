'use client';

import { useEffect, useState } from 'react';
import { Activity, Thermometer, Timer, Volume2 } from 'lucide-react';

/**
 * 12. Neumorphic studio widget (EFFECT-27) — embedded beside the show schedule.
 *
 * Cluster:
 *   - on-air toggle with a pulsing LED indicator
 *   - BPM spinner showing the current song tempo
 *   - studio temperature gauge (decorative, labelled as such)
 *   - weekly listener volume mini chart
 *
 * Dual box-shadows (raised vs pressed) come from --neu-raised / --neu-pressed.
 * Contrast: #241b33 on #efe9f5 is 13:1; the muted label tone #4a3f5c is 8.3:1
 * — both above AA. Pressed states are visually distinct from raised states.
 */

const WEEKLY_VOLUME = [42, 55, 61, 48, 74, 88, 69];

export function NeumorphicStudio({ className = '' }: { className?: string }) {
  const [onAir, setOnAir] = useState(true);
  const [bpm, setBpm] = useState(112);
  const [temperature, setTemperature] = useState(22.4);

  // BPM follows the music; temperature is decorative and drifts slowly.
  useEffect(() => {
    const bpmTimer = setInterval(() => {
      setBpm((value) => {
        const next = value + Math.round((Math.random() - 0.45) * 4);
        return Math.min(128, Math.max(96, next));
      });
    }, 4200);

    const tempTimer = setInterval(() => {
      setTemperature((value) => {
        const next = value + (Math.random() - 0.5) * 0.4;
        return Math.min(26.5, Math.max(19.5, next));
      });
    }, 9000);

    return () => {
      clearInterval(bpmTimer);
      clearInterval(tempTimer);
    };
  }, []);

  const peak = Math.max(...WEEKLY_VOLUME);

  return (
    <div className={`sr-neu rounded-[18px] p-5 ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="sr-neu__label">Studio desk</p>
          <h3 className="font-heading text-[22px] font-bold text-[#241b33]">Live studio controls</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="sr-neu__led" data-live={onAir} aria-hidden="true" />
          <button
            type="button"
            role="switch"
            aria-checked={onAir}
            className="sr-neu__toggle"
            onClick={() => setOnAir((value) => !value)}
            aria-label="On-air status indicator"
          >
            <span />
          </button>
        </div>
      </div>

      <div className="sr-neu__cluster">
        {/* On air */}
        <div className="sr-neu__cell" data-pressed={onAir}>
          <p className="sr-neu__label flex items-center gap-2">
            <Activity size={13} aria-hidden="true" /> On air
          </p>
          <p className="sr-neu__value">{onAir ? 'LIVE' : 'OFF AIR'}</p>
          <p className="sr-meta mb-0">
            {onAir ? '91.7 FM transmitting from Nairobi CBD' : 'Returning to the transmitter shortly'}
          </p>
        </div>

        {/* BPM */}
        <div className="sr-neu__cell">
          <p className="sr-neu__label flex items-center gap-2">
            <Timer size={13} aria-hidden="true" /> Current tempo
          </p>
          <div className="flex items-end gap-3">
            <p className="sr-neu__value mb-0" aria-live="off">
              {bpm}
            </p>
            <span className="sr-meta mb-1">BPM</span>
          </div>
          <div className="flex items-center gap-2 mt-2" aria-hidden="true">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5c00ce]" style={{ animation: 'sr-blink 1.4s steps(2,end) infinite' }} />
            <span className="sr-meta mb-0">Beat grid locked</span>
          </div>
        </div>

        {/* Temperature (decorative) */}
        <div className="sr-neu__cell">
          <p className="sr-neu__label flex items-center gap-2">
            <Thermometer size={13} aria-hidden="true" /> Studio temperature
          </p>
          <p className="sr-neu__value">{temperature.toFixed(1)}°C</p>
          <div className="sr-neu__gauge" aria-hidden="true">
            <span style={{ width: `${((temperature - 18) / 10) * 100}%` }} />
          </div>
          <p className="sr-meta mb-0 mt-2">Decorative — for the presenters who feel it.</p>
        </div>

        {/* Weekly listener volume */}
        <div className="sr-neu__cell">
          <p className="sr-neu__label flex items-center gap-2">
            <Volume2 size={13} aria-hidden="true" /> Weekly listener volume
          </p>
          <div className="sr-neu__chart" role="img" aria-label={`Weekly listener volume: ${WEEKLY_VOLUME.join(', ')} thousands of listeners, peaking on Saturday.`}>
            {WEEKLY_VOLUME.map((value, index) => (
              <i key={index} style={{ height: `${(value / peak) * 100}%` }} />
            ))}
          </div>
          <p className="sr-meta mb-0 mt-2">Peak: Saturday · {peak}k listeners</p>
        </div>
      </div>
    </div>
  );
}
