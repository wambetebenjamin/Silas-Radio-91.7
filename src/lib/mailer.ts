/**
 * Notification transport.
 *
 * - Email via Nodemailer (SMTP) for /api/contact, /api/advertise and studio
 *   alerts about new song requests and contest entries.
 * - WhatsApp notification to the studio through the click-to-chat deep link
 *   (and an optional wa.me API handoff when WHATSAPP_API_TOKEN is present).
 *
 * Every send is best-effort: a mail failure must never lose a listener's
 * submission, which is why callers persist to KV first.
 */

import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export interface MailPayload {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string;
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
}

export async function sendStudioMail({ subject, text, html, replyTo, to }: MailPayload): Promise<SendResult> {
  const mailer = getTransporter();
  const recipient = to ?? process.env.STUDIO_NOTIFICATION_EMAIL ?? 'studio@silasradio917.co.ke';
  const from =
    process.env.NEWSLETTER_FROM ?? 'Silas Radio 91.7 <newsletter@silasradio917.co.ke>';

  if (!mailer) {
    // Nothing to send with — log for the studio operator and continue.
    console.info('[mail:skipped]', subject, text.slice(0, 240));
    return { ok: false, skipped: true, reason: 'SMTP not configured' };
  }

  try {
    await mailer.sendMail({ from, to: recipient, subject, text, html, replyTo });
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'send failed';
    console.error('[mail:error]', reason);
    return { ok: false, reason };
  }
}

/**
 * Deep link the studio can tap to see the notification in WhatsApp.
 * The spec's public link is fixed; studio notifications reuse it with a
 * pre-filled summary so a presenter can act on it immediately.
 */
export function studioWhatsappLink(summary: string): string {
  const number = process.env.WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254112272061';
  return `https://wa.me/${number}?text=${encodeURIComponent(summary)}`;
}

export const whatsappApiConfigured = Boolean(process.env.WHATSAPP_API_TOKEN);
