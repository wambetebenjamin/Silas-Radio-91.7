import Link from 'next/link';
import { ArrowUpRight, Instagram, Youtube } from 'lucide-react';
import { SITE } from '@/lib/site';
import { Brand } from './site/Brand';
import { CookieSettingsButton } from './CookieConsent';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top"><p>Same city. <span>New discoveries.</span></p><Link href="/listen" className="text-link">Find your frequency <ArrowUpRight size={22} aria-hidden="true" /></Link></div>
        <div className="footer-grid">
          <div className="footer-brand"><Link href="/" aria-label="Silas Radio 91.7 home"><Brand light /></Link><p>Nairobi speaks. Silas Radio listens.<br />Your people. Your music. Your 91.7.</p><div className="social-links"><a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Silas Radio on Instagram"><Instagram size={19} aria-hidden="true" /></a><a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="Silas Radio on YouTube"><Youtube size={20} aria-hidden="true" /></a><a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="social-whatsapp">WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></a></div></div>
          <nav aria-label="Listen and discover"><h2>On your radio</h2><Link href="/shows">Our shows</Link><Link href="/schedule">Weekly schedule</Link><Link href="/podcasts">Podcasts & replays</Link><Link href="/presenters">Meet the presenters</Link><Link href="/request">Request a song</Link></nav>
          <nav aria-label="About the station"><h2>At the station</h2><Link href="/about">Our story</Link><Link href="/news">Community stories</Link><Link href="/studio">Inside the studio</Link><Link href="/contests">Contests & giveaways</Link><Link href="/advertise">Advertise with us</Link></nav>
          <div className="footer-contact"><h2>Keep in touch</h2><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a><p>Kimathi Street, Nairobi CBD<br />Nairobi, Kenya</p><Link href="/contact" className="text-link">Talk to the studio <ArrowUpRight size={14} aria-hidden="true" /></Link><Link href="/newsletter" className="text-link">Get the weekly playlist <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Silas Radio 91.7</p><nav aria-label="Legal"><Link href="/legal/privacy-policy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/cookie-policy">Cookies</Link><CookieSettingsButton /></nav><p>Design foundation: <a href="https://colorlib.com" target="_blank" rel="noopener noreferrer">DJoz by Colorlib</a></p></div>
      </div>
    </footer>
  );
}
