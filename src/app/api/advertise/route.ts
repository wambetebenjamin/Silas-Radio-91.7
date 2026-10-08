import { NextResponse } from 'next/server';
import { KEYS, saveRecord, storageConfigured } from '@/lib/db';
import { sendStudioMail, studioWhatsappLink } from '@/lib/mailer';
import { RECAPTCHA_ACTIONS, verifyRecaptcha } from '@/lib/recaptcha';
import { advertiseSchema, clientKey, fieldErrors, rateLimit } from '@/lib/validation';
import { PACKAGES, SITE } from '@/lib/site';

/**
 * POST /api/advertise — advertising and sponsorship enquiry.
 * Sends the proposal request to the sales inbox and pings the studio WhatsApp.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'advertise'), 6, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many enquiries from this connection. Please try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = advertiseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyRecaptcha(
    data.token ?? data.v2Token,
    RECAPTCHA_ACTIONS.advertise,
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

  const packageName =
    PACKAGES.find((pkg) => pkg.slug === data.packageSlug)?.name ?? 'Not sure yet / mixed';

  const stored = await saveRecord(KEYS.advertise, {
    kind: 'advertising-enquiry',
    company: data.company,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    packageSlug: data.packageSlug,
    packageName,
    budget: data.budget,
    message: data.message,
    captchaScore: captcha.score,
  });

  const summary = `Advertising enquiry — ${data.company}\nContact: ${data.contactName} · ${data.email} · ${data.phone}\nPackage: ${packageName}${data.budget ? ` · Budget: ${data.budget}` : ''}\n\n${data.message}`;

  const mail = await sendStudioMail({
    subject: `Advertising enquiry: ${data.company}`,
    text: `${summary}\n\n— Sent from ${SITE.url}/advertise`,
    replyTo: data.email,
    to: process.env.ADVERTISING_EMAIL ?? SITE.advertisingEmail,
  });

  return NextResponse.json({
    ok: true,
    id: stored.data?.id,
    persisted: stored.source === 'kv',
    storage: storageConfigured ? 'kv' : 'local-buffer',
    notified: mail.ok,
    whatsappLink: studioWhatsappLink(summary),
    message: 'Thank you. Our sales team sends proposals within one working day.',
  });
}
