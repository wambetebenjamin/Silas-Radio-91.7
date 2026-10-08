import type { Metadata } from 'next';
import Link from 'next/link';
import { Ticket } from 'lucide-react';

import { SITE } from '@/lib/site';
import { ACTIVE_CONTEST, Contest } from '@/components/Contest';
import { SectionHead } from '@/components/SectionHead';

export const metadata: Metadata = {
  title: 'Contests and giveaways',
  description:
    'Win vinyl, studio visits, festival tickets and airtime with Silas Radio 91.7 contests. Enter online — winners are drawn live on air.',
  alternates: { canonical: '/contests' },
  openGraph: {
    title: 'Contests and giveaways | Silas Radio 91.7',
    description: 'Enter the current Nairobi contest and hear the draw live on 91.7 FM.',
    type: 'website',
    url: `${SITE.url}/contests`,
  },
};

export default function ContestsPage() {
  return (
    <div style={{ background: '#fff' }}>
      <section className="spad pb-0">
        <div className="sr-container">
          <SectionHead as="h1" eyebrow="Giveaways" ghost="CONTESTS" title="Contests and giveaways" />
          <p className="sr-lead">
            Every contest is run on air and online. Entries are verified with reCAPTCHA v3, one entry
            per phone number, and the winner is always announced live before we call them.
          </p>
        </div>
      </section>

      {/* Active contest card with countdown + entry form */}
      <Contest />

      <section className="pb-16 sr-container">
        <SectionHead eyebrow="Closed" ghost="PAST" title="Recently closed contests" />
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Sheng Express mixtape drop', winner: 'Announced 12 September 2025', prize: 'Custom mixtape + studio shout-out' },
            { title: 'Nairobi Nights listening pack', winner: 'Announced 3 August 2025', prize: 'Headphones + vinyl bundle' },
            { title: 'Diaspora Window airtime', winner: 'Announced 20 July 2025', prize: 'One year of 91.7 merchandise' },
          ].map((item) => (
            <li key={item.title}>
              <article className="sr-card p-5 h-full">
                <span className="sr-badge w-fit">
                  <Ticket size={12} aria-hidden="true" /> Closed
                </span>
                <h3 className="sr-card__title mt-2">{item.title}</h3>
                <p className="mb-1">{item.prize}</p>
                <p className="sr-meta mb-0">{item.winner}</p>
              </article>
            </li>
          ))}
        </ul>

        <p className="sr-meta mt-6">
          Contest rules and eligibility: <Link className="underline" href="/legal/terms#contest-terms">contest terms</Link>.
          Current contest closes {new Date(ACTIVE_CONTEST.deadline).toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi', dateStyle: 'long' })}.
        </p>
      </section>
    </div>
  );
}
