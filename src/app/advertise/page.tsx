import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, Calendar, Music, Users } from 'lucide-react';

import { PACKAGES, SCHEDULE, SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';
import { Advertising } from '@/components/Advertising';
import { ContactSection } from '@/components/ContactSection';
import { WhatsAppIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Advertise on Silas Radio 91.7',
  description:
    'Reach Nairobi commuters, youth aged 18–35 and the East African diaspora. Four sponsorship packages from KES 18,500: 30-second spot, presenter live read, show naming rights and a digital plus on-air bundle.',
  alternates: { canonical: '/advertise' },
  openGraph: {
    title: 'Advertise on Silas Radio 91.7',
    description: 'Rate card, media kit and four sponsorship packages for Nairobi advertisers.',
    type: 'website',
    url: `${SITE.url}/advertise`,
  },
};

export default function AdvertisePage() {
  return (
    <div style={{ background: '#f5f5f5' }}>
      <section className="spad" style={{ background: '#290849' }}>
        <div className="sr-container">
          <p className="sr-eyebrow !text-[#c9a6ff]">Advertising and sponsorship</p>
          <h1 className="font-heading text-[clamp(30px,5.4vw,52px)] font-bold text-white max-w-[26ch]">
            Advertise where Nairobi is already listening
          </h1>
          <p className="text-white/80 max-w-[62ch] mt-4">
            118,000 weekly listeners, 41,000 monthly site visits and 9,400 newsletter subscribers.
            Community radio pricing, studio-produced spots, and reporting you can show a finance
            team.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link className="sr-btn sr-btn--white" href="#enquiry">
              Request a Proposal
            </Link>
            <a className="sr-btn sr-btn--ghost-light" href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={16} /> WhatsApp the sales desk
            </a>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-10">
            {[
              { icon: Users, label: 'Weekly listeners', value: '118,000' },
              { icon: BarChart3, label: 'Primetime share', value: '41%' },
              { icon: Calendar, label: 'Show blocks daily', value: `${SCHEDULE.length}` },
              { icon: Music, label: 'Podcast downloads / month', value: '16,900' },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="rounded-[10px] border border-white/15 p-4">
                <Icon size={18} aria-hidden="true" className="text-[#c9a6ff]" />
                <p className="font-heading text-[28px] font-bold text-white mt-2 mb-0">{value}</p>
                <p className="sr-meta !text-white/70 mb-0">{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EFFECT-30 catalogue + the four on-page packages */}
      <Advertising withEnquiryForm />

      <section className="pb-16" style={{ background: '#f5f5f5' }}>
        <div className="sr-container">
          <SectionHead eyebrow="How it works" ghost="PROCESS" title="From brief to first spot" />
          <ol className="grid gap-5 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Send the brief',
                body: 'The form below or WhatsApp. Tell us the goal, the audience and the budget.',
              },
              {
                step: '02',
                title: 'Proposal in a day',
                body: 'We map the goal to packages and airtime, with a schedule you can approve.',
              },
              {
                step: '03',
                title: 'Studio production',
                body: 'Script, voice-over and music bed produced in-house — one working day.',
              },
              {
                step: '04',
                title: 'Reported weekly',
                body: 'Play confirmations plus digital performance in one weekly dashboard.',
              },
            ].map((item) => (
              <li key={item.step}>
                <div className="sr-card p-5 h-full">
                  <p className="font-display text-[34px] leading-none text-[#f2f2f2]">{item.step}</p>
                  <h3 className="sr-card__title mt-2">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="sr-meta mt-6">
            Starting prices per package: {PACKAGES.map((pkg) => `${pkg.name} KES ${pkg.priceKES}`).join(' · ')}.
            All prices exclude VAT and are valid for 90 days.
          </p>
        </div>
      </section>

      {/* Advertising enquiry form (reCAPTCHA v3 protected) */}
      <ContactSection showAdvertisingForm />
    </div>
  );
}
