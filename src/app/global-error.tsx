'use client';

import { SITE } from '@/lib/site';

/**
 * Last-resort boundary for faults in the root layout itself.
 * Inline styles only — no design-system CSS is guaranteed at this point.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-KE">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#290849',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '32px 20px',
        }}
      >
        <main>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7 }}>
            {SITE.name}
          </p>
          <h1 style={{ fontSize: 32, margin: '12px 0' }}>We are off-air temporarily. Back soon.</h1>
          <p style={{ maxWidth: 520, margin: '0 auto 24px', opacity: 0.85 }}>
            Something failed before the page could load. The station is still on air — try again, or
            reach the studio on WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#ffffff',
                color: '#5c00ce',
                border: 'none',
                borderRadius: 4,
                padding: '14px 22px',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 2,
                cursor: 'pointer',
                minHeight: 48,
              }}
            >
              Try Again
            </button>
            <a
              href={SITE.whatsappLink}
              style={{
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 4,
                padding: '14px 22px',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: '#ffffff',
                textDecoration: 'none',
                minHeight: 48,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>
          {error.digest ? (
            <p style={{ opacity: 0.6, fontSize: 11, marginTop: 18 }}>Reference: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
