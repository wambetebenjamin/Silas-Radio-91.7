'use client';

import { useState } from 'react';
import { Music, Send } from 'lucide-react';

import { useFormSubmit } from '@/lib/useFormSubmit';
import { SCHEDULE, formatDurationLabel } from '@/lib/site';
import { WhatsAppIcon } from './icons';

/**
 * 9. Song request and dedication form
 *
 * EFFECT-29 — submit button is claymorphic with AA contrast and physical press
 *   deformation; the form title uses clay writing.
 * EFFECT-12 — every field has full motion states between 120ms and 320ms.
 *
 * Fields: your name, phone, song title, artist name, dedication message,
 * preferred show time. reCAPTCHA v3 protects submission; /api/request saves to
 * Vercel KV and sends a WhatsApp notification to the studio.
 */

const SHOW_TIMES = Array.from(
  new Set(SCHEDULE.map((slot) => `${slot.name} — ${formatDurationLabel(slot.start, slot.end)}`)),
);

export function SongRequestForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    songTitle: '',
    artistName: '',
    dedication: '',
    showTime: SHOW_TIMES[0] ?? 'Any show',
  });

  const { state, message, fields, submit } = useFormSubmit('song_request', '/api/request');

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <section className="spad" id="request" aria-labelledby="request-heading" style={{ background: '#290849' }}>
      <div className="sr-container grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
        <div>
          {/* EFFECT-29 — clay writing on the form title */}
          <p className="sr-eyebrow !text-[#c9a6ff]">Song request and dedication</p>
          <h2 id="request-heading" className="sr-clay-title">
            Request a song, send a dedication
          </h2>
          <p className="text-white/80 max-w-[46ch]">
            Tell us the song, the artist and who it is for. Presenters read requests out live
            between 06:00 and 08:30, and again on the evening commute.
          </p>

          <ul className="text-white/75 mt-5 space-y-2">
            <li className="flex gap-3">
              <Music size={16} aria-hidden="true" className="mt-1 text-[#c9a6ff]" />
              Requests are saved to the studio desk and land in the presenter's queue.
            </li>
            <li className="flex gap-3">
              <WhatsAppIcon size={16} />
              Prefer WhatsApp? Use the green button — it goes straight to the studio phone.
            </li>
          </ul>
        </div>

        <form
          className="bg-white rounded-[12px] p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
          onSubmit={async (event) => {
            event.preventDefault();
            await submit(form);
          }}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sr-field">
              <label htmlFor="request-name">Your name</label>
              <input
                id="request-name"
                className="sr-input"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                aria-invalid={Boolean(fields.name)}
                aria-describedby={fields.name ? 'request-name-error' : undefined}
              />
              {fields.name ? (
                <span className="sr-error" id="request-name-error" role="alert">
                  {fields.name}
                </span>
              ) : null}
            </div>

            <div className="sr-field">
              <label htmlFor="request-phone">Phone number</label>
              <input
                id="request-phone"
                className="sr-input"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="0712 345 678"
                value={form.phone}
                onChange={update('phone')}
                aria-invalid={Boolean(fields.phone)}
                aria-describedby={fields.phone ? 'request-phone-error' : 'request-phone-hint'}
              />
              {fields.phone ? (
                <span className="sr-error" id="request-phone-error" role="alert">
                  {fields.phone}
                </span>
              ) : (
                <span className="sr-hint" id="request-phone-hint">
                  Only used if the presenter needs to confirm the dedication on air.
                </span>
              )}
            </div>

            <div className="sr-field">
              <label htmlFor="request-song">Song title</label>
              <input
                id="request-song"
                className="sr-input"
                name="songTitle"
                required
                value={form.songTitle}
                onChange={update('songTitle')}
                aria-invalid={Boolean(fields.songTitle)}
              />
              {fields.songTitle ? (
                <span className="sr-error" role="alert">
                  {fields.songTitle}
                </span>
              ) : null}
            </div>

            <div className="sr-field">
              <label htmlFor="request-artist">Artist name</label>
              <input
                id="request-artist"
                className="sr-input"
                name="artistName"
                required
                value={form.artistName}
                onChange={update('artistName')}
                aria-invalid={Boolean(fields.artistName)}
              />
              {fields.artistName ? (
                <span className="sr-error" role="alert">
                  {fields.artistName}
                </span>
              ) : null}
            </div>

            <div className="sr-field sm:col-span-2">
              <label htmlFor="request-dedication">Dedication message</label>
              <textarea
                id="request-dedication"
                className="sr-textarea"
                name="dedication"
                rows={4}
                maxLength={600}
                value={form.dedication}
                onChange={update('dedication')}
                aria-describedby="request-dedication-hint"
              />
              <span className="sr-hint" id="request-dedication-hint">
                Who is it for? Keep it short — presenters read about three lines on air.
              </span>
            </div>

            <div className="sr-field sm:col-span-2">
              <label htmlFor="request-show">Preferred show time</label>
              <select
                id="request-show"
                className="sr-select"
                name="showTime"
                value={form.showTime}
                onChange={update('showTime')}
                required
              >
                {SHOW_TIMES.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EFFECT-29 — claymorphic submit with press deformation */}
          <button type="submit" className="sr-clay-btn mt-2" disabled={state === 'submitting'}>
            <Send size={16} aria-hidden="true" />
            {state === 'submitting' ? 'Sending to the studio…' : 'Send my request'}
          </button>

          <p className="sr-meta mt-4" role="status" aria-live="polite">
            {message}
          </p>
          <p className="sr-meta mt-2">
            Protected by reCAPTCHA v3 with server-side verification. Your number is used for this
            request only — see the Privacy Policy.
          </p>
        </form>
      </div>
    </section>
  );
}
