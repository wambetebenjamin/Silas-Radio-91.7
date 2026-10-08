'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Music,
  Pause,
  Play,
  Rewind,
  FastForward,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { SITE } from '@/lib/site';
import {
  PLAYBACK_RATES,
  audioRef,
  formatClock,
  usePlayerStore,
  waveSeekRef,
} from '@/store/player';
import { useBreakpoints, useReducedMotion } from '@/hooks/useMotionAndLayout';
import { useListeners, formatListeners } from '@/hooks/useListeners';

/**
 * 3. Persistent audio player — pinned to the bottom of every page.
 *
 * Contents: station logo, now playing song + presenter, progress bar with
 * scrub control, current time and total duration, play/pause, rewind 15s,
 * skip 15s, volume slider with mute toggle, playback speed, share episode and
 * a song request shortcut that links to WhatsApp.
 *
 * - Playback uses an HTML5 <audio> element that survives navigation because
 *   the root layout never remounts.
 * - wavesurfer.js renders and drives the waveform for recorded episodes.
 *   Below 480px the waveform is hidden (CSS) and the scrub control remains.
 * - The player is fixed but body padding reserves its height, so it never
 *   covers page CTAs at any breakpoint.
 */

export function Player() {
  const {
    isPlaying,
    isLoading,
    track,
    position,
    duration,
    volume,
    muted,
    rate,
    error,
    toggle,
    setPosition,
    setDuration,
    seek,
    skip,
    setVolume,
    toggleMute,
    setRate,
    setTrack,
    setLoading,
    setError,
  } = usePlayerStore();

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const waveInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const [shareNote, setShareNote] = useState('');
  const { isNarrow } = useBreakpoints();
  const reduced = useReducedMotion();
  const listeners = useListeners();

  /* ------------------------------------------------------------------ */
  /*  Track metadata from /api/now-playing                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      try {
        const response = await fetch('/api/now-playing', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as {
          song?: string;
          artist?: string;
          presenter?: string;
          show?: string;
          durationSeconds?: number;
          streamUrl?: string;
          isLive?: boolean;
        };
        if (cancelled) return;
        setTrack({
          title: data.song ?? track.title,
          artist: data.artist ?? track.artist,
          presenter: data.presenter ?? track.presenter,
          show: data.show ?? track.show,
          durationSeconds: data.durationSeconds ?? track.durationSeconds,
          streamUrl: data.streamUrl ?? track.streamUrl,
          isLive: true,
          shareUrl: `${SITE.url}/#player`,
        });
        setDuration(data.durationSeconds ?? duration);
      } catch {
        /* keep persisted metadata */
      }
    };

    void loadMetadata();
    const timer = setInterval(loadMetadata, 120_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------ */
  /*  HTML5 audio wiring                                                 */
  /* ------------------------------------------------------------------ */
  const audioEl = (
    <audio
      ref={(element) => {
        audioElRef.current = element;
        audioRef.current = element;
      }}
      src={track.streamUrl}
      preload="metadata"
      crossOrigin="anonymous"
      onLoadedMetadata={(event) => {
        const media = event.currentTarget;
        if (Number.isFinite(media.duration) && media.duration > 0) {
          setDuration(media.duration);
        }
      }}
      onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
      onWaiting={() => setLoading(true)}
      onPlaying={() => setLoading(false)}
      onError={() => {
        setLoading(false);
        setError('The stream is reconnecting. Try again in a moment.');
      }}
      className="sr-only"
    />
  );

  useEffect(() => {
    const element = audioElRef.current;
    if (!element) return;
    element.volume = volume;
    element.muted = muted;
    element.playbackRate = rate;
  }, [volume, muted, rate]);

  useEffect(() => {
    const element = audioElRef.current;
    if (!element) return;

    if (isPlaying) {
      element
        .play()
        .then(() => setError(null))
        .catch(() => {
          // Autoplay policy or stream hiccup: reflect reality, offer the button.
          usePlayerStore.setState({ isPlaying: false });
        });
    } else {
      element.pause();
    }
  }, [isPlaying, setError, track.streamUrl]);

  /* ------------------------------------------------------------------ */
  /*  wavesurfer waveform (recorded episodes only; hidden < 480px)        */
  /* ------------------------------------------------------------------ */
  const isLive = track.isLive;

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      if (isLive || !waveRef.current || typeof window === 'undefined') return;

      const WaveSurfer = (await import('wavesurfer.js')).default;
      if (cancelled || !waveRef.current) return;

      waveInstanceRef.current?.destroy();

      const instance = WaveSurfer.create({
        container: waveRef.current,
        height: 40,
        waveColor: 'rgba(255,255,255,0.35)',
        progressColor: '#5c00ce',
        cursorColor: '#ffffff',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        url: track.streamUrl,
      });

      instance.on('ready', () => {
        setDuration(instance.getDuration());
        setLoading(false);
        if (reduced) instance.setOptions({ interact: false });
      });
      instance.on('timeupdate', (seconds: number) => setPosition(seconds));
      instance.on('play', () => usePlayerStore.setState({ isPlaying: true }));
      instance.on('pause', () => usePlayerStore.setState({ isPlaying: false }));

      // Route store-level seeking (scrub bar, ±15s buttons) into wavesurfer.
      waveSeekRef.current = (seconds: number) => {
        const total = instance.getDuration() || seconds;
        instance.setTime(Math.min(Math.max(0, seconds), total));
      };

      waveInstanceRef.current = instance;
    };

    const cleanup = setup();
    return () => {
      cancelled = true;
      void cleanup;
      waveSeekRef.current = null;
      waveInstanceRef.current?.destroy();
      waveInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.streamUrl, isLive, reduced]);

  /* ------------------------------------------------------------------ */
  /*  Share                                                              */
  /* ------------------------------------------------------------------ */
  const share = useCallback(async () => {
    const shareData = {
      title: `${track.title} — ${track.artist}`,
      text: `Listening to ${track.title} by ${track.artist} on Silas Radio 91.7 with ${track.presenter}.`,
      url: track.shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareNote('Shared');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setShareNote('Link copied');
      }
    } catch {
      setShareNote('Copy failed');
    }
    window.setTimeout(() => setShareNote(''), 2400);
  }, [track]);

  return (
    <section
      id="player"
      className="sr-player"
      aria-label="Silas Radio 91.7 audio player"
      data-live={isLive}
    >
      {audioEl}

      <div className="sr-container sr-player__inner">
        {/* Station logo + now playing metadata */}
        <div className="sr-player__now">
          <span className="sr-player__logo" aria-hidden="true">
            91.7
          </span>
          <div className="sr-player__titles">
            <p className="sr-player__song">
              <span className="sr-only">Now playing: </span>
              {track.title} — {track.artist}
            </p>
            <p className="sr-player__presenter">
              <span className="sr-only">Presenter: </span>
              {track.presenter} · {track.show}
              {isLive ? ' · On air now' : ''}
            </p>
            <p className="sr-player__compact-meta" aria-live="polite">
              {listeners.status === 'live'
                ? `${formatListeners(listeners.count)} listening now`
                : listeners.status === 'connecting'
                  ? 'Connecting to the listener board…'
                  : `${formatListeners(listeners.count)} listening now · reconnecting`}
            </p>
          </div>
        </div>

        {/* Transport + waveform + scrub */}
        <div className="sr-player__transport-wrap">
          <div className="sr-player__transport" role="group" aria-label="Playback controls">
            <button
              type="button"
              className="sr-player__btn"
              onClick={() => skip(-15)}
              aria-label="Rewind 15 seconds"
            >
              <Rewind size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="sr-player__btn sr-player__btn--play"
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              aria-pressed={isPlaying}
              data-loading={isLoading}
            >
              {isPlaying ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
            </button>

            <button
              type="button"
              className="sr-player__btn"
              onClick={() => skip(15)}
              aria-label="Skip forward 15 seconds"
            >
              <FastForward size={18} aria-hidden="true" />
            </button>
          </div>

          {/* wavesurfer.js waveform — hidden below 480px per spec */}
          {!isLive ? (
            <div
              ref={waveRef}
              className="sr-player__wave"
              role="img"
              aria-label={`Waveform for ${track.title}`}
            />
          ) : (
            <div className="sr-player__wave" aria-hidden="true">
              <LiveActivity reduced={reduced} />
            </div>
          )}

          <div>
            <label className="sr-only" htmlFor="sr-player-scrub">
              Seek within the current episode
            </label>
            <input
              id="sr-player-scrub"
              className="sr-player__progress"
              type="range"
              min={0}
              max={Math.max(1, Math.round(duration))}
              step={1}
              value={Math.round(position)}
              onChange={(event) => seek(Number(event.target.value))}
              disabled={isLive}
              aria-valuetext={`${formatClock(position)} of ${formatClock(duration)}`}
            />
            <div className="sr-player__times">
              <span aria-hidden="true">{formatClock(position)}</span>
              <span className="sr-only">
                {formatClock(position)} of {formatClock(duration)}
              </span>
              <span aria-hidden="true">{isLive ? 'LIVE' : formatClock(duration)}</span>
            </div>
          </div>

          {error ? (
            <p className="sr-player__compact-meta" role="status">
              {error}
            </p>
          ) : null}
        </div>

        {/* Extras: volume, speed, share, song request */}
        <div className="sr-player__extras">
          <button
            type="button"
            className="sr-player__btn"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
          >
            {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
          </button>
          <label className="sr-only" htmlFor="sr-player-volume">
            Volume
          </label>
          <input
            id="sr-player-volume"
            className="sr-player__volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-valuetext={`Volume ${Math.round((muted ? 0 : volume) * 100)} percent`}
          />

          <label className="sr-only" htmlFor="sr-player-rate">
            Playback speed
          </label>
          <select
            id="sr-player-rate"
            className="sr-player__select"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          >
            {PLAYBACK_RATES.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>

          <button
            type="button"
            className="sr-player__btn"
            onClick={share}
            aria-label="Share episode"
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
          <span className="sr-role-status sr-player__compact-meta" role="status" aria-live="polite">
            {shareNote}
          </span>

          <a
            className="sr-btn sr-btn--primary"
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Music size={16} aria-hidden="true" />
            Request a song
          </a>
        </div>
      </div>

      {/* Mobile-only shortcut row: keeps song request reachable on small screens */}
      <div className="sr-container flex items-center justify-between gap-3 pb-2 lg:hidden">
        <span className="sr-meta sr-player__compact-meta">
          {isNarrow ? `${formatClock(position)} · ${isLive ? 'LIVE' : formatClock(duration)}` : null}
        </span>
        <a
          className="sr-btn sr-btn--primary"
          href={SITE.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Music size={15} aria-hidden="true" />
          Song request
        </a>
        <Link className="sr-btn sr-btn--ghost-light" href="/advertise">
          Advertise
        </Link>
      </div>
    </section>
  );
}

/** Live "activity" waveform — decorative, frozen under reduced motion. */
function LiveActivity({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return (
      <svg viewBox="0 0 300 40" width="100%" height="40" aria-hidden="true">
        <path
          d="M0 20 L20 20 L26 12 L32 28 L38 18 L46 22 L54 20 L70 20 L78 10 L86 30 L94 20 L120 20 L128 14 L136 26 L144 20 L170 20 L178 9 L186 31 L194 20 L220 20 L228 13 L236 27 L244 20 L268 20 L276 15 L284 25 L292 20 L300 20"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <div className="flex items-end gap-[3px] h-10" aria-hidden="true">
      {Array.from({ length: 48 }).map((_, index) => (
        <span
          key={index}
          style={{
            display: 'block',
            width: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.42)',
            height: `${18 + ((index * 37) % 22)}px`,
            animation: `sr-eq 900ms cubic-bezier(0.22,0.61,0.36,1) ${index * 42}ms infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
