'use client';

import { RecaptchaProvider } from '@/components/RecaptchaProvider';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

/**
 * Client providers.
 * reCAPTCHA is mounted once at the root: the site has six protected forms and
 * the script must load once, not per form.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecaptchaProvider>
      {children}
      {/* Offline player fallback + PWA install surface */}
      <ServiceWorkerRegistrar />
    </RecaptchaProvider>
  );
}
