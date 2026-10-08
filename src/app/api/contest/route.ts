import { NextResponse } from 'next/server';
import { KEYS, saveRecord, storageConfigured } from '@/lib/db';
import { sendStudioMail, studioWhatsappLink } from '@/lib/mailer';
import { RECAPTCHA_ACTIONS, verifyRecaptcha } from '@/lib/recaptcha';
import { clientKey, contestEntrySchema, fieldErrors, rateLimit } from '@/lib/validation';

/**
 * POST /api/contest — contest / giveaway entry.
 * reCAPTCHA v3 (v2 fallback < 0.5) → validate → save to KV → confirm.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'contest'), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many entries from this connection. Try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = contestEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyRecaptcha(
    data.token ?? data.v2Token,
    RECAPTCHA_ACTIONS.contest,
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

  const stored = await saveRecord(KEYS.contests, {
    kind: 'contest-entry',
    contestSlug: data.contestSlug,
    name: data.name,
    phone: data.phone,
    email: data.email,
    answer: data.answer,
    captchaScore: captcha.score,
    captchaBypassed: captcha.bypassed ?? false,
  });

  const summary = `Contest entry — ${data.contestSlug}\n${data.name} · ${data.phone} · ${data.email}\nAnswer: ${data.answer}`;
  const mail = await sendStudioMail({
    subject: `Contest entry: ${data.contestSlug}`,
    text: summary,
  });

  return NextResponse.json({
    ok: true,
    id: stored.data?.id,
    persisted: stored.source === 'kv',
    storage: storageConfigured ? 'kv' : 'local-buffer',
    notified: mail.ok,
    whatsappLink: studioWhatsappLink(summary),
    message: 'You are in the draw. Winners are announced on air — keep your phone close.',
  });
}
