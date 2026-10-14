'use client';

import { Pause, Play } from 'lucide-react';
import { DEFAULT_TRACK, usePlayerStore, type Track } from '@/store/player';
import { SITE } from '@/lib/site';
import { getShow, type Episode } from '@/lib/programming';

export function episodeTrack(episode: Episode): Track {
  const show = getShow(episode.showId)!;
  return {
    id: episode.slug, title: episode.title, artist: show.presenter, presenter: show.presenter,
    show: show.name, streamUrl: episode.audio, isLive: false, isDemo: true, durationSeconds: 0,
    shareUrl: `${SITE.url}/podcasts/${episode.slug}`,
  };
}

export function LivePlayButton({ className = 'button button--lime', children }: { className?: string; children?: React.ReactNode }) {
  const current = usePlayerStore((state) => state.track.id);
  const playing = usePlayerStore((state) => state.isPlaying);
  const active = current === DEFAULT_TRACK.id && playing;
  return (
    <button type="button" className={className} aria-pressed={active} onClick={() => {
      const player = usePlayerStore.getState();
      if (active) player.pause();
      else { if (current !== DEFAULT_TRACK.id) player.setTrack(DEFAULT_TRACK); player.play(); }
    }}>
      {active ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}
      {active ? 'Pause radio' : children ?? 'Listen live'}
    </button>
  );
}

export function EpisodePlayButton({ episode, iconOnly = false }: { episode: Episode; iconOnly?: boolean }) {
  const current = usePlayerStore((state) => state.track.id);
  const playing = usePlayerStore((state) => state.isPlaying);
  const active = current === episode.slug && playing;
  return (
    <button type="button" className={iconOnly ? 'episode-play' : 'button button--primary'} aria-label={`${active ? 'Pause' : 'Play'} preview: ${episode.title}`} aria-pressed={active} onClick={() => {
      const player = usePlayerStore.getState();
      if (active) player.pause();
      else { if (current !== episode.slug) player.setTrack(episodeTrack(episode)); player.play(); }
    }}>
      {active ? <Pause size={20} fill="currentColor" aria-hidden="true" /> : <Play size={20} fill="currentColor" aria-hidden="true" />}
      {!iconOnly && (active ? 'Pause preview' : 'Play audio preview')}
    </button>
  );
}
