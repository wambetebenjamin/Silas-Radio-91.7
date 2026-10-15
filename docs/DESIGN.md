# Design and page architecture

This build turns the former single scrolling page into a real multi-page station site. It keeps
the **DJoz (Colorlib) design source** recovered from the supplied archive, its type system,
purple/ink palette, editorial card style and section rhytm, and applies it across independent
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
| `/contests` | status | Archive of the past giveaway: clearly closed, no entry form |
| `/contact` | form | Contact details and message form |
| `/register` | status | Listener accounts are not open; no password collection |
| `/legal/*` | static | Privacy, terms, cookie policy |
| `not-found`, `error`, `global-error` | n/a | Off-air and 404 states |

## 2. Mapping from the DJoz template

| DJoz template page | This build |
| --- | --- |
| `index.html` (hero, about, discography, tours, blog, contact) | Split into `/`, `/about`, `/podcasts`, `/schedule`, `/news`, `/contact` |
| `about.html` | `/about`, `/studio`, `/presenters` |
| `discography.html` (album grid + detail) | `/podcasts`, `/podcasts/[slug]`, `/shows` |
| `tours.html` (tour rows, cities, dates) | `/schedule` (day tabs + programme rows) |
| `blog.html` / `blog-details.html` | `/news`, `/news/[slug]` |
| `contact.html` | `/contact`, `/request`, `/advertise` |
| Preloader, gooey/blob filters, WebGL mic, AR tour, waveform particles | Retired: see §4 |
| Template nav anchors (`#schedule`, `#presenters`, `?presenter=…`) | Real routes; a tiny client shim (`LegacyNavigation`) redirects old links on load |
| `*.html` URLs | Redirected in `next.config.mjs` to the matching route |

## 3. Design tokens

* Palette is the DJoz source palette and nothing else: ink `#111111`, purple `#5c00ce`, plum
  `#290849` (source `.header--normal`), paper `#f5f5f5`, borders `#e1e1e1`, panels `#f2f2f2`,
  text greys `#444444`/`#666666`/
  `#888888`, plus white and white alphas on dark surfaces.
* The first pass invented a neon lime `#dcf77a` on a near-black violet `#19151f`. Neither appears
  in `design-source/Djoz-master/css/style.css`, and both are now removed. Where the lime used to
  sit, the build uses purple `#5c00ce` on light surfaces and `#ffffff` on dark ones (`--accent`
  and `--accent-on-dark`).
* Body: self-hosted **Now** (7 WOFF files, byte-identical to the source, hash-checked in `npm run verify:fonts`).
* Headings: **Rajdhani** (self-hosted via `@fontsource/rajdhani`).
* Accent script face: **Rockville Solid**: used for the hero's frequency line and the PWA icons.
* Structure: fixed dark header with a station bar, editorial page heroes with breadcrumbs, card
  grids, a sticky player reserved by `body` padding, and a footer that links every real route.

## 4. Deliberate overrides

The first pass implemented 31 scripted effects (WebGL microphone, scrollytelling, AR tour, gooey
filters, preloader, particle waveform). With the move to a multi-page site they were removed, and
with them the `three` and `wavesurfer.js` dependencies, the audio element is native. The old
one-page documents (`EFFECTS.md`, the effect sections of `VERIFICATION.md`) are retained as history
only.

What replaced them:

* **Type-led hero**: Rockville script accent over Rajdhani, no canvas, no scroll hijacking. The
  hero headline is a plain statement of what the station is ("Nairobi's own community station")
  with the frequency set in Rockville.
* **Real navigation**: sticky header, active-route state, "Explore" dropdown, mobile drawer.
* **Persistent audio**: one `<audio>` element in the root layout; a single transient Zustand
  store survives client-side navigation and never fabricates listener numbers or songs.
* **Genuine filters**: category buttons and search on shows, podcasts and stories; day tabs on
  the schedule. All state is URL-addressable where it matters (`?day=`, `?q=`).
* All movement respects `prefers-reduced-motion`.

## 5. Copy voice

The first pass wrote in a recognisable "assistant" register. The rules now applied across
`src/`, `content/` and the docs:

* **No em dashes.** Every `—` was rewritten as a full stop, colon, comma or bracket. Where a range
  is genuinely a range, an en dash without spaces is used and only inside a time or number pair
  (`05:00–09:00`, `34,000–71,000`). `grep -rn "—" .` outside `design-source/` returns nothing.
* **No staccato headlines.** Two- and three-fragment lines ending on a full stop ("Your time. Your
  play button.", "Be heard. Belong here.", "Good music. Real voices. Your Nairobi.") were replaced
  with the plainest accurate description of the page: "Advertise with Silas Radio", "The listening
  library", "Contact the studio", "The weekly schedule".
* **Section labels are labels.** Eyebrows read "Programmes", "On demand", "Newsletter",
  "Community desk", "Inside the studio", not "A little radio in your inbox" or "Good company, on
  your time". The square dot that preceded each eyebrow was removed along with the outlined ghost
  "91.7" numeral behind the page heroes.
* **No decorative vagueness.** "Nothing on this frequency yet" became "No matches"; "A little off
  the dial" became "Page not found"; the footer's "Same city. New discoveries." became the station
  name and city.

## 6. Honesty rules baked into the UI

* The player, `/listen`, `/podcasts` and every episode page state that the audio is **demo audio**
  from the design archive whenever `NEXT_PUBLIC_STREAM_URL` is not configured.
* `/api/now-playing` reports `source: "schedule"` (or `"demo"`) instead of inventing a song and
  artist. With `NOW_PLAYING_API_URL` set, real upstream metadata is used.
* Contests show an explicit "entries closed" state; `/api/contest` returns `410` for the closed
  giveaway and `404` for unknown slugs.
* Forms report a preview/undelivered state when KV and SMTP are not configured, instead of
  claiming the studio received a message.
* `/register` explains that accounts are not available and holds no form.
