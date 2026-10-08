import type { Metadata } from 'next';

import { SITE } from '@/lib/site';
import { SectionHead } from '@/components/SectionHead';
import { ContactSection } from '@/components/ContactSection';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact the station',
  description:
    'Contact Silas Radio 91.7: studio address on Kimathi Street Nairobi, phone, WhatsApp, advertising enquiries and the newsroom desk.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Silas Radio 91.7',
    description: 'Studio address, phone, WhatsApp and the contact form for the Nairobi studio.',
    type: 'website',
    url: `${SITE.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div style={{ background: '#fff' }}>
      <section className="spad pb-0">
        <div className="sr-container">
          <SectionHead as="h1" eyebrow="Studio desk" ghost="CONTACT" title="Get in touch" />
          <p className="sr-lead">
            Song requests, news tips, music submissions, partnerships or complaints — everything
            reaches a human at the studio. For advertising, use the enquiry form and the sales desk
            replies within one working day.
          </p>
        </div>
      </section>

      <section className="spad">
        <div className="sr-container">
          <ContactForm />
        </div>
      </section>

      {/* Address, map, phone, WhatsApp and the advertising enquiry form */}
      <ContactSection />
    </div>
  );
}
