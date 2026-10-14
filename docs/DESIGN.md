# Design and page architecture

This build turns the former single scrolling page into a real multi-page station site. It keeps
the **DJoz (Colorlib) design source** recovered from the supplied archive — its type system,
purple/ink palette, editorial card style and section rhytm — and applies it across independent
routes instead of one long homepage.

## 1. Page inventory

| Route | Type | What it is |
| --- | --- | --- |
| `/` | home | Hero + frequency strip, three featured shows, audio previews, latest stories, newsletter |
| `/shows` | index | All ten programmes, filterable by category and searchable (`?q=`, `?category=`) |
| `/shows/[slug]` | detail | Show description, schedule, host panel, related shows, play control |
| `/schedule` | index | Seven day tabs (keyboard operable), gap-filling music between hosted shows, "on air now" |
| `/presenters` | index | Every presenter card |
| `/presenters/[slug]` | detail | Bio, show(s) hosted, shout-out CTA |
| `/podcasts` | index | The listening library: three labelled sample-audio previews, filterable |
| `/podcasts/[slug]` | detail | Preview landing page with an explicit "this is not an episode" notice |
| `/news` | index | Community desk with lead story and filters |
| `/news/[slug]` | article | MDX article, `NewsArticle` JSON-LD, related stories |
| `/listen` | utility | The listening room: now on air from the schedule, honest demo notice, tuning FAQ |
| `/request` | form | Song request + dedication |
| `/studio` | editorial | Studio gallery and the work behind the broadcast |
| `/newsletter` | form | Weekly playlist signup |
| `/advertise` | commercial | Packages, process, enquiry form (`?package=` preselects) |
| `/contests` | status | Archive of the past giveaway — clearly closed, no entry form |
| `/contact` | form | Contact details and message form |
| `/register` | status | Listener accounts are not open; no password collection |
| `/legal/*` | static | Privacy, terms, cookie policy |
| `not-found`, `error`, `global-error` | — | Off-air and 404 states |

## 2. Mapping from the DJoz template

| DJoz template page | This build |
| --- | --- |
| `index.html` (hero, about, discography, tours, blog, contact) | Split into `/`, `/about`, `/podcasts`, `/schedule`, `/news`, `/contact` |
| `about.html` | `/about`, `/studio`, `/presenters` |
| `discography.html` (album grid + detail) | `/podcasts`, `/podcasts/[slug]`, `/shows` |
| `tours.html` (tour rows, cities, dates) | `/schedule` (day tabs + programme rows) |
| `blog.html` / `blog-details.html` | `/news`, `/news/[slug]` |
| `contact.html` | `/contact`, `/request`, `/advertise` |
| Preloader, gooey/blob filters, WebGL mic, AR tour, waveform particles | Retired — see §4 |
| Template nav anchors (`#schedule`, `#presenters`, `?presenter=…`) | Real routes; a tiny client shim (`LegacyNavigation`) redirects old links on load |
| `*.html` URLs | Redirected in `next.config.mjs` to the matching route |

## 3. Design tokens

* Ink `#19151f`, DJoz purple `#5c00ce`, deep plum `#290849`, warm paper `#f7f6f2`, lime `#dcf77a`.
* Body: self-hosted **Now** (7 WOFF files, byte-identical to the source, hash-checked in `npm run verify:fonts`).
* Headings: **Rajdhani** (self-hosted via `@fontsource/rajdhani`).
* Accent script face: **Rockville Solid** — used for the hero's "Your Nairobi." line and the PWA icons.
* Structure: fixed dark header with a station bar, editorial page heroes with breadcrumbs, card
  grids, a sticky player reserved by `body` padding, and a footer that links every real route.

## 4. Deliberate overrides

The first pass implemented 31 scripted effects (WebGL microphone, scrollytelling, AR tour, gooey
filters, preloader, particle waveform). With the move to a multi-page site they were removed, and
with them the `three` and `wavesurfer.js` dependencies — the audio element is native. The old
one-page documents (`EFFECTS.md`, the effect sections of `VERIFICATION.md`) are retained as history
only.

What replaced them:

* **Type-led hero** — Rockville script accent over Rajdhani, no canvas, no scroll hijacking.
* **Real navigation** — sticky header, active-route state, "Explore" dropdown, mobile drawer.
* **Persistent audio** — one `<audio>` element in the root layout; a single transient Zustand
  store survives client-side navigation and never fabricates listener numbers or songs.
* **Genuine filters** — category buttons and search on shows, podcasts and stories; day tabs on
  the schedule. All state is URL-addressable where it matters (`?day=`, `?q=`).
* All movement respects `prefers-reduced-motion`.

## 5. Honesty rules baked into the UI

* The player, `/listen`, `/podcasts` and every episode page state that the audio is **demo audio**
  from the design archive whenever `NEXT_PUBLIC_STREAM_URL` is not configured.
* `/api/now-playing` reports `source: "schedule"` (or `"demo"`) instead of inventing a song and
  artist. With `NOW_PLAYING_API_URL` set, real upstream metadata is used.
* Contests show an explicit "entries closed" state; `/api/contest` returns `410` for the closed
  giveaway and `404` for unknown slugs.
* Forms report a preview/undelivered state when KV and SMTP are not configured, instead of
  claiming the studio received a message.
* `/register` explains that accounts are not available and holds no form.
