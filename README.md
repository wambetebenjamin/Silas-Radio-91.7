# Silas Radio 91.7 — silasradio917.co.ke

Community radio for Nairobi: live stream, shows, presenters, podcasts, local news,
contests and advertising. Built as a Next.js 15.1.x App Router application with
TypeScript.

The site was originally a single very long homepage. It is now a real multi-page station site:
shows, presenters, schedule, podcasts, stories, listening room, request, studio, newsletter,
advertising, contests and contact each have their own routes, with detail pages for shows,
presenters, audio previews and articles. **[docs/DESIGN.md](./docs/DESIGN.md)** maps every page,
shows which DJoz template page each route derives from, and lists the deliberate overrides.

**Design source:** the uploaded ZIP was recovered, unpacked and documented before any code was
written — see **[DESIGN-INSPECTION.md](./DESIGN-INSPECTION.md)** (archive forensics and source
inventory) and **[EFFECTS.md](./EFFECTS.md)** (note: the first pass's 31 effects were retired when
the site was split into pages).

---

## 1. Quick start

```bash
nvm use                 # .nvmrc → 24.0.0
npm install
cp .env.example .env.local     # optional for local dev; everything degrades gracefully
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (lint + type-check included) |
| `npm run start` | Serve the production build on port 3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm run verify:fonts` | Re-hash the 7 design-source WOFF files against the recorded digests |
| `npm run verify:fonts:hashes` | Same, but exits non-zero on any divergence (use in CI) |
| `npm run verify:images` | Check every shipped photo has a credit row in `image-credits.md` |
| `npm run verify` | typecheck + font hashes + image credits + lint — the pre-push sweep |
| `npm test` | Playwright browser suite (routes, navigation, filters, schedule tabs, forms, audio persistence, axe) — needs a build + running server |
| `npm run test:install` | Download the Playwright Chromium build (skipped in minimal containers where a system Chromium is used) |
| `npm run audit:rendered` | Static audit of the server-rendered HTML across all 23 routes (`npm run audit:rendered -- http://127.0.0.1:3100`) |
| `node scripts/capture-screenshots.mjs` | Documentation screenshots into `docs/screenshots/` (uses `PLAYWRIGHT_CHROMIUM_PATH`/`BASE_URL`) |
| `python3 scripts/generate-assets.py` | Regenerates the PWA icons and the EFFECT-31 sprite sheet |

---

## 2. Node and package versions

| Item | Version | Notes |
| --- | --- | --- |
| Node | **24.x** | `.nvmrc` pins `24.0.0`; `engines.node` is `>=24.0.0`. Vercel reads `engines.node` and runs the latest 24.x. |
| Next.js | **15.1.12** | The brief specifies 15.1.0. 15.1.0 carries CVE-2025-66478 (`npm deprecate` warns on install), so the build pins **15.1.12 — the patched release on the same 15.1.x line**, with no API changes. |
| React / React DOM | 19.0.0 | Required by Next 15.1.x |
| TypeScript | 5.7.2 | strict mode |
| Tailwind CSS | 3.4.17 | utilities only — the design system is CSS custom properties |
| PostCSS / Autoprefixer | 8.4.49 / 10.4.20 | |
| Zustand | 5.0.2 | transient player state (no persistence of playback) |
| @playwright/test / @axe-core/playwright | 1.56.1 / 4.11.0 | browser tests and accessibility checks |
| lucide-react | **0.468.0** | the only icon set, as specified |
| @fontsource/rajdhani | 5.1.0 | self-hosted Rajdhani 400/500/600/700 |
| zod | 3.24.1 | request validation |
| nodemailer | 6.9.16 | `/api/contact`, `/api/advertise`, studio alerts |
| gray-matter + next-mdx-remote | 4.0.3 / 5.0.0 | MDX news |
| @vercel/kv | 3.0.0 | KV client (the REST helper in `src/lib/db.ts` honours both KV and Upstash env names) |
| eslint + eslint-config-next | 8.57.1 / 15.1.12 | |

---

## 3. Environment variables

