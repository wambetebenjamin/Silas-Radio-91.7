'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SITE } from '@/lib/site';

/**
 * Persistent player state (Zustand).
 *
 * The root layout never remounts on navigation, so the <audio> element keeps
 * playing across page changes; this store holds the UI-facing state and is
 * persisted to localStorage for volume, speed and the last track.
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  presenter: string;
  show: string;
  durationSeconds: number;
  streamUrl: string;
  isLive: boolean;
  shareUrl: string;
}

export const DEFAULT_TRACK: Track = {
  id: 'live-stream',
  title: 'Nairobi Nights',
  artist: 'Sauti Sol',
  presenter: 'Mary Wanjiru',
  show: 'Amaka Early Drive',
  durationSeconds: 288,
  streamUrl: SITE.streamUrl,
  isLive: true,
  shareUrl: `${SITE.url}/#player`,
};

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  track: Track;
  /** Seconds */
  position: number;
  /** Seconds — 0 while a live stream duration is unknown */
  duration: number;
  volume: number;
  muted: boolean;
  rate: number;
  error: string | null;

  play: () => void;
  pause: () => void;
  toggle: () => void;
  setTrack: (track: Partial<Track>) => void;
  setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  seek: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  setRate: (rate: number) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
}

/** Imperative audio element handle, shared by the player component. */
export const audioRef: { current: HTMLAudioElement | null } = { current: null };

/**
 * When a recorded episode is rendered through wavesurfer, that instance owns
 * playback. It registers its `setTime` here so store-level seeking (scrub bar,
 * rewind/skip buttons) still works.
 */
export const waveSeekRef: { current: ((seconds: number) => void) | null } = { current: null };

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      isLoading: false,
      track: DEFAULT_TRACK,
      position: 0,
      duration: DEFAULT_TRACK.durationSeconds,
      volume: 0.8, // jPlayer init default in the design source (volume: 0.8)
      muted: false,
      rate: 1,
      error: null,

      play: () => {
        set({ isPlaying: true, error: null });
      },
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setTrack: (partial) => set((state) => ({ track: { ...state.track, ...partial } })),
      setPosition: (seconds) => set({ position: Math.max(0, seconds) }),
      setDuration: (seconds) => set({ duration: seconds > 0 ? seconds : get().duration }),
      seek: (seconds) => {
        const { duration } = get();
        const clamped = Math.min(Math.max(0, seconds), duration || seconds);
        set({ position: clamped });
        if (waveSeekRef.current) {
          waveSeekRef.current(clamped);
          return;
        }
        if (audioRef.current && Number.isFinite(clamped)) {
          audioRef.current.currentTime = clamped;
        }
      },
      skip: (delta) => {
        const { position, duration } = get();
        const next = Math.min(Math.max(0, position + delta), duration || position + delta);
        set({ position: next });
        if (waveSeekRef.current) {
          waveSeekRef.current(next);
          return;
        }
        if (audioRef.current && Number.isFinite(next)) {
          audioRef.current.currentTime = next;
        }
      },
      setVolume: (value) => {
        const volume = Math.min(Math.max(0, value), 1);
        set({ volume, muted: volume === 0 });
        if (audioRef.current) audioRef.current.volume = volume;
      },
      toggleMute: () => {
        const muted = !get().muted;
        set({ muted });
        if (audioRef.current) audioRef.current.muted = muted;
      },
      setRate: (rate) => {
        set({ rate });
        if (audioRef.current) audioRef.current.playbackRate = rate;
      },
      setLoading: (value) => set({ isLoading: value }),
      setError: (message) => set({ error: message }),
    }),
    {
      name: 'silas-radio-player',
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        rate: state.rate,
        track: state.track,
      }),
    },
  ),
);

/** mm:ss formatter used by the player, schedule and contest countdown. */
export function formatClock(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
