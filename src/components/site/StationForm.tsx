'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { useFormSubmit } from '@/lib/useFormSubmit';
import type { RecaptchaAction } from '@/lib/recaptcha';
import { PACKAGES, SCHEDULE, SITE } from '@/lib/site';

type FormMode = 'contact' | 'request' | 'advertise' | 'newsletter';
interface Field { name: string; label: string; type?: string; optional?: boolean; wide?: boolean; autoComplete?: string; placeholder?: string; maxLength?: number; options?: { value: string; label: string }[] }
interface FormConfig { action: RecaptchaAction; title: string; description: string; submit: string; fields: Field[] }
const CONFIG: Record<FormMode, FormConfig> = {
  contact: {
    action: 'contact_form', title: 'What’s on your mind?', description: 'News tips, music submissions, feedback or just a hello. Send a note to the studio.', submit: 'Send your message',
    fields: [
      { name: 'name', label: 'Your name', autoComplete: 'name', maxLength: 80 },
      { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', maxLength: 160 },
      { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', optional: true, maxLength: 40 },
      { name: 'subject', label: 'Subject', placeholder: 'What would you like to talk about?', maxLength: 140 },
      { name: 'message', label: 'Your message', type: 'textarea', wide: true, maxLength: 1500 },
    ],
  },
  request: {
    action: 'song_request', title: 'Put it on the playlist.', description: 'Tell us what you want to hear and who it’s for. Requests are subject to the show’s playlist.', submit: 'Send to the studio',
    fields: [
      { name: 'name', label: 'Your name', autoComplete: 'name', maxLength: 80 },
      { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '0712 345 678', maxLength: 30 },
      { name: 'songTitle', label: 'Song title', maxLength: 140 },
      { name: 'artistName', label: 'Artist', maxLength: 140 },
      { name: 'dedication', label: 'A dedication', type: 'textarea', optional: true, wide: true, placeholder: 'Who are we playing it for?', maxLength: 600 },
      { name: 'showTime', label: 'Preferred show', type: 'select', wide: true, options: [{ value: 'Any show', label: 'Any show — surprise me' }, ...SCHEDULE.map((show) => ({ value: `${show.name} — ${show.start}–${show.end}`, label: `${show.name} · ${show.start}–${show.end} EAT` }))] },
    ],
  },
  advertise: {
    action: 'advertising_enquiry', title: 'Let’s make some noise.', description: 'Tell us about your business and what a successful campaign would look like.', submit: 'Request a proposal',
    fields: [
      { name: 'company', label: 'Business or organisation', autoComplete: 'organization', maxLength: 120 },
      { name: 'contactName', label: 'Your name', autoComplete: 'name', maxLength: 80 },
      { name: 'email', label: 'Work email', type: 'email', autoComplete: 'email', maxLength: 160 },
      { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '0712 345 678', maxLength: 30 },
      { name: 'packageSlug', label: 'Package of interest', type: 'select', options: [{ value: 'unsure', label: 'Help me choose' }, ...PACKAGES.map((pkg) => ({ value: pkg.slug, label: pkg.name }))] },
      { name: 'budget', label: 'Campaign budget', optional: true, placeholder: 'e.g. KES 50,000', maxLength: 80 },
      { name: 'message', label: 'Your campaign brief', type: 'textarea', wide: true, maxLength: 1200 },
    ],
  },
  newsletter: {
    action: 'newsletter_signup', title: 'The weekly playlist', description: '', submit: 'Count me in',
    fields: [
      { name: 'email', label: 'Your email address', type: 'email', autoComplete: 'email', placeholder: 'you@example.com', maxLength: 160 },
      { name: 'genre', label: 'Your kind of music', type: 'select', options: [{ value: 'all', label: 'A little of everything' }, { value: 'afrobeat', label: 'Afrobeat' }, { value: 'benga', label: 'Benga' }, { value: 'gengetone', label: 'Gengetone' }, { value: 'bongo-flava', label: 'Bongo flava' }, { value: 'gospel', label: 'Gospel' }, { value: 'hip-hop', label: 'Hip-hop' }, { value: 'rnb', label: 'R&B / Soul' }, { value: 'reggae', label: 'Reggae' }] },
    ],
  },
};

export function StationForm({ mode, packageSlug }: { mode: FormMode; packageSlug?: string }) {
  const config = CONFIG[mode];
  const [form, setForm] = useState<Record<string, string>>(() => Object.fromEntries(config.fields.map((field) => [field.name, field.options?.[0]?.value ?? ''])));
  const { state, fields, message, submit } = useFormSubmit(config.action, `/api/${mode}`);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (mode === 'advertise' && packageSlug && PACKAGES.some((pkg) => pkg.slug === packageSlug)) setForm((previous) => ({ ...previous, packageSlug }));
  }, [mode, packageSlug]);
  useEffect(() => {
    if (state === 'error') formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state, fields]);
  return (
    <form className={mode === 'newsletter' ? 'newsletter-form' : 'form-panel'} ref={formRef} noValidate onSubmit={async (event) => { event.preventDefault(); if (state !== 'submitting') await submit(form); }} aria-label={config.title}>
      {mode !== 'newsletter' && <><h2>{config.title}</h2><p>{config.description}</p></>}
      <div className="form-grid">
        {config.fields.map((field) => {
          const id = `${mode}-${field.name}`;
          const props = { id, name: field.name, value: form[field.name] ?? '', required: !field.optional, 'aria-invalid': Boolean(fields[field.name]), 'aria-describedby': fields[field.name] ? `${id}-error` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((previous) => ({ ...previous, [field.name]: event.target.value })) };
          return <div key={field.name} className={`field ${field.wide ? 'field--wide' : ''}`}><label htmlFor={id}>{field.label}{field.optional && <span> (optional)</span>}</label>{field.type === 'textarea' ? <textarea {...props} rows={4} maxLength={field.maxLength} placeholder={field.placeholder} /> : field.type === 'select' ? <select {...props}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input {...props} type={field.type ?? 'text'} autoComplete={field.autoComplete} placeholder={field.placeholder} maxLength={field.maxLength} />}{fields[field.name] && <span className="field-error" id={`${id}-error`}>{fields[field.name]}</span>}</div>;
        })}
      </div>
      <button type="submit" className="button button--primary" disabled={state === 'submitting'}>{state === 'submitting' ? <><LoaderCircle size={16} className="spin" aria-hidden="true" />Sending…</> : <>{config.submit}<ArrowUpRight size={16} aria-hidden="true" /></>}</button>
      <div className="form-status" role="status" aria-live="polite" data-state={state}>{message}{message.startsWith('Preview only') && <><br /><a className="text-link" href={`mailto:${mode === 'advertise' ? SITE.advertisingEmail : SITE.email}`}>Email the studio instead <ArrowUpRight size={13} aria-hidden="true" /></a></>}</div>
      <p className="form-privacy">{mode === 'newsletter' ? 'Music and community updates. No spam. You can unsubscribe at any time.' : 'Your details are used only to respond to this enquiry.'} <Link href="/legal/privacy-policy">Privacy policy</Link></p>
    </form>
  );
}
