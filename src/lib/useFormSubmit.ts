'use client';

import { useCallback, useState } from 'react';
import { useRecaptcha } from '@/components/RecaptchaProvider';
import type { RecaptchaAction } from '@/lib/recaptcha';

/**
 * Shared submit pipeline for the six reCAPTCHA-protected forms.
 *
 * 1. Execute reCAPTCHA v3 for the form's action.
 * 2. POST the payload plus `token`.
 * 3. If the server answers `requiresV2Fallback` (score < 0.5), surface the v2
 *    checkbox challenge and, once solved, resubmit with `v2Token`.
 */

export type SubmitState = 'idle' | 'submitting' | 'success' | 'error' | 'needs-v2';

export interface SubmitResult<T> {
  state: SubmitState;
  message: string;
  fields: Record<string, string>;
  data: T | null;
}

export function useFormSubmit<T = { message?: string }>(action: RecaptchaAction, endpoint: string) {
  const { execute, v2Token, requireV2, reset: resetCaptcha } = useRecaptcha();
  const [result, setResult] = useState<SubmitResult<T>>({
    state: 'idle',
    message: '',
    fields: {},
    data: null,
  });

  const submit = useCallback(
    async (payload: Record<string, unknown>, options?: { useV2?: boolean }) => {
      setResult({ state: 'submitting', message: '', fields: {}, data: null });

      try {
        const useV2 = options?.useV2 ?? false;
        const token = useV2 ? v2Token ?? undefined : (await execute(action)) ?? undefined;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, ...(useV2 ? { v2Token: token } : { token }) }),
        });

        const body = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          fields?: Record<string, string>;
          requiresV2Fallback?: boolean;
        } & T;

        if (body.requiresV2Fallback && !useV2) {
          requireV2(true);
          setResult({
            state: 'needs-v2',
            message: 'Complete the verification challenge below, then press submit again.',
            fields: {},
            data: null,
          });
          return { ok: false as const, body };
        }

        if (!response.ok || body.ok === false) {
          setResult({
            state: 'error',
            message: body.error ?? 'Something went wrong. Please try again.',
            fields: body.fields ?? {},
            data: null,
          });
          return { ok: false as const, body };
        }

        setResult({
          state: 'success',
          message: body.message ?? 'Thank you — the studio has your message.',
          fields: {},
          data: body,
        });
        resetCaptcha();
        return { ok: true as const, body };
      } catch {
        setResult({
          state: 'error',
          message: 'Network problem. Check your connection and try again.',
          fields: {},
          data: null,
        });
        return { ok: false as const, body: null };
      }
    },
    [action, endpoint, execute, requireV2, resetCaptcha, v2Token],
  );

  const clear = useCallback(
    () => setResult({ state: 'idle', message: '', fields: {}, data: null }),
    [],
  );

  return { ...result, submit, clear };
}
