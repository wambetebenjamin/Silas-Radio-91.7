# VERIFICATION.md — evidence log

Everything below was run against this repository on **2026-10-08**, in the Arena sandbox
(Node v22.22.3, npm 10). Commands are quoted exactly so they can be re-run. Where a check has a
scripted form (fonts, images, rendered audit) the script is the source of truth; the tables are
its captured output.

---

## 1. Fonts — byte-exact reproduction (the sacred step)

```
$ npm run verify:fonts:hashes

Silas Radio 91.7 — font integrity check (7 files)

  OK       Now-Thin.woff          19260 bytes  3e8a3515b9ad3d4f…  'Now Thin'
  OK       Now-Light.woff         19560 bytes  88b22aed1437566f…  'Now Light'
  OK       Now-Regular.woff       19652 bytes  d71c433c59cfea52…  'Now Regular'
  OK       Now-Medium.woff        19872 bytes  d6c617f85f63b61a…  'Now Medium'
  OK       Now-Bold.woff          19980 bytes  9c7bfc456cb67cd1…  'Now Bold'
  OK       Now-Black.woff         19948 bytes  0064e3c2b5c6e79f…  'Now Black'
  OK       Rockville Solid.woff   187052 bytes  203667f2092abfd0…  'Rockville Solid Regular'

All 7 design-source fonts reproduced exactly.
exit=0
```

The expected digests were recorded when the files were copied out of the design source; the
check therefore fails if any byte of any font changes, and also verifies each `@font-face`
declares the source's own family name. Rajdhani is the one documented substitution — same
family, same four weights (400/500/600/700), self-hosted via `@fontsource/rajdhani` instead of
the template's Google Fonts CDN link (DESIGN-INSPECTION.md §12).

---

## 2. Build and type-check

```
$ npx tsc --noEmit
(no output, exit 0)

$ npm run build
   ▲ Next.js 15.1.12
 ✓ Compiled successfully
 ✓ Generating static pages (26/26)
exit=0
```

| Route | Type | First-load JS |
| --- | --- | --- |
| `/` | ISR 30 s | 149 kB |
| `/news` | ISR 120 s | — |
| `/news/[slug]` | SSG ×3 + ISR 120 s | — |
| `/podcasts`, `/advertise`, `/contests`, `/contact`, `/register` | static | — |
| `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` | static | — |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | generated | — |
| + 10 API routes | per-route runtime | — |

Home HTML is **240,536 bytes uncompressed, 38,222 bytes over the wire with gzip** — an
important number for Kenyan mobile data, which is why the hero backdrop became a CSS gradient
instead of the template's 3 MB `hero-bg.png`.

The heavy libraries are code-split and not in the first-load bundle:

| Chunk | Size | Loaded by |
| --- | --- | --- |
| `bd904a5c…js` | 357,733 B | three.js — hero, dynamic import |
| `b536a0f1…js` | 333,725 B | wavesurfer.js — player, dynamic import |
| `b7175b3f…`(css) | 49,267 B | `globals.css`, single stylesheet |

---

## 3. HTTP smoke test (production server, `npm run start`)

```
$ for path in / /news /podcasts /advertise /contests /contact /register \
    /legal/privacy-policy /legal/terms /legal/cookie-policy \
    /nonexistent-page /manifest.webmanifest /sitemap.xml /robots.txt; do …
```

| Path | Status |
| --- | --- |
| `/` | 200 |
| `/news` | 200 |
| `/podcasts` | 200 |
| `/advertise` | 200 |
| `/contests` | 200 |
| `/contact` | 200 |
| `/register` | 200 |
| `/legal/privacy-policy` | 200 |
| `/legal/terms` | 200 |
| `/legal/cookie-policy` | 200 |
| `/nonexistent-page` | **404** |
| `/manifest.webmanifest` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |

---

## 4. API contract tests

Every endpoint was exercised against the running production build.

