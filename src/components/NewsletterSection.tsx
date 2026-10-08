import { Rss } from 'lucide-react';

import { SectionHead } from './SectionHead';
import { NewsletterForm } from './NewsletterForm';

/**
 * 15. Newsletter section
 * "Weekly playlist and community news to your inbox."
 * Email + genre preference, reCAPTCHA v3, saved to Vercel KV.
 */
export function NewsletterSection() {
  return (
    <section className="spad" id="newsletter" aria-labelledby="newsletter-heading" style={{ background: '#f2f2f2' }}>
      <div className="sr-container grid gap-8 lg:grid-cols-[1fr_0.9fr] items-center">
        <div>
          <SectionHead
            id="newsletter-heading"
            eyebrow="Every Friday"
            ghost="INBOX"
            title="Weekly playlist and community news to your inbox."
          />
          <p className="sr-lead">
            One email each Friday: the week's playlist, the community stories that mattered, and the
            contests opening next week. Unsubscribe in one click, and we never sell your address.
          </p>
          <ul className="sr-meta grid gap-1 mt-3">
            <li className="flex items-center gap-2">
              <Rss size={13} aria-hidden="true" /> 9,400 Nairobi and diaspora subscribers
            </li>
            <li className="flex items-center gap-2">
              <Rss size={13} aria-hidden="true" /> Genre preference decides what leads each issue
            </li>
          </ul>
        </div>

        <div className="sr-card p-6">
          <h3 className="text-[19px] font-bold text-[#111] mb-1">Join the list</h3>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
