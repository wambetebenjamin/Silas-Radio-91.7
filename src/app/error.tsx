'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Radio } from 'lucide-react';

import { SITE } from '@/lib/site';
import { WhatsAppIcon } from '@/components/icons';

/**
 * 500 PAGE
 *
 * Copy: "We are off-air temporarily. Back soon."
 * A Try Again button resets the route, and the studio WhatsApp number is
 * always visible so a listener can still reach the station while the site is
 * down. Kept free of heavy effects — this page must render even when the app
 * is failing.
 */
export default function ServerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to the console for the platform's log drain; no user data here.
    console.error('[silas:500]', error.message, error.digest);
  }, [error]);

  return (
    <div className="sr-error-page sr-error-page--500">
      <div className="sr-container grid justify-items-center gap-6">
        <p className="sr-error-page__code" aria-hidden="true">
          500
        </p>

        <h1>We are off-air temporarily. Back soon.</h1>

        <p className="max-w-[52ch]">
          Our site hit a fault while preparing this page. The transmitter is unaffected — you can keep
          listening on 91.7 FM, and the studio is reachable on WhatsApp right now.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button type="button" className="sr-btn sr-btn--white" onClick={reset}>
            <RefreshCw size={17} aria-hidden="true" />
            Try Again
          </button>
          <Link className="sr-btn sr-btn--ghost-light" href="/">
            <Radio size={17} aria-hidden="true" />
            Back to the home page
          </Link>
        </div>

        {/* WhatsApp number always visible on the 500 page */}
        <div className="rounded-[10px] border border-white/20 px-5 py-4 text-center">
          <p className="sr-meta !text-white/70 mb-1">Studio WhatsApp, always open</p>
          <p className="font-heading text-[24px] font-bold text-white mb-2">{SITE.whatsappDisplay}</p>
          <a className="sr-btn sr-btn--primary" href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={16} />
            Message the studio
          </a>
        </div>

        {error.digest ? (
          <p className="sr-meta">Reference for our engineers: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
