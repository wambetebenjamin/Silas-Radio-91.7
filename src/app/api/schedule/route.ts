import { NextResponse } from 'next/server';
import { getNumber, KEYS, listRecords, storageConfigured } from '@/lib/db';
import { SCHEDULE, SITE, TIMEZONE, isSlotLive } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/schedule — show schedule with live flags.
 *
 * Schedule is SSR for real-time show data; this endpoint serves the same
 * computed shape to client components (the schedule client refreshes it on
 * a timer so the "Live" badge follows the Nairobi clock without a reload).
 */
export async function GET(request: Request) {
  const now = new Date();
  const url = new URL(request.url);
  const day = url.searchParams.get('day');

  const schedule = SCHEDULE.map((slot) => ({
    ...slot,
    isLive: isSlotLive(slot, now),
    startLabel: slot.start,
    endLabel: slot.end,
  }));

  const filtered = day ? schedule.filter((slot) => slot.days.includes(day as never)) : schedule;

  return NextResponse.json(
    {
      ok: true,
      source: storageConfigured ? 'kv' : 'static',
      timezone: TIMEZONE,
      generatedAt: now.toISOString(),
      station: { name: SITE.name, frequency: SITE.frequency },
      count: filtered.length,
      schedule: filtered,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    },
  );
}

/**
 * PUT /api/schedule — studio override of a slot (live badge, recording link).
 * Guarded by STUDIO_API_TOKEN; falls back to an honest 501 when KV is absent.
 */
export async function PUT(request: Request) {
  const expected = process.env.STUDIO_API_TOKEN;
  if (!expected || request.headers.get('x-studio-token') !== expected) {
    return NextResponse.json({ ok: false, error: 'Not authorised' }, { status: 401 });
  }

  if (!storageConfigured) {
    return NextResponse.json(
      { ok: false, error: 'KV is not configured — schedule overrides are unavailable.' },
      { status: 501 },
    );
  }

  let body: { slotId?: string; isLive?: boolean; recordingUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { saveRecord } = await import('@/lib/db');
  const stored = await saveRecord('silas:schedule-overrides', {
    slotId: body.slotId ?? '',
    isLive: Boolean(body.isLive),
    recordingUrl: body.recordingUrl ?? '',
  });

  return NextResponse.json({ ok: true, override: stored.data });
}

/** GET /api/schedule/overrides behaviour is folded in via ?overrides=1 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('overrides') !== '1') {
    return NextResponse.json({ ok: false, error: 'Unsupported action' }, { status: 400 });
  }
  const overrides = await listRecords('silas:schedule-overrides', 50);
  const listeners = await getNumber(KEYS.listeners, SITE.listenersSeed);
  return NextResponse.json({
    ok: true,
    source: overrides.source,
    listeners,
    overrides: overrides.data ?? [],
  });
}
