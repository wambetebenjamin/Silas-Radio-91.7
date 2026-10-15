# VERIFICATION.md: evidence log

Commands below were run against this repository on **2026-10-14** in the Arena sandbox using
**Node v24.0.0** (`.nvmrc`). Where a check has a scripted form, the script is the source of truth
and the output shown here is its captured result.

---

## 1. Static checks: `npm run verify`

```
$ npm run verify          # typecheck → font hashes → image credits → lint

> tsc --noEmit                                  ✓ 0 errors
> node scripts/verify-fonts.mjs --strict
  All 7 design-source fonts reproduced exactly.
> node scripts/verify-images.mjs --strict
  22 images (21 photographs), 3552 kB total
  21 credit rows in image-credits.md
  Every shipped photograph has a credit entry, and every entry resolves. ✓
> next lint                                     ✓ No ESLint warnings or errors
```

## 2. Production build: `npm run build`

```
$ npm run build

 ✓ Compiled successfully
 ✓ Generating static pages (52/52)
 + First Load JS shared by all   105 kB
```

52 routes: 19 page routes plus SSG detail pages for 10 shows, 7 presenters, 3 audio previews and
3 articles, the `/api/*` handlers, `sitemap.xml`, `robots.txt` and the not-found page.

## 3. Rendered structure audit: `npm run audit:rendered`

```
$ npm run build && npm run start -- --hostname 0.0.0.0 &
$ npm run audit:rendered -- http://127.0.0.1:3100

Pages with structural problems: 0
```

23 routes checked (every page route, one article, one show, one presenter, one preview and a
404): exactly one `<h1>` per page, no image without `alt`, no unnamed button or link, every field
labelled (including wrapping `<label>`s), skip link, `lang="en-KE"`, live regions where content
updates.

## 4. Browser suite: `npm test`

Playwright 1.56.1 with `@axe-core/playwright` 4.11.0, run against the production build on two
projects (desktop 1366×900, Pixel 5):

```
$ npm test

  69 passed, 1 skipped (47s)
```

| Area | Assertions |
| --- | --- |
| Routes | 19 routes return 200, render the expected `<h1>`, footer, player and navigation; unknown show slugs return 404 |
| Navigation | `aria-current="page"` on the active route (never on `/`), in-app links, mobile drawer |
| Legacy URLs | `/#schedule` → `/schedule`, `?presenter=mary-wanjiru` → `/presenters/mary-wanjiru`, `/tours.html` → `/schedule`, `/live` → `/listen` |
| Schedule | Day tabs switch content, update `?day=`, and are keyboard operable; EAT labelling present |
| Catalogues | Category filter and search narrow the grid and write `?q=` |
| Forms | Validation messages appear; the response never claims the studio received an undelivered message |
| Honesty | `/contests` shows "no contests are accepting entries"; `/register` has no password input |
| Audio | The same `<audio>` element and track survive client-side navigation; `/listen` shows the demo notice |
| Accessibility | No serious/critical WCAG 2.1 A/AA violations on `/`, `/schedule`, `/listen`, `/request`, `/contests` |

The skipped test is the desktop-only duplicate of the `/` axe check (covered on desktop, skipped on
mobile by design).

## 5. Screenshots

`node scripts/capture-screenshots.mjs` captured the new pages from the production build into
`docs/screenshots/`: `home.jpg`, `show-detail.jpg`, `schedule.jpg`, `podcasts.jpg`, `stories.jpg`
and `listen-mobile.jpg` (414 px viewport).

---

## 6. History: how this build differs from the first pass

An earlier pass of this project built a single-page site with 31 scripted effects and 26 routes
(v1 documentation). That version's checks, including a rendered audit of 12 routes and the
`three`/`wavesurfer.js` bundle sizes, no longer apply: the effects and those dependencies were
removed when the site was split into real pages. See
**[docs/DESIGN.md](./docs/DESIGN.md)** §4 and **[EFFECTS.md](./EFFECTS.md)**.

The font-integrity and image-credit checks are unchanged from that pass and still pass byte-for-byte.

## 7. Known gaps

* No live stream URL is configured in this checkout, so the player plays the archive's sample
  audio and says so. Setting `NEXT_PUBLIC_STREAM_URL` switches it to a real stream.
* Contest, newsletter and enquiry writes fall back to an in-process buffer without KV; responses
  and UI then state that nothing was delivered.
* `libnspr4`-style shared libraries are absent in this sandbox, so the bundled Playwright browser
  download is unusable; the suite was run against a container Chromium with
  `PLAYWRIGHT_CHROMIUM_PATH` + `LD_LIBRARY_PATH`. On a normal machine `npx playwright install`
  is all that is needed.
