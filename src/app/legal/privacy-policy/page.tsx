import type { Metadata } from 'next';
import Link from 'next/link';

import { LEGAL, SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Silas Radio 91.7 collects, uses, stores and protects listening data, song request data, newsletter data and analytics under the Kenya Data Protection Act 2019.',
  alternates: { canonical: '/legal/privacy-policy' },
};

const SECTIONS = [
  { id: 'listening-data', label: 'Listening Data' },
  { id: 'request-data', label: 'Request Data' },
  { id: 'newsletter-data', label: 'Newsletter Data' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead as="h1" eyebrow="Legal" ghost="PRIVACY" title="Privacy Policy" />
        <p className="sr-updated">
          Last updated {new Date(LEGAL.privacyUpdated).toLocaleDateString('en-KE', { dateStyle: 'long' })} · Data
          controller: {SITE.name}, {SITE.studioAddress.full}
        </p>

        <nav className="sr-toc my-6" aria-label="Sections of this policy">
          <p className="sr-meta mb-2">On this page</p>
          <ul className="flex flex-wrap gap-x-5">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sr-prose">
          <h2 id="intro">1. Who we are and what this policy covers</h2>
          <p>
            {SITE.name} ("we", "us") is a community radio station broadcasting on {SITE.frequency} from{' '}
            {SITE.studioAddress.locality}, {SITE.city}, Kenya, and streaming worldwide at {SITE.url}.
            We are the data controller for the personal data described in this policy, and we handle
            it in line with the <strong>Kenya Data Protection Act 2019</strong> and the regulations
            issued under it.
          </p>
          <p>
            This policy explains what we collect when you listen, request a song, enter a contest,
            subscribe to our newsletter, submit an advertising enquiry or contact the studio — and
            what you can ask us to do about it.
          </p>

          <h2 id="listening-data">2. Listening Data</h2>
          <p>
            <strong>What we collect.</strong> When you press play we record a live listener count (how
            many streams are open right now) and, in aggregate, which shows and times people listen
            to. The live count is a number — it is not linked to your name, email address or phone
            number. Your player also stores your volume, playback speed and last channel in your own
            browser (local storage) so the station sounds the same when you return.
          </p>
          <p>
            <strong>Why.</strong> To keep the stream stable, to report audience numbers to advertisers
            in aggregate, and to justify our community licence with the Communications Authority of
            Kenya.
          </p>
          <p>
            <strong>Legal basis.</strong> Legitimate interest in operating a radio station and
            measuring its audience, plus your consent for anything stored on your device (see the{' '}
            <Link href="/legal/cookie-policy">Cookie Policy</Link>).
          </p>
          <p>
            <strong>Retention.</strong> Aggregate listening counts are kept for 24 months. Device
            preferences stay in your browser until you clear them.
          </p>
          <p>
            <strong>Who we share it with.</strong> Our streaming host and CDN, as processors, purely to
            deliver audio. We do not sell listener data.
          </p>

          <h2 id="request-data">3. Request Data</h2>
          <p>
            <strong>What we collect.</strong> When you send a song request or dedication we collect the
            name you give us, your phone number, the song title, the artist, your dedication message
            and the show time you chose. Contest entries additionally include your email address and
            your answer to the contest question.
          </p>
          <p>
            <strong>Why.</strong> To read your request out on air, to confirm the dedication if the
            presenter needs to, to verify contest eligibility and to contact winners.
          </p>
          <p>
            <strong>Legal basis.</strong> Your consent when you submit the form, and our legitimate
            interest in running the request line.
          </p>
          <p>
            <strong>Retention.</strong> Requests and contest entries are retained for 12 months so we
            can resolve disputes about prizes, then deleted.
          </p>
          <p>
            <strong>Messages off-platform.</strong> If you message us on WhatsApp, WhatsApp's own
            privacy terms apply to that conversation, and your number is visible to the studio phone.
          </p>

          <h2 id="newsletter-data">4. Newsletter Data</h2>
          <p>
            <strong>What we collect.</strong> Your email address and your genre preference. We record
            the date and time you subscribed and whether the address is confirmed.
          </p>
          <p>
            <strong>Why.</strong> To send the weekly playlist and community news, and to lead each
            issue with the genre you chose.
          </p>
          <p>
            <strong>Legal basis.</strong> Consent — the newsletter is opt-in only, and every email
            contains a one-click unsubscribe link.
          </p>
          <p>
            <strong>Retention.</strong> Until you unsubscribe, plus 30 days for suppression records so
            we do not add you again by mistake.
          </p>
          <p>
            <strong>Sharing.</strong> Our email delivery provider processes the list on our
            instructions. We never sell, rent or exchange the list.
          </p>

          <h2 id="analytics">5. Analytics</h2>
          <p>
            <strong>What we collect.</strong> Aggregated, anonymised statistics: page views, stream
            starts, podcast plays, device type and approximate region (country level). We do not build
            a personal profile of you and we do not allow behavioural advertising on this site.
          </p>
          <p>
            <strong>Legal basis.</strong> Consent for analytics cookies, which you can grant or refuse
            in the cookie banner and change at any time in the Cookie Policy modal.
          </p>
          <p>
            <strong>Retention.</strong> Raw analytics events are kept for 14 months; reporting is
            viewed in aggregate.
          </p>
          <p>
            <strong>Third parties.</strong> If you refuse analytics, no analytics identifiers are set.
          </p>

          <h2 id="your-rights">6. Your Rights</h2>
          <p>
            Under the Kenya Data Protection Act 2019 you have the right to:
          </p>
          <ul>
            <li>
              <strong>Be informed</strong> — this policy, and the notices shown on each form, tell you
              what happens to your data before you submit it.
            </li>
            <li>
              <strong>Access</strong> — ask for a copy of the personal data we hold about you.
            </li>
            <li>
              <strong>Rectify</strong> — ask us to correct data that is inaccurate or incomplete.
            </li>
            <li>
              <strong>Erase</strong> — ask us to delete your request, contest entry or newsletter
              subscription.
            </li>
            <li>
              <strong>Object or restrict</strong> — object to processing based on legitimate interests,
              or ask us to pause it while a complaint is resolved.
            </li>
            <li>
              <strong>Portability</strong> — receive the data you gave us in a structured, machine
              readable format.
            </li>
            <li>
              <strong>Withdraw consent</strong> — at any time, without affecting the lawfulness of what
              happened before.
            </li>
            <li>
              <strong>Complain</strong> — to the {LEGAL.dataProtectionAuthority}. We would rather you
              came to us first, but you do not have to.
            </li>
          </ul>
          <p>
            We respond to rights requests within <strong>14 days</strong> of a verified request. To
            protect you, we may ask you to confirm control of the phone number or email address you
            used.
          </p>

          <h2 id="contact">7. Contact</h2>
          <table>
            <tbody>
              <tr>
                <th scope="row">Data protection contact</th>
                <td>Station Manager, {SITE.name}</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </td>
              </tr>
              <tr>
                <th scope="row">Phone / WhatsApp</th>
                <td>
                  <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
                </td>
              </tr>
              <tr>
                <th scope="row">Postal address</th>
                <td>{SITE.studioAddress.full}</td>
              </tr>
              <tr>
                <th scope="row">Supervisory authority</th>
                <td>{LEGAL.dataProtectionAuthority}</td>
              </tr>
            </tbody>
          </table>

          <h2 id="changes">8. Changes to this policy</h2>
          <p>
            When we change how we handle personal data we update this page and the "last updated"
            date above, and — for anything significant — we say so on air and in the newsletter.
            Related documents: <Link href="/legal/cookie-policy">Cookie Policy</Link> and{' '}
            <Link href="/legal/terms">Terms and Conditions</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
