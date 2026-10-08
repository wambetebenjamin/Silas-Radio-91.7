'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';

/**
 * Live listener count + presence (EFFECT-05).
 *
 * Transport: the /api/ws stream (Server-Sent Events on the Vercel Edge
 * runtime — Vercel does not hold WebSocket upgrades, see src/app/api/ws/route.ts
 * for the note). Behaviour required by the brief:
 *
 *   - optimistic update on connect (count rises immediately, no spinner wait)
 *   - auto-reconnect with exponential backoff
 *   - graceful single-visitor state ("You're the first one here today")
 */

export type PresenceStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

export interface ListenerState {
  count: number;
  status: PresenceStatus;
  singleVisitor: boolean;
  lastUpdate: string | null;
}

export function useListeners(seed: number = SITE.listenersSeed) {
  const [state, setState] = useState<ListenerState>({
    // optimistic first paint: SSR seed + 1 so the visitor sees themselves counted
    count: seed + 1,
    status: 'connecting',
    singleVisitor: false,
    lastUpdate: null,
  });

  const sourceRef = useRef<EventSource | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      setState((prev) => ({ ...prev, status: 'offline' }));
      return;
    }

    sourceRef.current?.close();
    const source = new EventSource('/api/ws');
    sourceRef.current = source;

    source.addEventListener('ready', (event) => {
      attemptsRef.current = 0;
      const data = JSON.parse((event as MessageEvent).data) as {
        listeners: number;
        presence: string;
      };
      setState({
        count: data.listeners,
        status: 'live',
        singleVisitor: data.listeners <= 1,
        lastUpdate: new Date().toISOString(),
      });
    });

    source.addEventListener('listeners', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { listeners: number; at: string };
      setState({
        count: data.listeners,
        status: 'live',
        singleVisitor: data.listeners <= 1,
        lastUpdate: data.at,
      });
    });

    source.onerror = () => {
      source.close();
      if (!mountedRef.current) return;
      attemptsRef.current += 1;
      const delay = Math.min(1000 * 2 ** attemptsRef.current, 30_000);
      setState((prev) => ({ ...prev, status: 'reconnecting' }));
      timerRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      sourceRef.current?.close();
      // best-effort leave ping so the board does not over-count
      void fetch('/api/ws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
        keepalive: true,
      }).catch(() => undefined);
    };
  }, [connect]);

  return state;
}

/** Compact "9,014" formatting used on the presence board. */
export function formatListeners(value: number): string {
  return new Intl.NumberFormat('en-KE').format(Math.max(0, Math.round(value)));
}
