'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { useFormSubmit } from '@/lib/useFormSubmit';

/**
 * Account registration form — one of the six reCAPTCHA v3 touchpoints.
 *
 * Note: this build ships the registration form and its server-side verification
 * gate; the account store is the next backend milestone. The form posts to
 * /api/captcha to verify the token server-side and reports that accounts are
 * not yet open rather than pretending a user was created.
 */
export function RegisterForm() {
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [verified, setVerified] = useState<string | null>(null);
  const { state, message, fields, submit } = useFormSubmit('account_registration', '/api/captcha');

  return (
    <form
      className="sr-card p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await submit(form);
        if (result.ok) {
          setVerified('Verification complete. Accounts open with the next release — we will email you.');
        }
      }}
      noValidate
    >
      <h3 className="text-[20px] font-bold text-[#111]">
        <UserPlus size={18} aria-hidden="true" className="inline mr-2 text-[#5c00ce]" />
        Create a listener account
      </h3>
      <p className="sr-meta mb-4">
        Accounts will sync your favourite shows, saved episodes and contest history. Registration is
        protected by reCAPTCHA v3 with server-side verification.
      </p>

      <div className="sr-field">
        <label htmlFor="register-name">Display name</label>
        <input
          id="register-name"
          className="sr-input"
          required
          autoComplete="nickname"
          value={form.displayName}
          onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
          aria-invalid={Boolean(fields.displayName)}
        />
        {fields.displayName ? <span className="sr-error" role="alert">{fields.displayName}</span> : null}
      </div>

      <div className="sr-field">
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
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
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          className="sr-input"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          aria-invalid={Boolean(fields.password)}
          aria-describedby="register-password-hint"
        />
        <span className="sr-hint" id="register-password-hint">
          At least 10 characters. Stored hashed — never in plain text.
        </span>
        {fields.password ? <span className="sr-error" role="alert">{fields.password}</span> : null}
      </div>

      <button type="submit" className="sr-clay-btn" disabled={state === 'submitting'}>
        <UserPlus size={16} aria-hidden="true" />
        {state === 'submitting' ? 'Verifying…' : 'Register'}
      </button>

      <p className="sr-meta mt-3" role="status" aria-live="polite">
        {verified ?? message}
      </p>
    </form>
  );
}
