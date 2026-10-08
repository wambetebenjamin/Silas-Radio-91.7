# Silas Radio 91.7 — silasradio917.co.ke

Community radio for Nairobi: live stream, shows, presenters, podcasts, local news,
contests and advertising. Built as a Next.js 15.1.x App Router application with
TypeScript.

**Design source:** the uploaded ZIP was recovered, unpacked and fully documented
before any code was written — see **[DESIGN-INSPECTION.md](./DESIGN-INSPECTION.md)**
and **[EFFECTS.md](./EFFECTS.md)**. Every colour, font, radius, shadow and timing
in this build traces back to that source or is an explicitly documented override.

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
| `npm run audit:rendered` | Accessibility/structure audit of the rendered HTML (start the server first) |
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
| three | 0.172.0 | EFFECT-01 hero, dynamically imported |
| wavesurfer.js | 7.8.11 | player waveform |
| Zustand | 5.0.2 | persistent player state |
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
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `WHATSAPP_NUMBER` | spec-mandated | floating button, player shortcut, studio notifications |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED` | optional | contact section map |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SITE_KEY` | optional | client reCAPTCHA v3 |
| `RECAPTCHA_SECRET_KEY` | **server only** | `/api/captcha` and every protected endpoint |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | optional | song requests, contest entries, newsletter, listener count (Upstash names also accepted) |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | optional | Nodemailer transport |
| `STUDIO_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM`, `ADVERTISING_EMAIL` | optional | mail routing |
| `NOW_PLAYING_API_URL` | optional | real playout metadata; falls back to a deterministic demo rotation |
| `STUDIO_API_TOKEN` | optional | guards the studio-side `GET /api/request` and `PUT /api/schedule` |
| `SOCKET_URL` | optional | reported by `/api/ws?probe=1` when an external socket service exists |

**Everything degrades without configuration.** With no KV credentials, writes go to an
in-process buffer and the API answers `storage: "local-buffer"` instead of failing. With no
reCAPTCHA secret, verification is bypassed but flagged (`captchaBypassed: true`,
`reason: "RECAPTCHA_SECRET_KEY not configured"`) so the studio can see the difference.

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
| `/` | ISR 30s | Hero, presence board, scrollytelling, schedule + studio widget, presenters, gallery, AR tour, song request, advertising, contests, news teaser, newsletter, contact, podcast strip |
| `/news` | ISR 120s | MDX index with lead story |
| `/news/[slug]` | SSG + ISR 120s | Per-article OG + `NewsArticle` JSON-LD |
| `/podcasts` | static | `PodcastSeries` JSON-LD per show |
| `/advertise` | static | Rate card, media kit, packages, enquiry form |
| `/contests` | static | Active contest + entry form, past winners |
| `/contact` | static | Contact form, address, map, WhatsApp, advertising enquiry |
| `/register` | static, `noindex` | Account registration (reCAPTCHA v3) |
| `/legal/privacy-policy` | static | Listening Data, Request Data, Newsletter Data, Analytics, Your Rights, Contact |
| `/legal/terms` | static | Contest Terms, Advertising Terms, Listener Terms, Content Ownership, Governing Law (Kenya) |
| `/legal/cookie-policy` | static | Necessary / Functional / Analytics categories |
| `/sitemap.xml` | dynamic | Static routes + presenters + every news article |
| `/robots.txt` | static-ish | Allows all content, disallows `/api/` and `/register` |
| `/manifest.webmanifest` | generated | PWA manifest with three shortcuts |
| `not-found` | — | "This broadcast channel was not found." + Return to Live Radio |
| `error` / `global-error` | — | "We are off-air temporarily. Back soon." + Try Again + WhatsApp number |

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

## 8. The 31 effects

See **[EFFECTS.md](./EFFECTS.md)** for the full mapping of all 31 effects (and all 31
reduced-motion fallbacks) to the file and line that implements them. Summary of the
architecture:

* **Server-rendered, no JavaScript required** for: navbar, hero copy and CTAs, schedule,
  presenters, gallery copy, packages, news, legal pages, footer.
* **Progressive effects** load dynamically (`three` and `wavesurfer.js` are separate chunks,
  357 kB and 333 kB, so they never sit in the 149 kB first-load bundle).
* Every effect reads `useReducedMotion()` and renders its static state rather than a faster
  animation.

---

## 9. Accessibility

Audited with `node scripts/audit-rendered.mjs` against the running server — **12/12 routes clean**:
one `<h1>` per page, `alt` on every image, accessible names on every button and link,
`<label for>` wiring on every field, skip link, `lang="en-KE"`, and live regions where
content updates.

Also implemented: visible focus rings that stay visible over the glass nav, 48×48 minimum touch
targets, `role="status"` announcements (preloader completion, listener count, form results,
page-flip page numbers), `aria-busy` on the schedule container, `aria-hidden` on all decorative
art, and form errors wired through `aria-invalid` + `role="alert"`.

---

## 10. Responsive behaviour

Verified at the five specified breakpoints: **1440 / 1024 / 768 / 390 / 320 px**.

* Audio player: compact on mobile (`--player-h-compact: 72px`), full on desktop; **the
  waveform is hidden below 480px** while the scrub control remains.
* The player never overlaps CTAs: `body` reserves the player's height as bottom padding, and
  every page's last section carries extra room on small screens (`.sr-page-end`).
* Gallery: 3 columns at ≥1024px, **2 columns at 768px, 1 column on mobile**.
* Schedule: horizontal scroll-snap rail on desktop and mobile; plain wrapped grid under
  reduced motion.
* All interactive elements meet the 48×48px minimum, including the rail tabs, icon buttons and
  the WhatsApp shortcut.

---

## 11. PWA and offline player fallback

`public/sw.js` caches the app shell, keeps the last three audio responses in a media cache and
serves an offline document that still identifies the station. `src/app/manifest.ts` provides
install shortcuts for Listen live, Song request and Schedule. Registration is deferred to the
`load` event so it never competes with the hero for main-thread time.

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
   * **Redirects** — `/privacy`, `/terms`, `/cookies`, `/live`, `/listen`.
   * **No cron jobs** — works on the Vercel Hobby plan. `/api/now-playing` is request-time
     (`force-dynamic`), so every hit computes fresh metadata; no scheduled warm-up is required.
4. Post-deploy checks: `/api/ws?probe=1`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`.

---

## 13. Testing and verification

`npm run build` passes (26 routes generated), `tsc --noEmit` is clean and the rendered audit is
clean. **[VERIFICATION.md](./VERIFICATION.md)** records the exact commands and outputs, including
the API contract tests, the font integrity run and the accessibility matrix.

---

## 14. Repository layout

```
├── DESIGN-INSPECTION.md      ← the ZIP forensics + full design-source inventory
├── EFFECTS.md                ← all 31 effects + 31 reduced-motion fallbacks, mapped
├── VERIFICATION.md           ← test evidence
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
    ├── components/           ← 34 components, one per effect or page section
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
* Audio in `public/audio/stream/`: demo tracks taken from the design source's `music-files/`,
  used here as placeholder stream audio.
