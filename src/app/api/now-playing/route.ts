import { NextResponse } from 'next/server';
import { broadcastAt } from '@/lib/programming';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { current, next } = broadcastAt(new Date());
  let song = SITE.name;
  let artist = 'East African music & community';
  let source: 'live' | 'demo' | 'schedule' = SITE.streamConfigured ? 'schedule' : 'demo';
  if (process.env.NOW_PLAYING_API_URL) {
    try {
      const response = await fetch(process.env.NOW_PLAYING_API_URL, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const data = await response.json();
        if (typeof data.song === 'string' && typeof data.artist === 'string') { song = data.song; artist = data.artist; source = 'live'; }
      }
    } catch { /* The schedule is a truthful fallback; do not invent a playing artist. */ }
  }
  return NextResponse.json({
    ok: true, song, artist, show: current.name, presenter: current.presenter, source,
    streamUrl: SITE.streamUrl, durationSeconds: 0, isLive: true,
    nextUp: { show: next[0].name, presenter: next[0].presenter, start: next[0].start },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
