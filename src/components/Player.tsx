'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, AudioLines, LoaderCircle, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { audioRef, DEFAULT_TRACK, formatClock, PLAYBACK_RATES, usePlayerStore } from '@/store/player';
import { readConsent } from './CookieConsent';

export function Player() {
  const player = usePlayerStore();
  const { isPlaying, track, volume, muted, rate, setError, setLoading, setDuration, setPosition } = player;
  const element = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    audioRef.current = element.current;
    return () => { audioRef.current = null; };
  }, []);

  useEffect(() => {
    const audio = element.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
    audio.playbackRate = track.isLive ? 1 : rate;
  }, [volume, muted, rate, track.isLive]);

  useEffect(() => {
    const audio = element.current;
    if (!audio) return;
    let cancelled = false;
    if (isPlaying) {
      setLoading(true);
      if (audio.error) audio.load();
      audio.play().then(() => { if (!cancelled) { setLoading(false); setError(null); } }).catch((error: DOMException) => {
        if (cancelled || error.name === 'AbortError') return;
        usePlayerStore.getState().pause();
        setError(error.name === 'NotAllowedError' ? 'Press play to start listening.' : 'Audio is unavailable. Press play to retry.');
      });
    } else { audio.pause(); setLoading(false); }
    return () => { cancelled = true; };
  }, [isPlaying, track.id, track.streamUrl, setError, setLoading]);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      if (usePlayerStore.getState().track.id !== DEFAULT_TRACK.id) return;
      try {
        const response = await fetch('/api/now-playing', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        // A response already in flight must never replace an episode selected meanwhile.
        if (controller.signal.aborted || usePlayerStore.getState().track.id !== DEFAULT_TRACK.id) return;
        usePlayerStore.getState().setTrack({
          title: data.source === 'live' ? data.song : 'Silas Radio 91.7',
          artist: data.source === 'live' ? data.artist : 'Nairobi, Kenya',
          show: data.show, presenter: data.presenter,
        });
      } catch { /* Leave the working audio source and last known metadata untouched. */ }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [track.id]);

  useEffect(() => {
    const restore = () => {
      try {
        if (!readConsent()?.functional) { localStorage.removeItem('silas-radio-player'); return; }
        const saved = JSON.parse(localStorage.getItem('silas-radio-player') || '{}');
        const settings = saved.state ?? saved; // Also accepts preferences from the previous site.
        if (typeof settings.volume === 'number' && Number.isFinite(settings.volume)) usePlayerStore.getState().setVolume(settings.volume);
        if (PLAYBACK_RATES.includes(settings.rate)) usePlayerStore.getState().setRate(settings.rate);
        if (typeof settings.muted === 'boolean') usePlayerStore.setState({ muted: settings.muted });
      } catch { /* Storage may be blocked by the browser. */ }
    };
    restore();
    const unsubscribe = usePlayerStore.subscribe((state, previous) => {
      if (!readConsent()?.functional || (state.volume === previous.volume && state.rate === previous.rate && state.muted === previous.muted)) return;
      try { localStorage.setItem('silas-radio-player', JSON.stringify({ volume: state.volume, muted: state.muted, rate: state.rate })); } catch { /* Optional. */ }
    });
    window.addEventListener('silas:consent', restore);
    return () => { unsubscribe(); window.removeEventListener('silas:consent', restore); };
  }, []);

  return (
    <section className="radio-player" id="player" aria-label="Audio player">
      <audio ref={element} data-testid="radio-audio" src={track.streamUrl} preload="none" loop={track.isLive && Boolean(track.isDemo)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)} onEnded={() => player.pause()}
        onError={() => { player.pause(); setError('Audio is unavailable. Press play to retry.'); }} />
      <div className="container radio-player__inner">
        <button type="button" className="player-play" onClick={player.toggle} aria-label={isPlaying ? 'Pause audio' : 'Play audio'} aria-pressed={isPlaying}>
          {player.isLoading ? <LoaderCircle className="spin" size={22} aria-hidden="true" /> : isPlaying ? <Pause size={21} fill="currentColor" aria-hidden="true" /> : <Play size={21} fill="currentColor" aria-hidden="true" />}
        </button>
        <div className="player-info"><span className="player-info__label"><span className="status-dot" />{track.isLive ? (track.isDemo ? 'DEMO STREAM' : 'LIVE FROM NAIROBI') : 'ON DEMAND · AUDIO PREVIEW'}</span><p>{track.isLive ? track.show : track.title}</p><span className="player-info__byline">{track.isLive ? 'Silas Radio 91.7' : track.presenter}</span></div>
        {track.isLive ? <div className="player-frequency"><AudioLines size={27} aria-hidden="true" /><span>ON 91.7 FM · NAIROBI</span><strong>91.7 <small>FM</small></strong></div> :
          <div className="player-progress"><button type="button" onClick={() => player.skip(-15)} aria-label="Rewind 15 seconds"><RotateCcw size={17} aria-hidden="true" /></button><div><input aria-label="Seek within preview" type="range" min="0" max={player.duration || 1} step="1" value={Math.min(player.position, player.duration || 1)} onChange={(event) => player.seek(Number(event.target.value))} disabled={!player.duration} /><span>{formatClock(player.position)} / {formatClock(player.duration)}</span></div><button type="button" onClick={() => player.skip(15)} aria-label="Forward 15 seconds"><RotateCw size={17} aria-hidden="true" /></button></div>}
        <div className="player-volume"><button type="button" onClick={player.toggleMute} aria-label={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted}>{muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={(event) => player.setVolume(Number(event.target.value))} /></div>
        {!track.isLive && <select className="player-speed" aria-label="Playback speed" value={rate} onChange={(event) => player.setRate(Number(event.target.value))}>{PLAYBACK_RATES.map((speed) => <option key={speed} value={speed}>{speed}×</option>)}</select>}
        <Link className="player-request" href="/request">Request a song <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link className="player-expand" href="/listen" aria-label="Go to the listening room"><ArrowUpRight size={19} aria-hidden="true" /></Link>
      </div>
      <p className="player-error" role="status">{player.error}</p>
    </section>
  );
}
