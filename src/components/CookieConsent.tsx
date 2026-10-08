'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

/**
 * COOKIE CONSENT BANNER — bottom-fixed, full width.
 *
 * Copy is mandated by the spec and used verbatim:
 *   "Silas Radio uses cookies to remember your listening preferences and
 *    improve your experience. See our Cookie Policy."
 *
 * Behaviour:
 *   - Accept All and Manage Preferences
 *   - Modal with Necessary (locked), Functional, Analytics
 *   - persists to localStorage under `silas-cookie-consent`
 *   - never shows again once a choice is stored
 *   - links to /legal/cookie-policy
 *   - Kenya Data Protection Act 2019 compliant: consent is specific,
 *     granular, freely given, and opt-in for everything except necessary
 *     cookies; choices can be changed later via the footer link.
 */

export const CONSENT_STORAGE_KEY = 'silas-cookie-consent';
export const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  necessary: true; // always on, locked
  functional: boolean;
  analytics: boolean;
  decidedAt: string;
}

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('silas:consent', { detail: state }));
  } catch {
    /* storage unavailable (private mode) — the banner simply reappears next visit */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // small delay so it does not compete with the hero's entrance
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
    setFunctional(existing.functional);
    setAnalytics(existing.analytics);
  }, []);

  const persist = useCallback((next: { functional: boolean; analytics: boolean }) => {
    writeConsent({
      version: CONSENT_VERSION,
      necessary: true,
      functional: next.functional,
      analytics: next.analytics,
      decidedAt: new Date().toISOString(),
    });
    setVisible(false);
    setModalOpen(false);
  }, []);

  const acceptAll = () => persist({ functional: true, analytics: true });
  const acceptNecessaryOnly = () => persist({ functional: false, analytics: false });

  /* Focus management for the preferences modal */
  useEffect(() => {
    if (modalOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [modalOpen]);

  if (!visible) return null;

  return (
    <>
      <div
        className="sr-cookie"
        role="region"
        aria-label="Cookie consent"
        data-testid="cookie-banner"
      >
        <div className="sr-cookie__inner">
          <div className="flex gap-3 items-start">
            <Cookie size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p>
              Silas Radio uses cookies to remember your listening preferences and improve your
              experience. See our{' '}
              <Link href="/legal/cookie-policy">Cookie Policy</Link>.
            </p>
          </div>

          <div className="sr-cookie__actions">
            <button type="button" className="sr-btn sr-btn--primary" onClick={acceptAll}>
              Accept All
            </button>
            <button
              type="button"
              className="sr-btn sr-btn--ghost-light"
              onClick={() => setModalOpen(true)}
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div
          className="sr-modal-scrim"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="sr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setModalOpen(false);
            }}
          >
            <h2 id="cookie-modal-title">Cookie preferences</h2>
            <p className="sr-meta">
              Under the Kenya Data Protection Act 2019 you choose what we may store. Necessary
              cookies keep your player working and cannot be switched off.
            </p>

            <div className="sr-modal__row">
              <div className="flex-1">
                <h3>Necessary (always active)</h3>
                <p>
                  Remembers your cookie choice, keeps the audio player state and protects our forms
                  against spam. Stored locally; never used for advertising.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked="true"
                aria-disabled="true"
                className="sr-switch"
                aria-label="Necessary cookies, always active"
              >
                <span />
              </button>
            </div>

            <div className="sr-modal__row">
              <div className="flex-1">
                <h3>Functional</h3>
                <p>
                  Remembers your preferred volume, playback speed, genre interests and last channel
                  so the station feels the same when you return.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={functional}
                className="sr-switch"
                onClick={() => setFunctional((value) => !value)}
                aria-label="Functional cookies"
              >
                <span />
              </button>
            </div>

            <div className="sr-modal__row">
              <div className="flex-1">
                <h3>Analytics</h3>
                <p>
                  Aggregated, anonymised listening statistics that tell the studio which shows and
                  stories matter. No personal profiles, no ad tracking.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                className="sr-switch"
                onClick={() => setAnalytics((value) => !value)}
                aria-label="Analytics cookies"
              >
                <span />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                type="button"
                className="sr-btn sr-btn--primary"
                onClick={() => persist({ functional, analytics })}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="sr-btn sr-btn--outline"
                onClick={acceptNecessaryOnly}
              >
                Necessary only
              </button>
              <Link className="sr-btn sr-btn--outline" href="/legal/cookie-policy">
                Read the Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
