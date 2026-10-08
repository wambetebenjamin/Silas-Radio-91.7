import { NextResponse } from 'next/server';
import { KEYS, saveRecord, storageConfigured } from '@/lib/db';
import { sendStudioMail } from '@/lib/mailer';
import { RECAPTCHA_ACTIONS, verifyRecaptcha } from '@/lib/recaptcha';
import { clientKey, contactSchema, fieldErrors, rateLimit } from '@/lib/validation';

/**
 * POST /api/contact — general contact form.
 * reCAPTCHA v3 (v2 fallback < 0.5) → validate → KV → Nodemailer.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'contact'), 6, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages from this connection. Please try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyRecaptcha(
    data.token ?? data.v2Token,
    RECAPTCHA_ACTIONS.contact,
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

  const stored = await saveRecord(KEYS.contact, {
    kind: 'contact-message',
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    captchaScore: captcha.score,
  });

  const mail = await sendStudioMail({
    subject: `Contact: ${data.subject}`,
    text: `${data.name} <${data.email}>${data.phone ? ` · ${data.phone}` : ''}\n\n${data.message}`,
    replyTo: data.email,
  });

  return NextResponse.json({
    ok: true,
    id: stored.data?.id,
    persisted: stored.source === 'kv',
    storage: storageConfigured ? 'kv' : 'local-buffer',
    notified: mail.ok,
    message: 'Message received. The studio replies within one working day.',
  });
}
