'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

import { useFormSubmit } from '@/lib/useFormSubmit';

/** General contact form — POSTs to /api/contact (Nodemailer + KV). */
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const { state, message, fields, submit } = useFormSubmit('contact_form', '/api/contact');

  return (
    <form
      className="sr-card p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        await submit(form);
      }}
      noValidate
    >
      <h3 className="text-[20px] font-bold text-[#111]">Send a message</h3>
      <p className="sr-meta mb-4">
        News tip, music submission, partnership or a complaint — everything reaches the studio desk.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sr-field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
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
          <label htmlFor="contact-email">Email address</label>
          <input
            id="contact-email"
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
          <label htmlFor="contact-phone">Phone (optional)</label>
          <input
            id="contact-phone"
            className="sr-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </div>

        <div className="sr-field">
          <label htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            className="sr-input"
            required
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            aria-invalid={Boolean(fields.subject)}
          />
          {fields.subject ? <span className="sr-error" role="alert">{fields.subject}</span> : null}
        </div>

        <div className="sr-field sm:col-span-2">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            className="sr-textarea"
            required
            maxLength={1500}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            aria-invalid={Boolean(fields.message)}
          />
          {fields.message ? <span className="sr-error" role="alert">{fields.message}</span> : null}
        </div>
      </div>

      <button type="submit" className="sr-clay-btn" disabled={state === 'submitting'}>
        <Send size={16} aria-hidden="true" />
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
      <p className="sr-meta mt-3" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
