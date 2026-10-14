import { PageHero } from '@/components/site/PageHero';
import { ContactDetails } from '@/components/site/ContactDetails';
import { StationForm } from '@/components/site/StationForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Contact the station', 'Get in touch with the Silas Radio 91.7 studio in Nairobi. Send a story tip, music submission, partnership idea or feedback.', '/contact');
export default function ContactPage() {
  return <><PageHero eyebrow="Nairobi speaks. We listen." title="Let’s talk." description="Good radio starts with a conversation. Whether it’s a tip, a track, a big idea or a little feedback, there’s a place for it here." breadcrumb="Contact" /><section className="section"><div className="container contact-layout"><ContactDetails /><StationForm mode="contact" /></div></section></>;
}
