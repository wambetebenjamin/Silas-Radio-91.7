'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RECAPTCHA_SCORE_THRESHOLD, RECAPTCHA_SITE_KEY, recaptchaEnabled } from '@/lib/recaptcha';
import type { RecaptchaAction } from '@/lib/recaptcha';

/**
 * reCAPTCHA v3 provider with v2 fallback.
 *
 * - Loads the v3 script once, lazily, only on pages that render a form.
 * - `execute(action)` returns a token for the server to verify.
 * - If the server reports score < 0.5 (`requiresV2Fallback`), the provider
 *   renders the v2 checkbox challenge and the form resubmits with `v2Token`.
 * - No secret key is ever referenced in client code.
 */

interface RecaptchaContextValue {
  enabled: boolean;
  ready: boolean;
  /** v2 challenge required after a low v3 score. */
  v2Required: boolean;
  v2Token: string | null;
  /** Execute v3 for an action; returns null when unconfigured (dev). */
  execute: (action: RecaptchaAction) => Promise<string | null>;
  /** Called by API helpers when a response sets requiresV2Fallback. */
  requireV2: (required: boolean) => void;
  setV2Token: (token: string | null) => void;
  reset: () => void;
}

const RecaptchaContext = createContext<RecaptchaContextValue | null>(null);

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render?: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset?: (id?: number) => void;
    };
    __silasRecaptchaV2Ready?: () => void;
  }
}

const V3_SRC = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [v2Required, setV2Required] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);

  useEffect(() => {
    if (!recaptchaEnabled || typeof window === 'undefined') return;
    if (document.querySelector('script[data-silas-recaptcha]')) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = V3_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.silasRecaptcha = 'true';
    script.onload = () => {
      window.grecaptcha?.ready(() => setReady(true));
    };
    document.head.appendChild(script);
  }, []);

  /**
   * Render the v2 checkbox challenge the first time a low score is seen.
   * The v2 script is only fetched when actually required.
   */
  useEffect(() => {
    if (!v2Required || !recaptchaEnabled || typeof window === 'undefined') return;
    const container = document.getElementById('silas-recaptcha-v2');
    if (!container || container.dataset.rendered === 'true') return;

    const siteKey = RECAPTCHA_SITE_KEY;
    const render = () => {
      window.grecaptcha?.render?.(container, {
        sitekey: siteKey,
        callback: (token: string) => setV2Token(token),
        'expired-callback': () => setV2Token(null),
        theme: 'dark',
      });
      container.dataset.rendered = 'true';
    };

    window.__silasRecaptchaV2Ready = render;

    if (window.grecaptcha?.render) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=__silasRecaptchaV2Ready&render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.silasRecaptchaV2 = 'true';
      document.head.appendChild(script);
    }
  }, [v2Required]);

  const execute = useCallback(
    async (action: RecaptchaAction): Promise<string | null> => {
      if (!recaptchaEnabled || !window.grecaptcha?.execute) return null;
      try {
        return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      } catch {
        return null;
      }
    },
    [],
  );

  const value = useMemo<RecaptchaContextValue>(
    () => ({
      enabled: recaptchaEnabled,
      ready,
      v2Required,
      v2Token,
      execute,
      requireV2: setV2Required,
      setV2Token,
      reset: () => {
        setV2Required(false);
        setV2Token(null);
      },
    }),
    [ready, v2Required, v2Token, execute],
  );

  return (
    <RecaptchaContext.Provider value={value}>
      {children}
      {/* v2 fallback mount point — only populated when required */}
      {v2Required ? (
        <div className="sr-v2-challenge" role="group" aria-label="Verification challenge">
          <p className="sr-meta">
            One quick check before we send this — it keeps automated spam out of the
            request line. Score threshold is {RECAPTCHA_SCORE_THRESHOLD}.
          </p>
          <div id="silas-recaptcha-v2" />
        </div>
      ) : null}
    </RecaptchaContext.Provider>
  );
}

export function useRecaptcha(): RecaptchaContextValue {
  const context = useContext(RecaptchaContext);
  if (!context) {
    // A form rendered outside the provider still works (captcha disabled).
    return {
      enabled: false,
      ready: false,
      v2Required: false,
      v2Token: null,
      execute: async () => null,
      requireV2: () => undefined,
      setV2Token: () => undefined,
      reset: () => undefined,
    };
  }
  return context;
}

export { RECAPTCHA_SCORE_THRESHOLD };
