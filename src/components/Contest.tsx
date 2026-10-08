'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';

import { useFormSubmit } from '@/lib/useFormSubmit';
import { useReducedMotion } from '@/hooks/useMotionAndLayout';
import { SectionHead } from './SectionHead';

/**
 * 13. Contests and giveaways
 *
 * - Active contest card with a live deadline countdown timer
 * - Entry form: name, phone, email, answer field
 * - reCAPTCHA v3, saved and confirmed by /api/contest
 */

export interface ContestDefinition {
  slug: string;
  title: string;
  prize: string;
  question: string;
  deadline: string; // ISO
  rules: string[];
}

export const ACTIVE_CONTEST: ContestDefinition = {
  slug: 'genre-night-vinyl-sets',
  title: 'Win a Genre Night vinyl set',
  prize: 'Three vinyl records picked by Grace Muthoni, plus a studio visit for two.',
  question: 'Which night is dedicated to gengetone on Genre Night?',
  deadline: '2025-12-05T21:00:00+03:00',
  rules: [
    'One entry per phone number.',
    'Entries close at 21:00 EAT on the deadline date.',
    'The winner is drawn on air during Genre Night and contacted on the number provided.',
    'Studio visit must be redeemed within 90 days.',
    'Staff of Silas Radio 91.7 and their families may not enter.',
  ],
};

function useCountdown(deadline: string, reduced: boolean) {
  const [remaining, setRemaining] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    // Under reduced motion the timer still updates, but once per minute rather
    // than every second — the numbers stay honest without constant movement.
    const interval = reduced ? 60_000 : 1000;
    const timer = setInterval(() => {
      setRemaining(new Date(deadline).getTime() - Date.now());
    }, interval);
    return () => clearInterval(timer);
  }, [deadline, reduced]);

  const clamped = Math.max(0, remaining);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamped % 3_600_000) / 60_000),
    seconds: Math.floor((clamped % 60_000) / 1000),
    closed: clamped === 0,
  };
}

export function Contest({ contest = ACTIVE_CONTEST }: { contest?: ContestDefinition }) {
  const reduced = useReducedMotion();
  const countdown = useCountdown(contest.deadline, reduced);
  const [form, setForm] = useState({ name: '', phone: '', email: '', answer: '' });
  const { state, message, fields, submit } = useFormSubmit('contest_entry', '/api/contest');

  return (
    <section className="spad" id="contests" aria-labelledby="contest-heading" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead id="contest-heading" eyebrow="Giveaways" ghost="CONTESTS" title="Contests and giveaways" />

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-start">
          <article className="sr-card p-6">
            <span className="sr-badge sr-badge--live w-fit">
              <Ticket size={12} aria-hidden="true" /> Entries open
            </span>
            <h3 className="text-[24px] font-bold text-[#111] mt-3">{contest.title}</h3>
            <p>{contest.prize}</p>

            <h4 className="font-heading text-[17px] font-semibold text-[#111] mt-4">Deadline countdown</h4>
            <div className="sr-countdown" role="timer" aria-live={reduced ? 'off' : 'polite'}>
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds },
              ].map((item) => (
                <div className="sr-countdown__item" key={item.label}>
                  <span>{String(item.value).padStart(2, '0')}</span>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
            <p className="sr-meta mt-2">
              {countdown.closed
                ? 'Entries are closed. The draw happens on air during Genre Night.'
                : `Closes ${new Date(contest.deadline).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', dateStyle: 'full', timeStyle: 'short' })} EAT`}
            </p>

            <h4 className="font-heading text-[17px] font-semibold text-[#111] mt-6">Contest rules</h4>
            <ul className="sr-prose">
              {contest.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="sr-meta">
              Full terms in the <a className="underline" href="/legal/terms#contest-terms">contest terms</a>.
            </p>
          </article>

          <form
            className="sr-card p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              await submit({ ...form, contestSlug: contest.slug });
            }}
            noValidate
          >
            <h3 className="text-[20px] font-bold text-[#111]">Enter the draw</h3>
            <p className="sr-meta mb-4">Answer the question and we will call the winner live on air.</p>

            <div className="sr-field">
              <label htmlFor="contest-name">Your name</label>
              <input
                id="contest-name"
                className="sr-input"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                aria-invalid={Boolean(fields.name)}
              />
              {fields.name ? <span className="sr-error" role="alert">{fields.name}</span> : null}
            </div>

            <div className="sr-field">
              <label htmlFor="contest-phone">Phone number</label>
              <input
                id="contest-phone"
                className="sr-input"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="0712 345 678"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                aria-invalid={Boolean(fields.phone)}
              />
              {fields.phone ? <span className="sr-error" role="alert">{fields.phone}</span> : null}
            </div>

            <div className="sr-field">
              <label htmlFor="contest-email">Email address</label>
              <input
                id="contest-email"
                className="sr-input"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                aria-invalid={Boolean(fields.email)}
              />
              {fields.email ? <span className="sr-error" role="alert">{fields.email}</span> : null}
            </div>

            <div className="sr-field">
              <label htmlFor="contest-answer">{contest.question}</label>
              <input
                id="contest-answer"
                className="sr-input"
                required
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                aria-invalid={Boolean(fields.answer)}
              />
              {fields.answer ? <span className="sr-error" role="alert">{fields.answer}</span> : null}
            </div>

            <button type="submit" className="sr-clay-btn" disabled={state === 'submitting' || countdown.closed}>
              <Ticket size={16} aria-hidden="true" />
              {state === 'submitting' ? 'Submitting entry…' : 'Submit my entry'}
            </button>

            <p className="sr-meta mt-3" role="status" aria-live="polite">
              {message}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
