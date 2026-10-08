import { NextResponse } from 'next/server';
import { KEYS, listRecords, saveRecord, storageConfigured } from '@/lib/db';
import { sendStudioMail } from '@/lib/mailer';
import { RECAPTCHA_ACTIONS, verifyRecaptcha } from '@/lib/recaptcha';
import { clientKey, fieldErrors, newsletterSchema, rateLimit } from '@/lib/validation';

/**
 * POST /api/newsletter — "Weekly playlist and community news to your inbox."
 * Email + genre preference → KV. Double opt-in is handled by the mailer in
 * production; here the subscriber is stored immediately with `status: pending`
 * so a studio operator can confirm.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'newsletter'), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-ups from this connection. Try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyRecaptcha(
    data.token ?? data.v2Token,
    RECAPTCHA_ACTIONS.newsletter,
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
      },
      { status: 403 },
    );
  }

  // Avoid duplicate subscribers (best-effort, KV-backed when configured).
  const existing = await listRecords<{ email: string }>(KEYS.newsletter, 500);
  const duplicate = (existing.data ?? []).some(
    (item) => item.email?.toLowerCase() === data.email.toLowerCase(),
  );

  if (duplicate) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      message: 'You are already on the list — the next playlist drops on Friday.',
    });
  }

  const stored = await saveRecord(KEYS.newsletter, {
    kind: 'newsletter-subscriber',
    email: data.email,
    genre: data.genre,
    status: 'pending',
    captchaScore: captcha.score,
  });

  await sendStudioMail({
    subject: `Newsletter signup: ${data.email}`,
    text: `New newsletter subscriber\nEmail: ${data.email}\nGenre preference: ${data.genre}`,
  });

  return NextResponse.json({
    ok: true,
    id: stored.data?.id,
    persisted: stored.source === 'kv',
    storage: storageConfigured ? 'kv' : 'local-buffer',
    message: 'You are subscribed. Weekly playlist and community news, every Friday.',
  });
}

/** GET /api/newsletter — subscriber count for the footer badge. */
export async function GET() {
  const result = await listRecords(KEYS.newsletter, 1000);
  return NextResponse.json({
    ok: true,
    source: result.source,
    subscribers: result.data?.length ?? 0,
  });
}
