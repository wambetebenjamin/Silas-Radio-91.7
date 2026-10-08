/**
 * reCAPTCHA v3 with v2 fallback.
 *
 * Required on: song request, newsletter, contest entry, advertising enquiry,
 * account registration, contact form.
 *
 * - Secret key is read from the environment only, never shipped to the client.
 * - Server-side verification happens in `verifyRecaptcha`.
 * - Score < 0.5 triggers the v2 fallback path (client shows a checkbox
 *   challenge, server requires a `recaptcha_v2_token` before accepting).
 */

export const RECAPTCHA_SCORE_THRESHOLD = 0.5;

export const RECAPTCHA_ACTIONS = {
  request: 'song_request',
  contest: 'contest_entry',
  newsletter: 'newsletter_signup',
  advertise: 'advertising_enquiry',
  contact: 'contact_form',
  register: 'account_registration',
} as const;

export type RecaptchaAction = (typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS];

export interface RecaptchaOutcome {
  ok: boolean;
  score: number | null;
  action?: string;
  /** True when the caller must retry through the v2 checkbox challenge. */
  requiresV2Fallback: boolean;
  reason?: string;
  /** Set when RECAPTCHA_SECRET_KEY is absent — requests are accepted but flagged. */
  bypassed?: boolean;
}

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify a v3 (or v2) token. `remoteIp` is optional but improves accuracy.
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction?: RecaptchaAction,
  remoteIp?: string,
): Promise<RecaptchaOutcome> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // No secret configured (e.g. local dev): never block a listener's request,
  // but mark the outcome so the studio can see it was unverified.
  if (!secret) {
    return {
      ok: true,
      score: null,
      requiresV2Fallback: false,
      bypassed: true,
      reason: 'RECAPTCHA_SECRET_KEY not configured',
    };
  }

  if (!token) {
    return {
      ok: false,
      score: null,
      requiresV2Fallback: true,
      reason: 'missing-token',
    };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });

    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      'error-codes'?: string[];
    };

    if (!data.success) {
      const codes = data['error-codes'] ?? [];
      const isV2Challenge =
        codes.includes('invalid-input-response') || codes.includes('missing-input-response');
      return {
        ok: false,
        score: null,
        requiresV2Fallback: !isV2Challenge,
        reason: codes.join(',') || 'verification-failed',
      };
    }

    const score = typeof data.score === 'number' ? data.score : null;

    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        ok: false,
        score,
        action: data.action,
        requiresV2Fallback: false,
        reason: 'action-mismatch',
      };
    }

    // v3 score below threshold → ask for the v2 checkbox fallback
    if (score !== null && score < RECAPTCHA_SCORE_THRESHOLD) {
      return {
        ok: false,
        score,
        action: data.action,
        requiresV2Fallback: true,
        reason: 'low-score',
      };
    }

    // v2 tokens return success with no score — accept them outright.
    return { ok: true, score, action: data.action, requiresV2Fallback: false };
  } catch (error) {
    return {
      ok: false,
      score: null,
      requiresV2Fallback: true,
      reason: error instanceof Error ? error.message : 'verification-error',
    };
  }
}

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
export const recaptchaEnabled = Boolean(RECAPTCHA_SITE_KEY);
