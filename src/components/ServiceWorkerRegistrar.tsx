'use client';

import { useEffect } from 'react';
import { SITE } from '@/lib/site';

/**
 * Registers the offline worker on the canonical site only.
 *
 * Preview, staging and proxy hosts must never install a service worker: a cached
 * shell from an earlier build there would keep serving an outdated page after a
 * redeploy. Any worker already installed on such a host is removed instead.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const host = window.location.hostname;
    const canonical = new URL(SITE.url).hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const manage = async () => {
      try {
        if (host === canonical || (isLocal && process.env.NODE_ENV !== 'production')) {
          await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          return;
        }
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      } catch {
        /* Registration is best-effort: never block the page on it. */
      }
    };
    if (document.readyState === 'complete') void manage();
    else window.addEventListener('load', () => void manage(), { once: true });
    return () => window.removeEventListener('load', manage);
  }, []);
  return null;
}
