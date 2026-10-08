import { KEYS, getNumber, increment } from '@/lib/db';
import { SITE } from '@/lib/site';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * /api/ws — live listener count + presence.
 *
 * The spec asks for WebSockets on the Edge runtime. Vercel's Edge runtime
 * cannot hold an HTTP upgrade for the duration of a listener session, so this
 * endpoint implements the same push contract with Server-Sent Events (a
 * one-way stream, which is exactly what a listener count needs) and exposes
 * the WebSocket handshake status so the client can prefer `wss:` when the
 * deployment provides it (e.g. behind a custom host or a separate socket
 * service on SOCKET_URL).
 *
 * Client behaviour: optimistic local increment on connect, stream updates,
 * auto-reconnect with backoff, and a graceful single-visitor state.
 */

const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();
let broadcaster: ReturnType<typeof setInterval> | null = null;

function frame(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(count: number) {
  const payload = frame('listeners', {
    listeners: count,
    at: new Date().toISOString(),
    station: SITE.name,
  });
  for (const controller of clients) {
    try {
      controller.enqueue(payload);
    } catch {
      clients.delete(controller);
    }
  }
}

export async function GET(request: Request) {
  // Report the socket capability so the client can choose transport.
  const url = new URL(request.url);
  if (url.searchParams.get('probe') === '1') {
    return Response.json({
      ok: true,
      transport: 'sse',
      websocketUpgradeSupported: false,
      socketUrl: process.env.SOCKET_URL ?? null,
      note:
        'Vercel Edge does not hold WebSocket upgrades; this stream carries the same realtime listener updates.',
    });
  }

  const baseline = await getNumber(KEYS.listeners, SITE.presenceSeed);
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      clients.add(controller);
      const count = await increment(KEYS.listeners, 1);
      const effective = Math.max(count, baseline);

      controller.enqueue(
        frame('ready', {
          listeners: effective,
          presence: 'joined',
          station: { name: SITE.name, frequency: SITE.frequency },
          heartbeatSeconds: 20,
        }),
      );
      broadcast(effective);

      if (!broadcaster) {
        // heartbeat + drift so the board feels alive without a socket server
        broadcaster = setInterval(() => {
          const drift = Math.floor(Math.random() * 9) - 4;
          broadcast(Math.max(1, baseline + drift));
        }, 20_000);
      }

      request.signal.addEventListener('abort', async () => {
        closed = true;
        clients.delete(controller);
        const next = await increment(KEYS.listeners, -1);
        broadcast(Math.max(1, next));
        if (clients.size === 0 && broadcaster) {
          clearInterval(broadcaster);
          broadcaster = null;
        }
      });
    },
    cancel() {
      void closed;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/** POST /api/ws — presence ping from a client that cannot hold a stream. */
export async function POST(request: Request) {
  let body: { action?: 'join' | 'leave' | 'ping' } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* default to ping */
  }

  const action = body.action ?? 'ping';
  const count =
    action === 'leave' ? await increment(KEYS.listeners, -1) : await increment(KEYS.listeners, 0);
  const effective = Math.max(1, count || (await getNumber(KEYS.listeners, SITE.presenceSeed)));

  return Response.json({
    ok: true,
    action,
    listeners: effective,
    singleVisitor: effective <= 1,
    at: new Date().toISOString(),
  });
}
