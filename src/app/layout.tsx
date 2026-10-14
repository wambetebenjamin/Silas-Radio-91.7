import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@fontsource/rajdhani/latin-400.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';

import { SITE } from '@/lib/site';
import { Providers } from './providers';
import { NavBar } from '@/components/NavBar';
import { SiteFooter } from '@/components/SiteFooter';
import { Player } from '@/components/Player';
import { CookieConsent } from '@/components/CookieConsent';
import { StationJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Your city. Your sound.`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Silas Radio 91.7 is a Nairobi community radio station streaming live 24 hours: East African music, community stories, podcasts and local news for commuters, youth and the diaspora.',
  applicationName: SITE.name,
  keywords: [
    'Silas Radio',
    '91.7 FM',
    'Nairobi radio',
    'Kenyan radio online',
    'community radio Kenya',
    'East African music',
    'Nairobi podcasts',
    'live radio stream',
    'advertising Nairobi radio',
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'radio',
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Live from Nairobi, 91.7 FM and online`,
    description: SITE.subtext,
    images: [
      {
        url: '/images/culture/nairobi-skyline.jpg',
        width: 1200,
        height: 630,
        alt: 'Nairobi skyline at sunset, home of Silas Radio 91.7.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Live from Nairobi`,
    description: SITE.subtext,
    images: ['/images/culture/nairobi-skyline.jpg'],
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: '#19151f',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to main content
          </a>

          <StationJsonLd />

          <NavBar />

          <main id="main" tabIndex={-1}>
            {children}
          </main>

          <SiteFooter />

          <Player />

          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