| Endpoint | Request | Result |
| --- | --- | --- |
| `GET /api/schedule` | — | `ok:true`, `source:"static"`, `count:10`, `timezone:"Africa/Nairobi"`, day-flagged programs |
| `GET /api/now-playing` | — | `ok:true`, song "Nerea" / H_art the Band, presenter, elapsed 124 s of 265 s, `nextUp` = Midday Community Hour, `source:"demo"` |
| `GET /api/news?limit=1` | — | `count:1`, `revalidateSeconds:120`, slug `nairobi-commuters-drive-new-morning-sound` |
| `POST /api/request` | valid payload | `ok:true`, id issued, `storage:"local-buffer"` (no KV configured), WhatsApp deep link built from the exact mandated text |
| `POST /api/request` | invalid phone + blanks | `ok:false`, `fields` map with the Kenyan-phone message ("Enter a valid Kenyan phone number, e.g. 0712 345 678") |
| `POST /api/contest` | valid entry | `ok:true`, WhatsApp link carries the contest slug and answer |
| `POST /api/advertise` | valid enquiry | `ok:true`, package name resolved ("Presenter Live Read"), sales link built |
| `POST /api/newsletter` | valid email + genre | `ok:true`, "You are subscribed. Weekly playlist and community news, every Friday." |
| `POST /api/contact` | valid message | `ok:true`, "Message received. The studio replies within one working day." |
| `POST /api/captcha` | `{token, action}` | `ok:true`, `verifiedServerSide:true`, `configured:false`, `reason:"RECAPTCHA_SECRET_KEY not configured"` — verification is bypassed **loudly**, never silently |
| `GET /api/ws` | SSE | `event: ready` → `{listeners:9014, presence:"joined"}` then `event: listeners` heartbeats — see the transport note in README §4 |
| `GET /api/ws?probe=1` | — | `{"transport":"sse","websocketUpgradeSupported":false,"socketUrl":null}` |

**Captcha risk score handling** is proven by construction, not by a live score: with
`RECAPTCHA_SECRET_KEY` set, `verifyRecaptcha()` posts to
`https://www.google.com/recaptcha/api/siteverify`, and a score below the 0.5 threshold returns
`403` with `requiresV2Fallback: true`, which the shared form hook (`src/lib/useFormSubmit.ts`)
uses to swap in the v2 checkbox and retry. Without the secret, the endpoint reports
`configured:false` so the studio can see the difference rather than trusting a silent bypass.

---

## 5. Accessibility and structure audit

```
$ node scripts/audit-rendered.mjs

page                                            st    h1  img  noAlt  btn  btnNoName  …
/                                               200   1   15   0      43   0
/news                                           200   1   3    0      8    0
/news/nairobi-commuters-drive-new-morning-sound 200   1   1    0      8    0
/podcasts                                       200   1   0    0      8    0
/advertise                                      200   1   0    0      12   0
/contests                                       200   1   0    0      9    0
/contact                                        200   1   0    0      10   0
/register                                       200   1   0    0      9    0
/legal/privacy-policy                           200   1   0    0      8    0
/legal/terms                                    200   1   0    0      8    0
/legal/cookie-policy                            200   1   0    0      8    0
/nonexistent-page                               404   1   0    0      8    0
    … fieldNoName 0 · linkNoName 0 · skip-link yes · lang="en-KE" yes · JSON-LD present

Pages with structural problems: 0
```

This is the check that caught the missing `<h1>` on the sub-pages (the shared `SectionHead`
now takes an `as` prop and every page renders exactly one `<h1>`).

Also present: JSON-LD on every route (2 blocks on most pages — `RadioStation` + `LocalBusiness`
globally, `NewsArticle` and `PodcastSeries` where relevant; the podcast index carries 18 series
blocks), and live regions on the count-giving sections (`aria-live` 4–15 per page).

**Not covered here:** no headless browser exists in the sandbox, so contrast, focus visibility
and the animations themselves were verified **by construction** — contrast was computed from the
token values (hero gradient worst stop 10.2:1, body `#444` on `#f5f5f5` = 9.0:1, muted `#888` on
white = 3.5:1 used only for ≥18 px metadata), and every animated element ships its
reduced-motion fallback (EFFECTS.md). A Lighthouse/axe pass should be re-run once deployed.

---

## 6. Design-token fidelity (built CSS)

```
$ grep -c "<token>" .next/static/css/b685b58a5dfe45bc.css
#5c00ce → 1     #290849 → 1     rgba(42,1,74,…) → 1     #7e00ad → 1     #5400bc → 1
#f44336 → 1     #673ab7 → 1     #f2f2f2 → 1             z-index 999999 → 1
'Rockville Solid Regular' → 1   'Now Regular' → 1       Rajdhani → 1
prefers-reduced-motion → 1 block containing all 31 fallbacks
```