Values are never committed. `.env.example` lists every name.

| Variable | Required | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommended | canonical URLs, OG, sitemap, JSON-LD |
| `NEXT_PUBLIC_STREAM_URL` | recommended | live stream endpoint for the player |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `WHATSAPP_NUMBER` | optional | WhatsApp links on the contact/request pages and studio notifications |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED` | optional | contact section map |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SITE_KEY` | optional | client reCAPTCHA v3 |
| `RECAPTCHA_SECRET_KEY` | **server only** | `/api/captcha` and every protected endpoint |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | optional | song requests, contest entries, newsletter, listener count (Upstash names also accepted) |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | optional | Nodemailer transport |
| `STUDIO_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM`, `ADVERTISING_EMAIL` | optional | mail routing |
| `NOW_PLAYING_API_URL` | optional | real playout metadata; without it `/api/now-playing` reports the scheduled programme with `source: "schedule"` or `"demo"` and never invents a song |
| `STUDIO_API_TOKEN` | optional | guards the studio-side `GET /api/request` and `PUT /api/schedule` |
| `SOCKET_URL` | optional | reported by `/api/ws?probe=1` when an external socket service exists |

**Everything degrades honestly without configuration.** With no KV credentials, writes go to an
in-process buffer and the API answers `storage: "local-buffer"`. With no reCAPTCHA secret,
verification is bypassed but flagged (`captchaBypassed: true`). With neither KV nor SMTP the
response also carries `persisted: false` / `notified: false`, and the forms tell the listener that
the message has **not** reached the studio and offer email/WhatsApp instead. With no
`NEXT_PUBLIC_STREAM_URL` the player uses the archive's sample audio and every screen that plays it
says so.

---

## 4. API route structure

| Route | Methods | Runtime | Purpose |
| --- | --- | --- | --- |
| `/api/request` | `POST`, `GET` | node | Song request + dedication → KV, studio email, WhatsApp deep link. `GET` is studio-only (`x-studio-token`). |
| `/api/contest` | `POST` | node | Contest entry → KV, confirmation. |
| `/api/schedule` | `GET`, `PUT`, `POST` | node | Live-flagged schedule (SSR source of truth). `PUT` = studio override, `POST ?overrides=1` = overrides + listener count. |
| `/api/now-playing` | `GET` | node | Current song, artist, presenter, elapsed/remaining, next up. |
| `/api/advertise` | `POST` | node | Advertising enquiry → KV + sales inbox + studio WhatsApp. |
| `/api/news` | `GET` | node, ISR 120 | MDX articles as JSON (`?limit=`, `?category=`, `?slug=`). |
| `/api/newsletter` | `POST`, `GET` | node | Email + genre preference → KV; `GET` returns subscriber count. |
| `/api/contact` | `POST` | node | General contact → KV + Nodemailer. |
| `/api/captcha` | `POST`, `GET` | node | Standalone server-side verification. `GET` returns the public site key and the accepted action names. |
| `/api/ws` | `GET`, `POST` | **edge** | Realtime listener count + presence. `GET` is an SSE stream; `?probe=1` reports transport capability; `POST` is a presence ping. |

### About `/api/ws` — SSE on the Edge runtime

The brief asks for WebSockets on the Vercel Edge runtime. **Vercel does not hold WebSocket
upgrades on Edge Functions**, so a `wss:` endpoint cannot live there. `/api/ws` therefore
implements the *same push contract* over Server-Sent Events — which is exactly what a
listener counter needs (server → client, one way) — and:

* runs on the Edge runtime as specified (`export const runtime = 'edge'`);
* exposes `GET /api/ws?probe=1` reporting `websocketUpgradeSupported: false` and any
  `SOCKET_URL` for deployments that do run a socket service;
* gives the client optimistic updates, auto-reconnect with exponential backoff
  (`src/hooks/useListeners.ts`) and a graceful single-visitor state.

If Silas Radio later deploys a socket service, the client needs only to prefer `SOCKET_URL`
when the probe reports one — the store and UI contract do not change.

---

