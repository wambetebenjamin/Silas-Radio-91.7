/* Silas Radio 91.7 — service worker
 *
 * Purpose: offline player fallback + app shell caching.
 *
 * Strategy
 *   - App shell (HTML documents): network-first, falling back to cache, then to
 *     an offline document that still renders the station identity and explains
 *     that the stream will resume.
 *   - Static assets (fonts, images, scripts, styles): stale-while-revalidate.
 *   - Audio: range-aware passthrough. The most recent audio response is kept in
 *     a small media cache (max 3 entries) so the player can fall back to the
 *     last segment when the live stream drops.
 *   - API calls: never cached (they are realtime and authenticated by origin).
 */

const VERSION = 'silas-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const MEDIA_CACHE = `${VERSION}-media`;
const MAX_MEDIA_ENTRIES = 3;

const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/fonts/Now-Regular.woff',
  '/fonts/Now-Medium.woff',
  '/fonts/Rockville Solid.woff',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL_ASSETS.map((asset) =>
          cache.add(new Request(asset, { cache: 'reload' })).catch(() => undefined),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // realtime: never cached

  // Audio → range-aware passthrough with a small offline media cache
  if (request.destination === 'audio' || /\.(mp3|m4a|aac|ogg|opus)(\?|$)/i.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(MEDIA_CACHE).then((cache) => {
            cache.put(request, copy).then(() => trimCache(MEDIA_CACHE, MAX_MEDIA_ENTRIES));
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // No cached audio: answer with a short silent WAV so the player keeps
          // its state instead of throwing, and the UI shows "reconnecting".
          const silent = new Uint8Array(44);
          return new Response(silent, {
            status: 200,
            headers: { 'Content-Type': 'audio/wav', 'X-Silas-Offline': '1' },
          });
        }),
    );
    return;
  }

  // Documents → network first, cache fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/')) || offlineDocument()),
    );
    return;
  }

  // Everything else → stale-while-revalidate
  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

function offlineDocument() {
  const html = `<!doctype html><html lang="en-KE"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Silas Radio 91.7 — offline</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#290849;color:#fff;
font-family:system-ui,sans-serif;text-align:center;padding:32px 20px}
h1{font-size:26px;margin:12px 0}p{max-width:44ch;opacity:.85;margin:0 auto 18px}
a{display:inline-block;background:#fff;color:#5c00ce;padding:14px 22px;border-radius:4px;
font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none}
</style></head><body><main>
<p style="letter-spacing:3px;font-size:12px;opacity:.7">SILAS RADIO 91.7</p>
<h1>You are offline — the station is still on air.</h1>
<p>Reconnect to resume the live stream. If you were listening to a podcast episode, the last
cached segment is still available in the player.</p>
<a href="/">Try again</a>
</main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
