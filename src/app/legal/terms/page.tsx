import type { Metadata } from 'next';
import Link from 'next/link';

import { LEGAL, PACKAGES, SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Silas Radio 91.7 terms: contest terms, advertising terms, listener terms, content ownership and governing law (Kenya).',
  alternates: { canonical: '/legal/terms' },
};

const SECTIONS = [
  { id: 'contest-terms', label: 'Contest Terms' },
  { id: 'advertising-terms', label: 'Advertising Terms' },
  { id: 'listener-terms', label: 'Listener Terms' },
  { id: 'content-ownership', label: 'Content Ownership' },
  { id: 'governing-law', label: 'Governing Law' },
];

export default function TermsPage() {
  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container">
        <SectionHead as="h1" eyebrow="Legal" ghost="TERMS" title="Terms and Conditions" />
        <p className="sr-updated">
          Last updated {new Date(LEGAL.termsUpdated).toLocaleDateString('en-KE', { dateStyle: 'long' })} · Applies to{' '}
          {SITE.url}, the {SITE.frequency} broadcast and every Silas Radio 91.7 podcast feed.
        </p>

        <nav className="sr-toc my-6" aria-label="Sections of these terms">
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
          <h2 id="acceptance">1. Acceptance</h2>
          <p>
            By listening to {SITE.name}, using this website, entering a contest or booking airtime you
            agree to these terms. If you do not agree, please do not use the services. Where these
            terms conflict with the Kenya Data Protection Act 2019 or the Communications Act, the
            statute prevails.
          </p>

          <h2 id="contest-terms">2. Contest Terms</h2>
          <ul>
            <li>
              <strong>Eligibility.</strong> Entrants must be 18 or older and resident in Kenya, unless
              a specific contest states otherwise on air. Employees of {SITE.name}, their immediate
              families and anyone professionally connected with the contest may not enter.
            </li>
            <li>
              <strong>Entries.</strong> One entry per phone number per contest. Entries must be
              submitted through the form on this site or the stated WhatsApp line. Entries that are
              automated, duplicated, incomplete or submitted after the closing time are void.
            </li>
            <li>
              <strong>Answers and draws.</strong> Where a contest requires an answer, only correct
              answers enter the draw. Winners are drawn using a documented random method and announced
              live on air during the show named on the contest page.
            </li>
            <li>
              <strong>Notification.</strong> We contact winners using the phone number or email address
              supplied. If a winner cannot be reached within 14 days, or declines the prize, we redraw.
            </li>
            <li>
              <strong>Prizes.</strong> Prizes are as described, are not transferable and cannot be
              exchanged for cash. Where a prize is provided by a sponsor, that sponsor may be named on
              air and on this site. Any tax or statutory charge on a prize is the winner's
              responsibility.
            </li>
            <li>
              <strong>Publicity.</strong> By entering you agree that we may use your first name, town
              and, with your separate consent at the time, a photograph or recording on air and on our
              channels. You can decline publicity and still receive the prize.
            </li>
            <li>
              <strong>Changes.</strong> If a contest cannot run as planned we may suspend, modify or
              cancel it, and will say so on air. Our decision on any contest matter is final, but you
              can complain to us using the contact details below.
            </li>
          </ul>

          <h2 id="advertising-terms">3. Advertising Terms</h2>
          <ul>
            <li>
              <strong>Booking.</strong> Advertising is booked by written insertion order or accepted
              proposal. Air time is allocated on a first-come basis and confirmed only on our written
              acceptance.
            </li>
            <li>
              <strong>Prices.</strong> Rates are quoted in Kenyan Shillings, exclude VAT, and are valid
              for 90 days from the date of the proposal. Rates currently start at KES{' '}
              {PACKAGES[0]?.priceKES} per week for a 30-second spot package.
            </li>
            <li>
              <strong>Production.</strong> Where production is included, the advertiser has two
              working days to approve or request changes to scripts and recordings. Additional
              revisions beyond two rounds are charged at our studio hourly rate.
            </li>
            <li>
              <strong>Content standards.</strong> We refuse advertising that is unlawful, misleading,
              discriminatory, or that conflicts with our community licence conditions or the Kenya
              Information and Communications Act. Political advertising is accepted only inside the
              regulated window set by the Independent Electoral and Boundaries Commission.
            </li>
            <li>
              <strong>Compliance.</strong> The advertiser is responsible for the accuracy of claims,
              for holding any required regulatory approvals (for example by the Pharmacy and Poisons
              Board or the Betting Control and Licensing Board) and for indemnifying us against claims
              arising from the advertising content.
            </li>
            <li>
              <strong>Scheduling.</strong> We aim to run every booked spot as scheduled. If a programme
              is cancelled or interrupted — including by transmission failure or events beyond our
              control — the spot is re-run or the equivalent airtime is credited.
            </li>
            <li>
              <strong>Payment.</strong> Invoices are payable within 30 days of the invoice date.
              Campaigns are paused on overdue accounts, and overdue amounts attract interest at 2% per
              month.
            </li>
            <li>
              <strong>Reporting.</strong> Play confirmations are provided weekly, together with digital
              performance where the package includes online inventory.
            </li>
          </ul>

          <h2 id="listener-terms">4. Listener Terms</h2>
          <ul>
            <li>
              <strong>Use of the stream.</strong> The live stream and podcasts are for personal,
              non-commercial listening. Re-broadcasting, re-streaming, recording for onward
              distribution, or using our signal as background in a commercial premises requires
              written permission.
            </li>
            <li>
              <strong>Requests and dedications.</strong> You are responsible for what you send. Do not
              submit content that is unlawful, defamatory, hateful, harassing, sexually explicit or
              that discloses another person's private information without consent. We may edit, refuse
              to read or delete any request.
            </li>
            <li>
              <strong>Song requests.</strong> Music is selected by the presenter and subject to licence
              and rights availability. A request is not a guarantee of play.
            </li>
            <li>
              <strong>Accounts.</strong> Where listener accounts are available you must keep your
              credentials secure and must not impersonate another person or share access.
            </li>
            <li>
              <strong>Availability.</strong> We broadcast 24 hours a day but do not guarantee
              uninterrupted service. Scheduled maintenance, transmission faults and internet
              conditions may interrupt the stream.
            </li>
            <li>
              <strong>Community conduct.</strong> Repeated abuse of the request line, our WhatsApp
              channel or our staff can result in your number being blocked from the request line.
            </li>
          </ul>

          <h2 id="content-ownership">5. Content Ownership</h2>
          <ul>
            <li>
              <strong>Our content.</strong> The {SITE.name} name, station identity, schedules, website
              copy, show pages, presenter photography and all programme recordings are owned by us or
              licensed to us. All rights are reserved.
            </li>
            <li>
              <strong>Music and third-party work.</strong> Music broadcast and streamed is licensed
              through the relevant collective management organisations in Kenya. Nothing in these terms
              grants you rights in that music.
            </li>
            <li>
              <strong>Your submissions.</strong> When you send a request, dedication, contest answer,
              news tip or photo you keep ownership of it, and you grant us a non-exclusive,
              royalty-free licence to use, edit and broadcast it in connection with the station —
              including in podcast episodes and on our website and social channels.
            </li>
            <li>
              <strong>Advertising creative.</strong> Produced spots and read scripts created by our
              studio remain licensed to the commissioning advertiser for the campaign period, and we
              retain the right to keep archival copies for compliance and audit.
            </li>
            <li>
              <strong>Website content.</strong> You may quote up to 200 words of a news article with a
              clear credit and link to {SITE.url}. Republishing full articles requires permission.
            </li>
            <li>
              <strong>Infringement.</strong> If you believe your rights have been infringed by
              something we have published, email {SITE.email} with the details and we will act promptly.
            </li>
          </ul>

          <h2 id="governing-law">6. Governing Law</h2>
          <p>
            These terms are governed by the laws of {LEGAL.governingLaw}. The courts of Kenya have
            exclusive jurisdiction over any dispute arising from them, save that we may seek urgent
            relief in any competent jurisdiction to protect our intellectual property.
          </p>
          <p>
            Before starting formal proceedings, both parties agree to attempt resolution in good faith
            by notice in writing to {SITE.email}, with 30 days to reach agreement. Nothing in this
            clause prevents you from complaining to the {LEGAL.dataProtectionAuthority} on a data
            protection matter, or to the Communications Authority of Kenya on a broadcasting matter.
          </p>

          <h2 id="changes-terms">7. Changes and contact</h2>
          <p>
            We may update these terms; the version on this page is the current one and the "last
            updated" date will reflect the change. Questions: {SITE.email} or {SITE.phone}. See also
            the <Link href="/legal/privacy-policy">Privacy Policy</Link> and{' '}
            <Link href="/legal/cookie-policy">Cookie Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
