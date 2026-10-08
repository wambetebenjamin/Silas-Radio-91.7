import { z } from 'zod';

/** Kenyan phone: +2547XXXXXXXX / 07XXXXXXXX / 01XXXXXXXX forms accepted. */
const kenyanPhone = z
  .string()
  .trim()
  .regex(
    /^(?:\+?254|0)(?:7|1)\d{8}$/,
    'Enter a valid Kenyan phone number, e.g. 0712 345 678',
  );

export const songRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  phone: kenyanPhone,
  songTitle: z.string().trim().min(1, 'Which song?').max(140),
  artistName: z.string().trim().min(1, 'Who sings it?').max(140),
  dedication: z.string().trim().max(600).optional().default(''),
  showTime: z.string().trim().min(1, 'Pick a show time').max(80),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const contestEntrySchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  phone: kenyanPhone,
  email: z.string().trim().email('Enter a valid email address').max(160),
  answer: z.string().trim().min(1, 'Answer the contest question').max(400),
  contestSlug: z.string().trim().min(1).max(80),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(160),
  genre: z.enum([
    'all',
    'afrobeat',
    'benga',
    'gengetone',
    'bongo-flava',
    'gospel',
    'hip-hop',
    'rnb',
    'reggae',
  ]),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const advertiseSchema = z.object({
  company: z.string().trim().min(2, 'Company name is required').max(120),
  contactName: z.string().trim().min(2, 'Who should we speak to?').max(80),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: kenyanPhone,
  packageSlug: z.string().trim().max(80).optional().default('unsure'),
  budget: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(10, 'Tell us a little about the campaign').max(1200),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: z.string().trim().max(40).optional().default(''),
  subject: z.string().trim().min(2, 'Add a subject').max(140),
  message: z.string().trim().min(10, 'How can we help?').max(1500),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Choose a display name').max(60),
  email: z.string().trim().email('Enter a valid email address').max(160),
  password: z.string().min(10, 'Use at least 10 characters').max(200),
  token: z.string().optional(),
  v2Token: z.string().optional(),
});

export const captchaSchema = z.object({
  token: z.string().min(1, 'Missing reCAPTCHA token'),
  action: z.enum([
    'song_request',
    'contest_entry',
    'newsletter_signup',
    'advertising_enquiry',
    'contact_form',
    'account_registration',
  ]),
});

/** Flatten a ZodError into { field: message } for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Very small in-memory rate limiter for public endpoints. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}

export function clientKey(request: Request, scope: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'local';
  return `${scope}:${ip}`;
}
