/**
 * Storage layer.
 *
 * Spec calls for Vercel KV. Both `KV_REST_API_*` and `UPSTASH_REDIS_*` env
 * names are honoured because Vercel migrated KV to Upstash Redis under the
 * same product surface.
 *
 * When no credentials are configured (local development, first deploy, or a
 * KV outage) writes are kept in an in-process ring buffer and reads return
 * `source: 'local'` so the API can answer honestly instead of failing.
 */

export type StorageSource = 'kv' | 'local';

export interface StorageResult<T = unknown> {
  ok: boolean;
  source: StorageSource;
  data?: T;
  error?: string;
}

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

/** In-memory fallback store (per server instance, best-effort). */
const memory = new Map<string, unknown[]>();

export const storageConfigured = Boolean(KV_URL && KV_TOKEN);

/** Minimal Upstash/Vercel KV REST client — no extra dependency needed. */
async function kvCommand<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`KV command failed with ${res.status}`);
  }
  const json = (await res.json()) as { result?: T; error?: string };
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

/**
 * Append a record to a list and return a stored copy with metadata.
 * `key` should be namespaced, e.g. `silas:requests`.
 */
export async function saveRecord<T extends Record<string, unknown>>(
  key: string,
  record: T,
): Promise<StorageResult<T & { id: string; storedAt: string }>> {
  const payload = {
    ...record,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    storedAt: new Date().toISOString(),
  } as T & { id: string; storedAt: string };

  if (storageConfigured) {
    try {
      await kvCommand(['LPUSH', key, JSON.stringify(payload)]);
      await kvCommand(['LTRIM', key, 0, 4999]);
      return { ok: true, source: 'kv', data: payload };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      // fall through to local buffer so the studio still gets the request
      pushLocal(key, payload);
      return { ok: false, source: 'local', data: payload, error: message };
    }
  }

  pushLocal(key, payload);
  return { ok: true, source: 'local', data: payload };
}

function pushLocal(key: string, value: unknown) {
  const list = memory.get(key) ?? [];
  list.unshift(value);
  memory.set(key, list.slice(0, 500));
}

/** Read the most recent N records for a key. */
export async function listRecords<T>(key: string, limit = 50): Promise<StorageResult<T[]>> {
  if (storageConfigured) {
    try {
      const raw = await kvCommand<string[]>(['LRANGE', key, 0, limit - 1]);
      const data = (raw ?? []).map((item) => {
        try {
          return JSON.parse(item) as T;
        } catch {
          return item as unknown as T;
        }
      });
      return { ok: true, source: 'kv', data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      return { ok: false, source: 'local', data: (memory.get(key) ?? []) as T[], error: message };
    }
  }
  return { ok: true, source: 'local', data: (memory.get(key) ?? []) as T[] };
}

/** Simple counter used by the presence board. */
export async function increment(key: string, by = 1): Promise<number> {
  if (storageConfigured) {
    try {
      const value = await kvCommand<number>(['INCRBY', key, by]);
      return Number(value ?? 0);
    } catch {
      /* fall through */
    }
  }
  const current = Number(memory.get(key)?.[0] ?? 0) + by;
  memory.set(key, [current]);
  return current;
}

export async function getNumber(key: string, fallback: number): Promise<number> {
  if (storageConfigured) {
    try {
      const value = await kvCommand<string | null>(['GET', key]);
      if (value !== null && value !== undefined) return Number(value);
    } catch {
      /* fall through */
    }
  }
  const local = memory.get(key)?.[0];
  return typeof local === 'number' ? local : fallback;
}

export const KEYS = {
  requests: 'silas:song-requests',
  contests: 'silas:contest-entries',
  newsletter: 'silas:newsletter-subscribers',
  advertise: 'silas:advertising-enquiries',
  contact: 'silas:contact-messages',
  listeners: 'silas:listener-count',
} as const;
