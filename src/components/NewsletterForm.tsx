'use client';

import { useState } from 'react';
import { Rss } from 'lucide-react';
import { useFormSubmit } from '@/lib/useFormSubmit';

/**
 * Newsletter signup — "Weekly playlist and community news to your inbox."
 * Email + genre preference, reCAPTCHA v3 protected, saved to Vercel KV.
 * Used in the footer and in the newsletter section on the home page.
 */

const GENRES = [
  { value: 'all', label: 'Everything East African' },
  { value: 'afrobeat', label: 'Afrobeat' },
  { value: 'benga', label: 'Benga' },
  { value: 'gengetone', label: 'Gengetone' },
  { value: 'bongo-flava', label: 'Bongo flava' },
  { value: 'gospel', label: 'Gospel' },
  { value: 'hip-hop', label: 'Hip hop' },
  { value: 'rnb', label: 'R&B' },
  { value: 'reggae', label: 'Reggae and dancehall' },
] as const;

export function NewsletterForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [email, setEmail] = useState('');
  const [genre, setGenre] = useState<string>('all');
  const { state, message, fields, submit } = useFormSubmit('newsletter_signup', '/api/newsletter');

  const dark = variant === 'dark';

  return (
    <form
      className={`sr-footer__newsletter ${dark ? 'text-white' : ''}`}
      onSubmit={async (event) => {
        event.preventDefault();
        await submit({ email, genre });
      }}
      noValidate
    >
      <div className={dark ? 'sr-field sr-field--dark' : 'sr-field'}>
        <label htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          className="sr-input"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fields.email)}
          aria-describedby={fields.email ? 'newsletter-email-error' : 'newsletter-email-hint'}
          placeholder="you@example.com"
        />
        <span id="newsletter-email-hint" className="sr-hint">
          Weekly playlist and community news to your inbox. One email, every Friday.
        </span>
        {fields.email ? (
          <span id="newsletter-email-error" className="sr-error" role="alert">
            {fields.email}
          </span>
        ) : null}
      </div>

      <div className={dark ? 'sr-field sr-field--dark' : 'sr-field'}>
        <label htmlFor="newsletter-genre">Genre preference</label>
        <select
          id="newsletter-genre"
          className="sr-select"
          name="genre"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
        >
          {GENRES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="sr-btn sr-btn--primary sr-btn--block"
        disabled={state === 'submitting'}
      >
        <Rss size={15} aria-hidden="true" />
        {state === 'submitting' ? 'Subscribing…' : 'Subscribe to the playlist'}
      </button>

      <p className="sr-meta mt-3" role="status" aria-live="polite">
        {state === 'success' ? message : null}
        {state === 'error' ? message : null}
        {state === 'needs-v2'
          ? 'Complete the verification challenge, then press subscribe again.'
          : null}
      </p>
      {state === 'idle' ? (
        <p className="sr-meta mt-3">
          This form is protected by reCAPTCHA v3. We never sell listener data — see the{' '}
          <a className="underline" href="/legal/privacy-policy">
            Privacy Policy
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
