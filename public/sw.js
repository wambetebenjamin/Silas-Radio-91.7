/* Multi-page shell caching. Audio, APIs and Next.js RSC payloads are network-only. */
const VERSION = 'silas-v3';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(ASSETS).then((cache) => cache.addAll([
    '/manifest.webmanifest', '/icons/icon-192.png', '/fonts/Now-Regular.woff',
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  // Drop every cache that does not belong to this version, including workers left
  // behind by earlier builds.
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

async function remember(cacheName, request, response, limit) {
  if (!response.ok || response.status === 206) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || request.headers.has('RSC') || url.searchParams.has('_rsc')) return;
  // Never cache unbounded streams, range responses, or turn silence into success.
  if (request.destination === 'audio' || /\.(mp3|m4a|aac|ogg|opus)$/i.test(url.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      event.waitUntil(remember(SHELL, request, response.clone(), 20));
      return response;
    }).catch(async () => (await caches.match(request)) || offlineDocument()));
    return;
  }
  if (['image', 'font', 'style', 'script'].includes(request.destination) && !url.pathname.startsWith('/_next/webpack')) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      event.waitUntil(remember(ASSETS, request, response.clone(), 100));
      return response;
    })));
  }
});

function offlineDocument() {
  return new Response(`<!doctype html><html lang="en-KE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline | Silas Radio 91.7</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#19151f;color:white;font-family:system-ui;text-align:center;padding:25px;box-sizing:border-box}main{max-width:480px}p{line-height:1.8;color:#c8b7d6}a{display:inline-block;background:#dcf77a;color:#19151f;padding:14px 22px;text-decoration:none;margin:15px}</style></head><body><main><p>SILAS RADIO 91.7</p><h1>A little off the network.</h1><p>This page isn’t saved for offline use. Reconnect to browse or stream audio. Previously visited pages may still be available.</p><a href="/">Try the station again</a></main></body></html>`, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
