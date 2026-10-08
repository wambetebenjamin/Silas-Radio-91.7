import Link from 'next/link';
import {
  Calendar,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  Mic,
  Phone,
  Rss,
  Users,
  Youtube,
} from 'lucide-react';

import { SITE } from '@/lib/site';
import { NewsletterForm } from './NewsletterForm';
import { WhatsAppIcon } from './icons';

/**
 * 17. Footer
 * Shows, podcasts, news, advertise and legal links; social media
 * (Spotify, Apple Podcasts, YouTube, Instagram); newsletter signup; WhatsApp;
 * copyright. Base styling follows the source footer: #000 base, white circular
 * social buttons with the brand purple icon.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sr-footer" id="footer">
      <div className="sr-container">
        <div className="sr-footer__grid">
          {/* Station + address */}
          <div>
            <h3>{SITE.name}</h3>
            <p className="text-white/70 mb-5">
              Community radio for Nairobi, broadcasting on 91.7 FM and streaming to the diaspora
              24 hours a day.
            </p>
            <ul className="sr-footer__address">
              <li>
                <span className="sr-footer__icon" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <span>{SITE.studioAddress.full}</span>
              </li>
              <li>
                <span className="sr-footer__icon" aria-hidden="true">
                  <Phone size={18} />
                </span>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
              </li>
              <li>
                <span className="sr-footer__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </div>

          {/* Site links */}
          <nav aria-label="Footer">
            <h3>Listen and read</h3>
            <ul className="sr-footer__links">
              <li>
                <Link href="/#schedule" className="flex items-center gap-2">
                  <Calendar size={15} aria-hidden="true" /> Shows and schedule
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="flex items-center gap-2">
                  <Headphones size={15} aria-hidden="true" /> Podcasts
                </Link>
              </li>
              <li>
                <Link href="/news" className="flex items-center gap-2">
                  <Mic size={15} aria-hidden="true" /> News and community stories
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="flex items-center gap-2">
                  <Users size={15} aria-hidden="true" /> Advertise with us
                </Link>
              </li>
              <li>
                <Link href="/contests" className="flex items-center gap-2">
                  <Rss size={15} aria-hidden="true" /> Contests and giveaways
                </Link>
              </li>
            </ul>

            <h3 className="mt-6">Legal</h3>
            <ul className="sr-footer__links">
              <li>
                <Link href="/legal/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/legal/terms">Terms and Conditions</Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy">Cookie Policy</Link>
              </li>
            </ul>
          </nav>

          {/* Social */}
          <div>
            <h3>Follow the station</h3>
            <div className="sr-footer__social">
              <a href={SITE.social.spotify} aria-label="Silas Radio on Spotify" target="_blank" rel="noopener noreferrer">
                <Headphones size={20} aria-hidden="true" />
              </a>
              <a href={SITE.social.applePodcasts} aria-label="Silas Radio on Apple Podcasts" target="_blank" rel="noopener noreferrer">
                <Rss size={20} aria-hidden="true" />
              </a>
              <a href={SITE.social.youtube} aria-label="Silas Radio on YouTube" target="_blank" rel="noopener noreferrer">
                <Youtube size={20} aria-hidden="true" />
              </a>
              <a href={SITE.social.instagram} aria-label="Silas Radio on Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a href={SITE.whatsappLink} aria-label="WhatsApp the studio" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={20} />
              </a>
            </div>

            <h3 className="mt-6">Studio WhatsApp</h3>
            <p className="text-white/70 mb-3">{SITE.whatsappDisplay}</p>
            <a
              className="sr-btn sr-btn--white"
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={15} />
              Request a song or advertise
            </a>
          </div>

          {/* Newsletter */}
          <div>
            <h3>Weekly playlist</h3>
            <p className="text-white/70 mb-4">
              Weekly playlist and community news to your inbox.
            </p>
            <NewsletterForm variant="dark" />
          </div>
        </div>

        <div className="sr-footer__bottom">
          <p>
            © {year} {SITE.name}. All rights reserved. Broadcasting from {SITE.studioAddress.locality},{' '}
            {SITE.city}, Kenya. Regulated by the Communications Authority of Kenya; personal data
            handled under the Kenya Data Protection Act 2019.
          </p>
          <p className="mt-2">
            Design values reproduced from the station's design source. Photography from Pexels and
            Unsplash — see{' '}
            <a href="https://github.com/wambetebenjamin/Silas-Radio-91.7/blob/main/image-credits.md">
              image-credits.md
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
