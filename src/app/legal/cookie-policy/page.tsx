import type { Metadata } from 'next';
import Link from 'next/link';

import { LEGAL, SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'The cookies and local storage Silas Radio 91.7 uses: necessary, functional and analytics categories, how consent works under the Kenya Data Protection Act 2019, and how to change your choices.',
  alternates: { canonical: '/legal/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead as="h1" eyebrow="Legal" ghost="COOKIES" title="Cookie Policy" />
        <p className="sr-updated">
          Last updated {new Date(LEGAL.cookieUpdated).toLocaleDateString('en-KE', { dateStyle: 'long' })} · Works with the
          consent banner you saw when you first visited.
        </p>

        <div className="sr-prose">
          <h2 id="what">1. What we store, and why</h2>
          <p>
            This site is deliberately light. We do not run advertising cookies, we do not sell data,
            and we do not use cross-site trackers. What we store falls into three categories, and only
            the first is required for the station to work.
          </p>

          <h2 id="necessary">2. Necessary (always active)</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Purpose</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>silas-cookie-consent</code>
                </td>
                <td>localStorage</td>
                <td>Remembers the choice you made in the consent banner so we do not ask again.</td>
                <td>Until you clear it</td>
              </tr>
              <tr>
                <td>
                  <code>silas-radio-player</code>
                </td>
                <td>localStorage</td>
                <td>Keeps the audio player state (volume, speed, last channel) so the station sounds the same when you return.</td>
                <td>Until you clear it</td>
              </tr>
              <tr>
                <td>reCAPTCHA session</td>
                <td>Third-party</td>
                <td>
                  Google reCAPTCHA protects the six forms on this site from automated spam. It sets
                  strictly necessary cookies to distinguish humans from bots.
                </td>
                <td>Session, up to 6 months</td>
              </tr>
            </tbody>
          </table>
          <p>
            These cannot be switched off, because without them the site cannot remember your consent,
            keep the player working or defend its forms. They are not used for advertising.
          </p>

          <h2 id="functional">3. Functional (opt-in)</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">What</th>
                <th scope="col">Purpose</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Listening preferences</td>
                <td>Preferred volume, playback speed, favourite genre and last show, so returning listeners are not asked to set up again.</td>
                <td>12 months</td>
              </tr>
              <tr>
                <td>Interface state</td>
                <td>Whether you collapsed a schedule day, chose the text reading mode in the rate card viewer, or dismissed a prompt.</td>
                <td>6 months</td>
              </tr>
            </tbody>
          </table>
          <p>
            If you refuse functional storage, every visit starts fresh and the player resets to its
            defaults. Nothing else changes.
          </p>

          <h2 id="analytics">4. Analytics (opt-in)</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">What</th>
                <th scope="col">Purpose</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aggregate listening counts</td>
                <td>How many streams are open per show and hour, used to report audience numbers to advertisers and to our regulator.</td>
                <td>14 months</td>
              </tr>
              <tr>
                <td>Aggregate page statistics</td>
                <td>Which pages and stories are read, in aggregate, so we commission more of what matters.</td>
                <td>14 months</td>
              </tr>
            </tbody>
          </table>
          <p>
            Analytics identifiers are only set if you turn this category on. We do not use them to
            build a personal profile, and we never allow behavioural advertising on this site.
          </p>

          <h2 id="control">5. How to change your choices</h2>
          <ul>
            <li>
              Open the consent banner's <strong>Manage Preferences</strong> control — it reappears on
              your next visit, or you can clear <code>silas-cookie-consent</code> from your browser
              storage to bring it back immediately.
            </li>
            <li>
              You can also block or delete cookies and local storage in your browser settings. Blocking
              the necessary category will break the player and the forms.
            </li>
            <li>
              Withdrawing consent is as easy as giving it, and never affects what happened before you
              withdrew.
            </li>
          </ul>

          <h2 id="legal-basis">6. Legal basis</h2>
          <p>
            Under the Kenya Data Protection Act 2019 we ask for your consent before storing anything
            that is not strictly necessary, we tell you what each category does, and we let you choose
            category by category. Read more in the{' '}
            <Link href="/legal/privacy-policy">Privacy Policy</Link>, particularly the Listening Data
            and Analytics sections.
          </p>

          <h2 id="contact-cookies">7. Questions</h2>
          <p>
            Email {SITE.email} or call {SITE.phone}. Supervisory authority for data protection matters:{' '}
            {LEGAL.dataProtectionAuthority}.
          </p>
        </div>
      </div>
    </div>
  );
}
