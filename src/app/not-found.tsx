import Link from 'next/link';
import { PlayCircle, Radio } from 'lucide-react';

/**
 * 404 PAGE (EFFECT-17)
 *
 * Copy: "This broadcast channel was not found."
 * CTA:  "Return to Live Radio"
 * The liquid gooey blob animation runs on the page using the shared, bounded
 * SVG filter (#sr-gooey-filter) — it is applied only to the decorative blobs,
 * never to text, and the filter region is finite so it cannot paint outside its
 * own box.
 */

export default function NotFound() {
  return (
    <div className="sr-error-page sr-gradient" style={{ minHeight: 'calc(100vh - 76px - 96px)' }}>
      <div className="sr-container grid justify-items-center gap-6">
        {/* Decorative gooey blob cluster — bounded filter, aria-hidden */}
        <div className="sr-gooey" aria-hidden="true" style={{ width: 260, height: 170 }}>
          <span className="sr-gooey__blob sr-gooey__blob--a" style={{ width: 110, height: 110 }} />
          <span className="sr-gooey__blob sr-gooey__blob--b" style={{ width: 78, height: 78, left: 96, top: 58 }} />
          <span className="sr-gooey__blob sr-gooey__blob--c" style={{ width: 58, height: 58, left: 156, top: 34 }} />
        </div>

        <p className="sr-error-page__code" aria-hidden="true">
          404
        </p>

        <h1>This broadcast channel was not found.</h1>

        <p className="max-w-[52ch]">
          The page you asked for is not on this frequency. The live stream is still running, and the
          schedule, newsroom and request line are all one tap away.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link className="sr-btn sr-btn--white" href="/#player">
            <PlayCircle size={17} aria-hidden="true" />
            Return to Live Radio
          </Link>
          <Link className="sr-btn sr-btn--ghost-light" href="/">
            <Radio size={17} aria-hidden="true" />
            Back to the home page
          </Link>
        </div>

        <p className="sr-meta">
          Looking for a show? Try the <Link className="underline" href="/#schedule">schedule</Link>, the{' '}
          <Link className="underline" href="/news">newsroom</Link> or{' '}
          <Link className="underline" href="/podcasts">podcasts</Link>.
        </p>
      </div>
    </div>
  );
}