All 31 numbered effect selectors survive the build (`sr-preloader`, `sr-eq`, `sr-wordmark`,
`sr-gradient`, `sr-glitch`, `sr-scroll-story`, `sr-skel`, `sr-rail__tab`, `sr-presenter__reveal`,
`sr-gcard`, `sr-signal-wave`, `sr-morph__shape`, `sr-mascot`, `sr-vinyl`, `sr-collage`,
`sr-gooey`, `sr-iso`, `sr-spritesheet`, `sr-presence__dot`, `sr-neu__*`, `sr-flip*`, `sr-ar__*`,
`sr-player`, `sr-whatsapp`, `sr-cookie`, `sr-countdown`, `sr-news-card`, `sr-package`,
`sr-clay-btn`, `sr-doodle` — each ≥1 match).

**Sprite path:** the EFFECT-31 stop-motion sheet is requested as
`/images/stopmotion-vinyl-sprite.png` (2880×200 = 12 frames of 240×200) and the generated file
was confirmed present and pixel-correct after `python3 scripts/generate-assets.py`.

---

## 7. Content and copy checks (rendered HTML)

`curl` + `grep` against the built home page confirmed the mandated copy is present verbatim:

* `Nairobi Speaks. Silas Radio Listens.`
* `Live 24 hours. Community stories. East African music. 91.7 FM and online.`
* `Step Inside the Silas Radio Studio in AR.`
* `Request a song or enquire about advertising on Silas Radio.`
* `This broadcast channel was not found.` + `Return to Live Radio` on the 404 (each ×3 — the
  hidden/audible/anchor variants), plus the bounded gooey filter (`sr-gooey__blob` ×18).
* The four scrollytelling beats, the seven schedule rail tabs, the presenter roster, and the
  newsletter and advertising sections all render server-side.

---

## 8. Photography and credits

```
$ node scripts/verify-images.mjs --strict

  22 images (21 photographs), 3552 kB total
  21 credit rows in image-credits.md

Every shipped photograph has a credit entry, and every entry resolves. ✓
exit=0
```

* All photography is **Pexels or Unsplash only** (free licences), downloaded into
  `public/images/{presenters,studio,culture}/`, served locally — **no hotlinking** (verified by
  grepping the rendered HTML for `images.pexels.com` / `images.unsplash.com`: zero matches).
* **No AI-generated imagery** anywhere in the project.
* Watermarked search results (Dreamstime) were identified on a contact sheet and discarded
  before selection.
* Full provenance table in [image-credits.md](./image-credits.md).

---

## 9. Performance posture

| Metric | Value | Note |
| --- | --- | --- |
| Home HTML (gzip) | 38.2 kB | Kenyan mobile data is the constraint |
| First-load JS, home | 149 kB | Next 15.1.12 + React 19 |
| three.js | 357,733 B | dynamically imported, hero only |
| wavesurfer.js | 333,725 B | dynamically imported, on play |
| CSS | 49,267 B | one stylesheet, no CSS-in-JS runtime |
| Fonts | 306 kB total, 7 files | `Cache-Control: public, max-age=31536000, immutable` |
| Photography | 3,552 kB on disk | lazy-loaded (`loading="lazy"`), sized per slot |
| Images served | `/_next/image` | AVIF → WebP negotiation via `next.config.mjs` |

Font delivery was verified over HTTP: `Now-Regular.woff` responds `200` with
`Content-Type: font/woff` and `Cache-Control: public, max-age=31536000, immutable`.

---

## 10. Deployment checks to repeat on Vercel

The sandbox cannot reproduce Vercel's edge network, KV or WebSocket upgrade. After the first deploy:

1. `curl -s $URL/api/ws?probe=1` → expect `websocketUpgradeSupported:false` and a live SSE stream.
2. `curl -sI $URL/` → confirm the security headers from `vercel.json` (HSTS, CSP, `X-Frame-Options`).
3. `curl -s $URL/api/now-playing` → confirm live/demo metadata is returned (computed per request;
   no cron job is configured).
4. Run Lighthouse (mobile) and axe on `/` with the live stream playing — the two checks the
   sandbox cannot do (real animation + audio).
5. Confirm `/sitemap.xml` lists every presenter URL and all news slugs.
