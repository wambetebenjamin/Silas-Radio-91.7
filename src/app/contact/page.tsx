import { PageHero } from '@/components/site/PageHero';
import { ContactDetails } from '@/components/site/ContactDetails';
import { StationForm } from '@/components/site/StationForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Contact the station', 'Get in touch with the Silas Radio 91.7 studio in Nairobi. Send a story tip, music submission, partnership idea or feedback.', '/contact');
export default function ContactPage() {
  return <><PageHero eyebrow="Get in touch" title="Contact the studio" description="Story tips, music submissions, feedback and partnership enquiries all come to the same place." breadcrumb="Contact" /><section className="section"><div className="container contact-layout"><ContactDetails /><StationForm mode="contact" /></div></section></>;
}
