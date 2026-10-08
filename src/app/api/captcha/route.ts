import { NextResponse } from 'next/server';
import {
  RECAPTCHA_ACTIONS,
  RECAPTCHA_SCORE_THRESHOLD,
  recaptchaEnabled,
  verifyRecaptcha,
} from '@/lib/recaptcha';
import { captchaSchema, clientKey, fieldErrors, rateLimit } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * POST /api/captcha — standalone server-side reCAPTCHA verification.
 *
 * Forms call this first so a low score can trigger the v2 checkbox fallback
 * *before* any other endpoint receives the payload. The individual endpoints
 * also verify own-token, so a caller cannot skip this step.
 *
 * Secret key lives in RECAPTCHA_SECRET_KEY only — never in the response.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'captcha'), 40, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many verifications' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = captchaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid verification request', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const outcome = await verifyRecaptcha(
    parsed.data.token,
    parsed.data.action,
    request.headers.get('x-forwarded-for') ?? undefined,
  );

  return NextResponse.json({
    ok: outcome.ok,
    score: outcome.score,
    threshold: RECAPTCHA_SCORE_THRESHOLD,
    action: outcome.action ?? parsed.data.action,
    requiresV2Fallback: outcome.requiresV2Fallback,
    reason: outcome.reason,
    configured: recaptchaEnabled,
    verifiedServerSide: true,
  });
}

/** GET /api/captcha — public half of the key pair, for the client script. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '',
    enabled: recaptchaEnabled,
    threshold: RECAPTCHA_SCORE_THRESHOLD,
    /** Accepted action names — mirrors the server-side allow-list in Zod. */
    actions: Object.values(RECAPTCHA_ACTIONS),
  });
}
