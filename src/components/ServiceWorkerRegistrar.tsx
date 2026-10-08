'use client';

import { useEffect, useState } from 'react';

/**
 * Registers the service worker that powers the offline player fallback and the
 * PWA install prompt. Registration is deferred until after load so it never
 * competes with the hero (EFFECT-23) for main-thread time.
 */
export function ServiceWorkerRegistrar() {
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(() => setOfflineReady(true))
        .catch(() => undefined);
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  // Announce readiness for assistive tech without adding visual noise.
  return offlineReady ? (
    <span className="sr-only" role="status">
      Offline playback prepared.
    </span>
  ) : null;
}