## 5. Page routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | ISR 30s | Hero, live frequency strip, featured shows, audio previews, latest stories, newsletter |
| `/about` | static | Station story, values, presenter teasers |
| `/shows` | dynamic (filters) | All ten programmes with category filter + search, URL-addressable |
| `/shows/[slug]` | SSG | Show detail: description, days/times, host panel, related shows |
| `/schedule` | dynamic | Seven day tabs (arrow-key operable), gap-filling "Silas Selection", on-air marker |
| `/presenters` | static | Presenter index |
| `/presenters/[slug]` | SSG | Bio, hosted shows, shout-out CTA |
| `/podcasts` | dynamic (filters) | Listening library of clearly labelled sample-audio previews |
| `/podcasts/[slug]` | SSG | Preview page with an explicit "not an episode" notice |
| `/news` | ISR 120s | Community-desk index with lead story, filters and search |
| `/news/[slug]` | SSG + ISR 120s | MDX article, per-article OG + `NewsArticle` JSON-LD |
| `/listen` | ISR 30s | Listening room: what's on now from the schedule, demo notice, tuning FAQ |
| `/studio` | static | Studio gallery and production-desk explainer |
| `/request` | static | Song request + dedication form |
| `/newsletter` | static | Weekly playlist signup |
| `/advertise` | dynamic | Packages, process, enquiry form (`?package=` preselects a package) |
| `/contests` | static | Past giveaway shown as closed — no entry form |
| `/contact` | static | Contact details + message form |
| `/register` | static, `noindex` | Accounts not open; no password collection |
| `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` | static | Station policies |
| `/sitemap.xml` | dynamic | Every real route, presenter, show, preview and article — no hashes or query aliases |
| `/robots.txt` | static | Allows content, disallows `/api/` and `/register` |
| `/manifest.webmanifest` | static | PWA manifest with three shortcuts |
| `not-found`, `error`, `global-error` | — | Off-air and 404 states in the new visual system |
| `next.config.mjs` redirects | — | Legacy `*.html` template URLs, `/live`, `/privacy`, `/terms`, `/cookies` |

Old one-page bookmarks still work: a small client shim maps the former `#schedule`, `#presenters`,
`#request`, `#gallery` … anchors and `?presenter=<slug>` links onto the new routes.

---

## 6. Fonts — extracted and reproduced exactly

Seven WOFF files are copied **byte-for-byte** from the design source into `public/fonts/`
and re-declared with the source's own family names in `src/app/globals.css`:

| Family (source name) | File | Bytes | SHA-256 (first 16) |
| --- | --- | --- | --- |
| `'Now Thin'` | `Now-Thin.woff` | 19,260 | `3e8a3515b9ad3d4f` |
| `'Now Light'` | `Now-Light.woff` | 19,560 | `88b22aed1437566f` |
| `'Now Regular'` | `Now-Regular.woff` | 19,652 | `d71c433c59cfea52` |
| `'Now Medium'` | `Now-Medium.woff` | 19,872 | `d6c617f85f63b61a` |
| `'Now Bold'` | `Now-Bold.woff` | 19,980 | `9c7bfc456cb67cd1` |
| `'Now Black'` | `Now-Black.woff` | 19,948 | `0064e3c2b5c6e79f` |
| `'Rockville Solid Regular'` | `Rockville Solid.woff` | 187,052 | `203667f2092abfd0` |

`npm run verify:fonts` re-hashes all seven and fails loudly if any byte moves. The
Rockville display face is also used to render the PWA icons (`scripts/generate-assets.py`).

Rajdhani — loaded from the Google Fonts CDN by the template — is self-hosted at the same four
weights (400/500/600/700) via `@fontsource/rajdhani`. Documented override, same family and
weights; rationale in DESIGN-INSPECTION.md §12.

---

## 7. Design tokens

All tokens live in `src/app/globals.css` under `:root`, with provenance comments. Highlights:

