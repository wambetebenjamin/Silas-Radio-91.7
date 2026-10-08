import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * PWA manifest.
 *
 * The service worker (public/sw.js) caches the app shell and the last audio
 * segment so the player has an offline fallback: if the stream drops, the
 * player shows the last cached audio plus a clear "reconnecting" state rather
 * than a silent error.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Nairobi Speaks`,
    short_name: SITE.shortName,
    description:
      'Live community radio from Nairobi: East African music, community stories, local news and podcasts, 24 hours a day.',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0018',
    theme_color: '#290849',
    lang: 'en-KE',
    dir: 'ltr',
    categories: ['music', 'news', 'entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      {
        name: 'Listen live',
        short_name: 'Live',
        description: 'Start the 91.7 FM live stream',
        url: '/?listen=live',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Song request',
        short_name: 'Request',
        description: 'Send a song request or dedication to the studio',
        url: '/#request',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Schedule',
        short_name: 'Shows',
        description: 'Today’s shows on Silas Radio 91.7',
        url: '/#schedule',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
