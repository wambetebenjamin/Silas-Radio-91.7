'use client';

import { create } from 'zustand';
import { SITE } from '@/lib/site';

export interface Track {
  id: string;
  title: string;
  artist: string;
  presenter: string;
  show: string;
  durationSeconds: number;
  streamUrl: string;
  isLive: boolean;
  isDemo?: boolean;
  shareUrl: string;
}

export const DEFAULT_TRACK: Track = {
  id: 'live-stream', title: 'Silas Radio 91.7', artist: 'Nairobi, Kenya',
  presenter: 'Silas Radio', show: 'Your city. Your sound.', durationSeconds: 0,
  streamUrl: SITE.streamUrl, isLive: true, isDemo: !SITE.streamConfigured, shareUrl: `${SITE.url}/listen`,
};
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
export const audioRef: { current: HTMLAudioElement | null } = { current: null };

interface PlayerState {
  isPlaying: boolean; isLoading: boolean; track: Track; position: number; duration: number;
  volume: number; muted: boolean; rate: number; error: string | null;
  play: () => void; pause: () => void; toggle: () => void;
  setTrack: (track: Partial<Track>) => void; setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void; seek: (seconds: number) => void; skip: (delta: number) => void;
  setVolume: (value: number) => void; toggleMute: () => void; setRate: (rate: number) => void;
  setLoading: (value: boolean) => void; setError: (message: string | null) => void;
}

// The store and one root-level audio element survive client-side page navigation.
// Preferences are saved by Player only after optional functional-storage consent.
export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false, isLoading: false, track: DEFAULT_TRACK, position: 0, duration: 0,
  volume: 0.8, muted: false, rate: 1, error: null,
  play: () => set({ isPlaying: true, error: null }),
  pause: () => set({ isPlaying: false, isLoading: false }),
  toggle: () => get().isPlaying ? get().pause() : get().play(),
  setTrack: (partial) => set((state) => {
    const track = { ...state.track, ...partial };
    const changed = track.id !== state.track.id || track.streamUrl !== state.track.streamUrl;
    return { track, ...(changed ? { position: 0, duration: track.durationSeconds, error: null } : {}) };
  }),
  setPosition: (seconds) => set({ position: Number.isFinite(seconds) ? Math.max(0, seconds) : 0 }),
  setDuration: (seconds) => set({ duration: Number.isFinite(seconds) ? Math.max(0, seconds) : 0 }),
  seek: (seconds) => {
    if (get().track.isLive || !Number.isFinite(seconds)) return;
    const position = Math.min(Math.max(0, seconds), get().duration);
    if (audioRef.current?.readyState) audioRef.current.currentTime = position;
    set({ position });
  },
  skip: (delta) => get().seek(get().position + delta),
  setVolume: (value) => set({ volume: Math.min(1, Math.max(0, value)), muted: value === 0 }),
  toggleMute: () => set((state) => ({ muted: !state.muted, volume: state.volume || 0.8 })),
  setRate: (rate) => set({ rate }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