```css
--sr-primary: #5c00ce;      /* source $primary-color (39 uses) */
--sr-primary-hover: #7e00ad;
--sr-primary-pressed: #5400bc;
--sr-header-glass: rgba(42, 1, 74, 0.5);   /* source header */
--sr-header-solid: #290849;                /* source solid fallback */
--sr-preloader-a: #f44336;  --sr-preloader-b: #673ab7;
--hero-1 … --hero-9;        /* gradient ramp pixel-sampled from img/hero-bg.png */
--font-body: 'Now Regular';  --font-display: 'Rockville Solid Regular';
--fs-base: 15px;  --fs-nav: 13px;  --fs-button: 12px;  --fs-meta: 11px;
--lh-para: 26px;  --spad: 100px;  --tracking-eyebrow: 6px;  --tracking-button: 2px;
--glass-blur: 14px;  --glass-blur-max: 20px;
--neu-raised / --neu-pressed;   --clay-shadow / --clay-shadow-press;
--z-preloader: 999999;  --z-player: 8000;  --z-nav: 7000;  --z-whatsapp: 7700;
```

The hero gradient's ramp was **pixel-sampled from the source artwork** (`img/hero-bg.png`,
1920×1050): `#36049b → #4203b4 → #1b034f → #320289 → #1c014e → #110132 → #0c0024 → #11022d →
#000000`. Contrast against white text was verified at the brightest stop: **10.2:1**.

---

## 8. Motion and interaction

The first pass's 31 scripted effects were retired with the move to a multi-page site; the note in
**[EFFECTS.md](./EFFECTS.md)** lists the motion that remains (type-led hero reveal, card hovers,
day-tab switching, status pulse) and the single reduced-motion block that shortens all of it.

* **Server-rendered, no JavaScript required** for: header, hero copy and CTAs, shows, schedule,
  presenters, story list, packages, legal pages, footer.
* **Interactive pieces only where they earn it** — filters, day tabs, the audio player and forms.
* `three` and `wavesurfer.js` are gone from `package.json`; the player is a native `<audio>`.

---

## 9. Accessibility

Two independent checks:

* `node scripts/audit-rendered.mjs` — static audit of the server-rendered HTML for all 23 routes:
  one `<h1>` per page, `alt` on every image, accessible names on every button and link,
  label wiring (including wrapping `<label>`) on every field, skip link, `lang="en-KE"` and live
  regions. Current status: **0 pages with structural problems**.
* `npm test` — Playwright + `@axe-core/playwright` on desktop and mobile viewports, asserting no
  serious or critical WCAG 2.1 A/AA violations on `/`, `/schedule`, `/listen`, `/request`, `/contests`
  and checking headings, navigation landmarks and the player element on every route.

Also implemented: visible focus rings, ≥44px touch targets, `role="status"` announcements for form
results and schedule updates, `aria-current="page"` on the active nav item, a focus-trapping cookie
dialog, keyboard-operable schedule tabs, and form errors wired through `aria-invalid` +
`aria-describedby`.

---

## 10. Responsive behaviour

Checked in a browser at **1440 / 1366 / 1024 / 768 / 414 / 390 / 320 px**.

* Header: full navigation with an "Explore" dropdown above 1000px, hamburger drawer below it.
* Grids: 3 columns → 2 → 1; schedule rows stack with the time badge above the copy on phones.
* Player: fixed bottom bar, compresses to essential controls on small screens; `body` reserves
  `--player-height` plus the safe-area inset so nothing is ever hidden behind it.
* Forms: single-column fields on mobile, full-width submit buttons.
* `npm test` runs the full suite on both a 1366×900 desktop and a Pixel 5 viewport.

---

## 11. PWA and offline player fallback

`public/sw.js` (cache version `silas-v2`) caches the offline shell and a bounded set of static
assets, and serves a station-branded offline document. It deliberately **never** caches audio
requests, range responses, `/api/*` responses or Next.js RSC payloads, so it can never serve a
truncated stream or stale page data as if it were current. The static
`public/manifest.webmanifest` provides install shortcuts for Listen live, Song request and
Schedule. Registration happens in production only, deferred to the `load` event.

---

## 12. Deployment to Vercel

