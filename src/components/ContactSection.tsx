'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

import { PACKAGES, SITE } from '@/lib/site';
import { useFormSubmit } from '@/lib/useFormSubmit';
import { SectionHead } from './SectionHead';
import { WhatsAppIcon } from './icons';

/**
 * 16. Contact section
 *
 * Studio address, Google Maps embed, phone, WhatsApp, and an advertising
 * enquiry form protected by reCAPTCHA v3 (POSTs to /api/advertise, which emails
 * the sales desk and pings the studio WhatsApp).
 */
export function ContactSection({ showAdvertisingForm = true }: { showAdvertisingForm?: boolean }) {
  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    packageSlug: 'presenter-live-read',
    budget: '',
    message: '',
  });
  const { state, message, fields, submit } = useFormSubmit('advertising_enquiry', '/api/advertise');

  return (
    <section className="spad" id="contact" aria-labelledby="contact-heading" style={{ background: '#f5f5f5' }}>
      <div className="sr-container">
        <SectionHead id="contact-heading" eyebrow="Studio" ghost="CONTACT" title="Talk to the station" />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] items-start">
          <div>
            <ul className="grid gap-4">
              <li className="flex gap-3">
                <span className="sr-footer__icon" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3 className="font-heading text-[17px] font-semibold text-[#111]">Studio address</h3>
                  <p className="mb-0">{SITE.studioAddress.full}</p>
                  <p className="sr-meta">Reception is open 08:00–18:00, Monday to Friday.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="sr-footer__icon" aria-hidden="true">
                  <Phone size={18} />
                </span>
                <div>
                  <h3 className="font-heading text-[17px] font-semibold text-[#111]">Phone</h3>
                  <p className="mb-0">
                    <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
                  </p>
                  <p className="sr-meta">Request line is open from 05:15 every weekday.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="sr-footer__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <div>
                  <h3 className="font-heading text-[17px] font-semibold text-[#111]">Email</h3>
                  <p className="mb-0">
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </p>
                  <p className="sr-meta">Advertising: {SITE.advertisingEmail}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="sr-footer__icon" aria-hidden="true">
                  <WhatsAppIcon size={18} />
                </span>
                <div>
                  <h3 className="font-heading text-[17px] font-semibold text-[#111]">WhatsApp</h3>
                  <p className="mb-0">{SITE.whatsappDisplay}</p>
                  <a className="sr-btn sr-btn--primary mt-2" href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon size={15} />
                    Request a song or enquire about advertising
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-6 rounded-[12px] overflow-hidden border border-[#e1e1e1]">
              <iframe
                title="Map showing the Silas Radio 91.7 studio on Kimathi Street, Nairobi"
                src={SITE.mapsEmbed}
                width="100%"
                height="280"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: 'block' }}
              />
            </div>
          </div>

          {showAdvertisingForm ? (
            <form
              id="enquiry"
              className="sr-card p-6 md:p-7"
              onSubmit={async (event) => {
                event.preventDefault();
                await submit(form);
              }}
              noValidate
            >
              <h3 className="text-[20px] font-bold text-[#111]">Advertising enquiry</h3>
              <p className="sr-meta mb-4">
                Tell us the campaign and we will send a proposal within one working day.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sr-field">
                  <label htmlFor="enquiry-company">Company</label>
                  <input
                    id="enquiry-company"
                    className="sr-input"
                    required
                    autoComplete="organization"
                    value={form.company}
                    onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                    aria-invalid={Boolean(fields.company)}
                  />
                  {fields.company ? <span className="sr-error" role="alert">{fields.company}</span> : null}
                </div>

                <div className="sr-field">
                  <label htmlFor="enquiry-contact">Contact name</label>
                  <input
                    id="enquiry-contact"
                    className="sr-input"
                    required
                    autoComplete="name"
                    value={form.contactName}
                    onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))}
                    aria-invalid={Boolean(fields.contactName)}
                  />
                  {fields.contactName ? <span className="sr-error" role="alert">{fields.contactName}</span> : null}
                </div>

                <div className="sr-field">
                  <label htmlFor="enquiry-email">Email</label>
                  <input
                    id="enquiry-email"
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
                  <label htmlFor="enquiry-phone">Phone</label>
                  <input
                    id="enquiry-phone"
                    className="sr-input"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    aria-invalid={Boolean(fields.phone)}
                  />
                  {fields.phone ? <span className="sr-error" role="alert">{fields.phone}</span> : null}
                </div>

                <div className="sr-field">
                  <label htmlFor="enquiry-package">Package of interest</label>
                  <select
                    id="enquiry-package"
                    className="sr-select"
                    value={form.packageSlug}
                    onChange={(event) => setForm((prev) => ({ ...prev, packageSlug: event.target.value }))}
                  >
                    {PACKAGES.map((pkg) => (
                      <option key={pkg.slug} value={pkg.slug}>
                        {pkg.name} — from KES {pkg.priceKES}
                      </option>
                    ))}
                    <option value="unsure">Not sure yet / mixed</option>
                  </select>
                </div>

                <div className="sr-field">
                  <label htmlFor="enquiry-budget">Monthly budget (optional)</label>
                  <input
                    id="enquiry-budget"
                    className="sr-input"
                    placeholder="KES 50,000"
                    value={form.budget}
                    onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
                  />
                </div>

                <div className="sr-field sm:col-span-2">
                  <label htmlFor="enquiry-message">Campaign brief</label>
                  <textarea
                    id="enquiry-message"
                    className="sr-textarea"
                    required
                    maxLength={1200}
                    value={form.message}
                    onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                    aria-invalid={Boolean(fields.message)}
                  />
                  {fields.message ? <span className="sr-error" role="alert">{fields.message}</span> : null}
                </div>
              </div>

              <button type="submit" className="sr-clay-btn" disabled={state === 'submitting'}>
                <Send size={16} aria-hidden="true" />
                {state === 'submitting' ? 'Sending enquiry…' : 'Request a Proposal'}
              </button>

              <p className="sr-meta mt-3" role="status" aria-live="polite">
                {message}
              </p>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
