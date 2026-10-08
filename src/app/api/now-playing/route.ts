import { NextResponse } from 'next/server';
import { SCHEDULE, SITE, isSlotLive } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface NowPlaying {
  song: string;
  artist: string;
  presenter: string;
  show: string;
  album?: string;
  artwork?: string | null;
  durationSeconds: number;
  elapsedSeconds: number;
  startedAt: string;
  streamUrl: string;
  source: 'live' | 'demo';
  nextUp: { show: string; presenter: string; start: string } | null;
}

/** Small deterministic rotation so the demo feed advances realistically. */
const DEMO_ROTATION = [
  { song: 'Nairobi Nights', artist: 'Sauti Sol', duration: 288, album: 'Midnight Train' },
  { song: 'Kaskie Vibaya', artist: 'Fathermoh ft. Ssaru', duration: 214, album: 'Kaskie' },
  { song: 'Malaika', artist: 'Fadhili Williams', duration: 246, album: 'Classics of Kenya' },
  { song: 'Anguka Nayo', artist: 'Wadagliz', duration: 199, album: 'Anguka Nayo' },
  { song: 'Tunaweza', artist: 'Nyashinski', duration: 232, album: 'Malaika' },
  { song: 'Kwangwaru', artist: 'Bahati', duration: 208, album: 'Kwangwaru' },
  { song: 'Nerea', artist: 'H_art the Band', duration: 265, album: 'Made in the Streets' },
  { song: 'Wendo Wi Cama', artist: 'Joyce W Rice', duration: 301, album: 'Golden Benga' },
];

/**
 * GET /api/now-playing — current song metadata for the persistent player.
 *
 * If NOW_PLAYING_API_URL is configured the station's playout system is
 * queried; otherwise a deterministic demo rotation keeps the player honest
 * and self-advancing (it rotates on real elapsed time, not on load).
 */
export async function GET() {
  const now = new Date();
  const liveSlot = SCHEDULE.find((slot) => isSlotLive(slot, now)) ?? SCHEDULE[0];

  let source: NowPlaying['source'] = 'demo';
  let current = DEMO_ROTATION[Math.floor(Date.now() / 1000 / DEMO_ROTATION[0].duration) % DEMO_ROTATION.length];
  let elapsedSeconds = Math.floor(Date.now() / 1000) % DEMO_ROTATION[0].duration;

  const upstream = process.env.NOW_PLAYING_API_URL;
  if (upstream) {
    try {
      const res = await fetch(upstream, { cache: 'no-store' });
      if (res.ok) {
        const payload = (await res.json()) as Partial<NowPlaying>;
        current = {
          song: payload.song ?? current.song,
          artist: payload.artist ?? current.artist,
          duration: payload.durationSeconds ?? current.duration,
          album: payload.album ?? current.album,
        };
        elapsedSeconds = payload.elapsedSeconds ?? elapsedSeconds;
        source = 'live';
      }
    } catch {
      /* keep the demo rotation on upstream failure */
    }
  }

  const totalRotation = DEMO_ROTATION.reduce((sum, item) => sum + item.duration, 0);
  const position = Math.floor(Date.now() / 1000) % totalRotation;
  let acc = 0;
  for (const item of DEMO_ROTATION) {
    if (position < acc + item.duration) {
      if (source === 'demo') {
        current = item;
        elapsedSeconds = position - acc;
      }
      break;
    }
    acc += item.duration;
  }

  const next = SCHEDULE[(SCHEDULE.indexOf(liveSlot) + 1) % SCHEDULE.length];

  const payload: NowPlaying = {
    song: current.song,
    artist: current.artist,
    album: current.album,
    presenter: liveSlot.presenter,
    show: liveSlot.name,
    artwork: null,
    durationSeconds: current.duration,
    elapsedSeconds,
    startedAt: new Date(now.getTime() - elapsedSeconds * 1000).toISOString(),
    streamUrl: SITE.streamUrl,
    source,
    nextUp: { show: next.name, presenter: next.presenter, start: next.start },
  };

  return NextResponse.json(
    { ok: true, ...payload },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