1. Import the repository. Vercel reads `engines.node` (`>=24.0.0`) and `.nvmrc` (`24.0.0`).
2. Add the environment variables from §3 (Vercel KV/Upstash, reCAPTCHA, SMTP, WhatsApp).
3. Deploy. `vercel.json` supplies:
   * **Security headers** on every route — HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
     `Referrer-Policy`, `Permissions-Policy` (camera + `xr-spatial-tracking` allowed for the AR
     tour, microphone denied), COOP and a CSP scoped to self + Google (reCAPTCHA + Maps).
   * **Cache policy** — immutable fonts, 7-day images, range-friendly audio, `no-store` APIs.
   * **Function config** — `/api/ws` on the Edge runtime, 30s max duration.
   * **Redirects** — legacy `.html` template URLs, `/live` → `/listen`, `/privacy`, `/terms`,
     `/cookies` (see §5). `/listen` is a real page now, so `vercel.json` no longer redirects it.
   * **No cron jobs** — works on the Vercel Hobby plan. `/api/now-playing` is request-time
     (`force-dynamic`), so every hit computes fresh metadata; no scheduled warm-up is required.
4. Post-deploy checks: `/api/ws?probe=1`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`.

---

## 13. Testing and verification

`npm run verify` (typecheck → font hashes → image credits → lint) passes, `npm run build` generates
**52 routes**, `npm test` runs the Playwright suite on desktop and mobile (69 passing, 1 skipped by
design) and `npm run audit:rendered` reports **0 pages with structural problems** across 23 routes.
**[VERIFICATION.md](./VERIFICATION.md)** records the exact commands and their output, and
`docs/screenshots/` holds captured desktop/mobile views of the new pages.

---

## 14. Repository layout

```
├── DESIGN-INSPECTION.md      ← the ZIP forensics + full design-source inventory
├── EFFECTS.md                ← archive note on the retired first-pass effects
├── VERIFICATION.md           ← test evidence
├── docs/DESIGN.md            ← page map, DJoz → route mapping, overrides, honesty rules
├── docs/screenshots/         ← captured desktop/mobile views
├── tests/site.spec.ts        ← Playwright suite (routes, nav, filters, forms, audio, axe)
├── playwright.config.ts      ← desktop + mobile projects, webServer wiring
├── image-credits.md          ← every photo, its Pexels/Unsplash source and subject coverage
├── content/news/*.mdx        ← newsroom articles
├── design-source/            ← the recovered template (heavy folders git-ignored)
├── public/
│   ├── fonts/                ← 7 design-source WOFF files, byte-identical
│   ├── audio/stream/         ← audio sourced from the design source's music files
│   ├── images/               ← Pexels/Unsplash photography, saved locally
│   └── icons/ + sw.js        ← PWA icons and the offline worker
├── scripts/                  ← asset generation, font verification, rendered audit
└── src/
    ├── app/                  ← routes, API handlers, globals.css, manifest, sitemap, robots
    ├── components/           ← shared shell (nav, footer, player, consent) + site/ components
    ├── hooks/                ← reduced motion, viewport, current-broadcast clock
    ├── lib/                  ← station data, programming/schedule logic, forms, KV, mailer
    └── store/                ← transient Zustand player store
    ├── hooks/                ← reduced motion, scrollers, viewport, listeners
    ├── lib/                  ← site content, KV, reCAPTCHA, mailer, news, validation
    └── store/                ← Zustand player store
```

---

## 15. Licence and credits

* Template/design source: **Colorlib "DJoz"** (see `design-source/Djoz-master/readme.txt` for
  the template's own licence notice, retained unaltered in the archive).
* Photography: **Pexels** and **Unsplash** only — no AI images; full list in
  [image-credits.md](./image-credits.md).
* Icons: **Lucide 0.468.0** only.
* Audio in `public/audio/stream/`: sample music taken from the design source's `music-files/`.
  It is **demo audio, not station recordings or a live broadcast**, and the UI says so wherever
  it is played (the player label, `/listen`, `/podcasts` and each preview page).
