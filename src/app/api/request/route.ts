import { NextResponse } from 'next/server';
import { KEYS, saveRecord, storageConfigured } from '@/lib/db';
import { sendStudioMail, studioWhatsappLink } from '@/lib/mailer';
import { RECAPTCHA_ACTIONS, verifyRecaptcha } from '@/lib/recaptcha';
import { clientKey, fieldErrors, rateLimit, songRequestSchema } from '@/lib/validation';

/**
 * POST /api/request — song request and dedication.
 *
 * Flow: rate limit → reCAPTCHA v3 (v2 fallback below 0.5) → validate →
 * save to Vercel KV → notify the studio (email + WhatsApp deep link).
 *
 * Failure policy: a notification failure still returns 200 with `notified:false`
 * so the listener is never told their request was lost.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'request'), 6, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = songRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyRecaptcha(
    data.token ?? data.v2Token,
    RECAPTCHA_ACTIONS.request,
    request.headers.get('x-forwarded-for') ?? undefined,
  );
  if (!captcha.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: captcha.requiresV2Fallback
          ? 'Please complete the verification challenge.'
          : 'Verification failed. Please try again.',
        requiresV2Fallback: captcha.requiresV2Fallback,
        reason: captcha.reason,
      },
      { status: 403 },
    );
  }

  const stored = await saveRecord(KEYS.requests, {
    kind: 'song-request',
    name: data.name,
    phone: data.phone,
    songTitle: data.songTitle,
    artistName: data.artistName,
    dedication: data.dedication,
    showTime: data.showTime,
    captchaScore: captcha.score,
    captchaBypassed: captcha.bypassed ?? false,
  });

  const summary = `New song request — ${data.name} (${data.phone})\nSong: ${data.songTitle} by ${data.artistName}\nShow: ${data.showTime}\nDedication: ${data.dedication || '—'}`;

  const mail = await sendStudioMail({
    subject: `Song request: ${data.songTitle} — ${data.artistName}`,
    text: summary,
    replyTo: undefined,
  });

  return NextResponse.json({
    ok: true,
    id: stored.data?.id,
    persisted: stored.source === 'kv',
    storage: storageConfigured ? 'kv' : 'local-buffer',
    notified: mail.ok,
    whatsappLink: studioWhatsappLink(summary),
    message: 'Your request is with the studio. Keep listening — we read them out live.',
  });
}

/** GET /api/request — studio-side listing (requires STUDIO_API_TOKEN). */
export async function GET(request: Request) {
  const token = request.headers.get('x-studio-token');
  const expected = process.env.STUDIO_API_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: 'Not authorised' }, { status: 401 });
  }
  const { listRecords } = await import('@/lib/db');
  const result = await listRecords(KEYS.requests, 100);
  return NextResponse.json({ ok: true, source: result.source, requests: result.data ?? [] });
}
