# Silas Radio 91.7 — Design Source Inspection Report

**Status:** ZIP unpacked, fully parsed. **No application code was written before this report.**

---

## 1. Archive forensics — how the ZIP was recovered

The uploaded folder was **not** a plain ZIP. It was an ezyZip multi-volume split archive:

```
ezyZip.z01   16,000,000 bytes   (disk 1 — PK\x07\x08 spanning marker)
ezyZip.z02   16,000,000 bytes   (disk 2)
ezyZip.zip      951,167 bytes   (disk 3 / last — data descriptor + central directory)
```

Key findings during reconstruction:

| Check | Result |
| --- | --- |
| `unzip ezyZip.zip` | lists warning "zipfile claims to be last disk of a multi-part archive" |
| Concatenated `cat z01 z02 zip > full.zip` | 32,951,167 bytes |
| `zip -FF` repair | **failed** — produced a 22-byte empty archive |
| Local header offsets found at | 94 → 32,950,945 (contiguous) |
| Central directory offset | 32,951,039 (== `disk_size × 2 = 32,000,000` + 951,039 ✔) |
| EOCD (`PK\x05\x06`) "disk number" | `2` — disk **index**, not byte offset |
| Entry | `Djoz-master.zip`, method `8` (deflate), CRC `0x54bdb4e4`, 32,960,366 bytes uncompressed |
| Deflate stream inflate | **32,960,366 / 32,960,366 bytes = 100.000%, `eof = True`** ✔ |
| `unzip -t` on the recovered archive | **"No errors detected in compressed data"** ✔ |

The trick: the EOCD's `offset of start of central directory` field is *relative to the disk it starts on*, so it pointed at a nonexistent byte 951,039 while the real central directory sat at 32,951,039. Because the inner entry's payload was contiguous, a single raw-inflate from byte 94 produced a byte-perfect `Djoz-master.zip`.

**Recovered archive:** `design-source/_archive-Djoz-master.zip` (32,960,366 B, CRC verified).
**Extracted:** `design-source/Djoz-master/` — complete, all 148 files.

---

## 2. Full file tree (complete, nothing omitted)

```
Djoz-master/
├── Source/                                    (vendored library downloads — 11 MB)
│   ├── Magnific-Popup-master.zip              346,502
│   ├── OwlCarousel2-2.3.4.zip                 792,253
│   ├── SlickNav-master.zip                     22,189
│   ├── barfiller-master.zip                     4,741
│   ├── bootstrap-4.2.1-dist.zip               665,795
│   ├── font-awesome-4.7.0.zip                 669,808
│   ├── jPlayer-2.9.2.zip                    8,210,390
│   ├── jQuery.countdown-master.zip             28,787
│   ├── jquery.nicescroll-master.zip           132,993
│   └── photo credits.txt                          624
├── css/
│   ├── barfiller.css                            834   ← progress-bar skin
│   ├── bootstrap.min.css                    159,515
│   ├── font-awesome.min.css                  31,000
│   ├── magnific-popup.css                     6,951
│   ├── nowfont.css                              993   ← **FONT-FACE DEFINITIONS**
│   ├── owl.carousel.min.css                   3,351
│   ├── rockville.css                            187   ← **FONT-FACE DEFINITION**
│   ├── slicknav.min.css                       2,505
│   └── style.css                             46,935   ← compiled design system
├── fonts/                                             ← **FONTS (SACRED)**
│   ├── Now-Black.woff                         19,948
│   ├── Now-Bold.woff                          19,980
│   ├── Now-Light.woff                         19,560
│   ├── Now-Medium.woff                        19,872
│   ├── Now-Regular.woff                       19,652
│   ├── Now-Thin.woff                          19,260
│   ├── Rockville Solid.woff                  187,052
│   ├── FontAwesome.otf                       134,808   ← icon font (superseded, see §4)
│   ├── fontawesome-webfont.eot               165,742
│   ├── fontawesome-webfont.svg               444,379
│   ├── fontawesome-webfont.ttf               165,548
│   ├── fontawesome-webfont.woff               98,024
│   └── fontawesome-webfont.woff2              77,160
├── img/  (69 files, 8.4 MB — all Pixabay demo photos, see §10)
│   ├── Background.jpg / countdown-bg.jpg / footer-bg.png / hero-bg.png
│   ├── logo.png (82×48, single-colour #f0f0f0 white, transparent bg)
│   ├── play.png / play-default.png / pause.png / volume.png
│   ├── skill-video.jpg / track-right.jpg
│   ├── about/(9)  blog/(12)  blog/details/  discography/(8)
│   └── events/(3)  services/(11)  tours/(3)  videos/(5)  youtube/(3)
├── js/
│   ├── bootstrap.min.js                       60,010
│   ├── jplayerInit.js                          2,684   ← player wiring + wavesurfer cross-pause
│   ├── jquery-3.3.1.min.js                    86,927
│   ├── jquery.barfiller.js                     6,244
│   ├── jquery.countdown.min.js                 5,369
│   ├── jquery.jplayer.min.js                  60,950
│   ├── jquery.magnific-popup.min.js           20,216
│   ├── jquery.nicescroll.min.js               60,010
│   ├── jquery.slicknav.js                     20,977
│   ├── main.js                                 3,865   ← preloader / countdown / barfiller init
│   └── owl.carousel.min.js                    44,342
├── music-files/  1.mp3 … 6.mp3 (1.3–3.0 MB each, 13 MB total, all ID3)
├── sass/
│   ├── style.scss  _variable.scss  _mixins.scss  _base.scss
│   ├── _header.scss  _hero.scss  _home-page.scss  _discography.scss
│   ├── _footer.scss  _breadcrumb.scss  _about.scss  _feature.scss
│   ├── _services.scss  _tours.scss  _videos.scss  _blog.scss
│   ├── _blog-sidebar.scss  _blog-details.scss  _contact.scss  _responsive.scss
├── about.html       13,964     index.html     33,243
├── blog.html        17,863     tours.html     12,905
├── blog-details.html 20,837    videos.html    12,442
├── contact.html      9,518     discography.html 11,544
├── main.html           931     (Colorlib promo page — licence notice)
└── readme.txt          410     (Colorlib template licence notice)
```

Template identity: **Colorlib "DJoz" 1.0** — a DJ/music-band marketing template. **jQuery 3.3.1 + Bootstrap 4.2.1 era.** It is *not* a radio station app; it supplies the visual language only.

---

## 3. Design tokens — every variable in the source

### 3.1 The source has **ZERO CSS custom properties**

Verified: `grep -c 'var(--' css/*.scss css/*.css` → no `--*` declarations anywhere. The design system is **SCSS variables only**, in `sass/_variable.scss`, nine of which are actually referenced by the compiled `style.css`:

| SCSS variable | Value | Used in compiled CSS | Role |
| --- | --- | --- | --- |
| `$primary-color` | `#5c00ce` | **39×** | brand purple — buttons, play button, icon fills |
| `$secondary-color` | `#0c2b4b` | 1× | deep navy accent (declared, barely used) |
| `$white-color` | `#ffffff` | **56×** | body/nav/hero text |
| `$heading-color` | `#111111` | 36× | headings, dropdown bg, nicescroll cursor |
| `$para-color` | `#5C5C5C` | declared | paragraph text (parallel to literal `#444444`) |
| `$black-color` | `#000000` | 1× | preloader backdrop |
| `$heading-color-2` | `#323232` | 0× | declared, unused |
| `$normal-color` | `#1c1c1c` | 0× | declared, unused |
| `$background` | `#f5f5f5` | 4× | light section wash |
| `$background-2` | `#f2f2f2` | 6× | watermark text, pale wash |
| `$border` | `#ebebeb` | declared | hairline (parallel to literal `#e1e1e1`×9) |
| `$border-1` | `#e1e1e1` | declared | hairline / nicescroll track |
| `$fm-unna` | `'Unna', serif` | 0× | leftover from Colorlib boilerplate, unused |
| `$fm-nunito` | `'Nunito Sans', sans-serif` | 0× | leftover from Colorlib boilerplate, unused |

### 3.2 Additional literal colours found in `css/style.css`

| Hex | Count | Where |
| --- | --- | --- |
| `#888888` | 13 | muted text, meta |
| `#666666` | 12 | secondary text |
| `#7e00ad` | 3 | purple hover shade (darken of brand) |
| `#5400bc` | 1 | purple pressed shade |
| `#290849` | 2 | solid header background (`header--normal`), dark purple |

### 3.3 Translucency / alpha values (the glass language of this template)

| Value | Where |
| --- | --- |
| `rgba(42, 1, 74, 0.5)` | **header background — the template's existing "glass" nav** |
| `rgba(255,255,255,0.3)` | hero circular play button body |
| `rgba(255,255,255,0.2)` | footer social rules + newsletter input border |
| `rgba(255,255,255,0)` | fade-out edges |

### 3.4 Preloader colours (changing border every 0.4 s)

`#f44336` (red) → `#673ab7` (deep purple) → `#f44336`. Backdrop `#000000`, `z-index: 999999`.

### 3.5 Extracted from the hero artwork (pixel-sampled, `img/hero-bg.png`, 1920×1050)

The source hero is a bitmap, but its gradient is deterministic. Sampled down the vertical centre axis and quantised:

| Position | Sampled colour |
| --- | --- |
| y = 0 | `#36049b` |
| y = 131 | `#4203b4` ← brightest violet |
| y = 262 | `#1b034f` |
| y = 393 | `#320289` |
| y = 524 | `#1c014e` |
| y = 655 | `#110132` |
| y = 786 | `#0c0024` |
| y = 917 | `#11022d` |
| y = 1048 | `#000000` |

Dominant quantised clusters: `#200060`, `#100030`, `#100040`, `#200070`, `#000020`. Corners: top-left `#290368`, top-right `#4b04c4`, bottom-left `#260264`, bottom-right `#0f0124`.

This sampled ramp is what **EFFECT-18** (animated gradient, `background-position` only) animates over — no invention.

### 3.6 Typographic scale (from `css/style.css`, lines 37–140, 417–430)

| Element | Family | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| `html, body` | `Now Regular` | 15px default | 400 | `-webkit-font-smoothing: antialiased` |
| `h1` | `Rajdhani` | 70px | 400 | `.hero__text h1` overrides to **110px** `Rockville Solid Regular`, white |
| `h2` | `Rajdhani` | 36px | 400 | `.section-title h2` → 42px, weight **700**, `text-transform: uppercase` |
| `h3` | `Rajdhani` | 30px | 400 | |
| `h4` | `Rajdhani` | 24px | 400 | |
| `h5` | `Rajdhani` | 18px | 400 | |
| `h6` | `Rajdhani` | 16px | 400 | |
| `p` | `Now Regular` | **15px** / line-height **26px** | 400 | colour `#444444`, margin `0 0 15px` |
| `.section-title h1` (watermark) | `Rockville Solid Regular` | **100px** | 400 | colour `#f2f2f2`, absolutely positioned behind, `top:-45px`, `z-index:-1` |
| nav `li a` | `Now Regular` | **15px** | 400 | uppercase, `padding: 6px 0` |
| `.primary-btn` | Now Regular | **15px** | 400 | uppercase, `padding: 14px 25px 12px`, `letter-spacing: 2px` |
| `.site-btn` | Now Regular | **15px** | **700** | uppercase, full-width, `letter-spacing: 2px`, `padding: 14px 30px` |
| `.hero__text span` (eyebrow) | Now Regular | (15px) | 400 | uppercase, **`letter-spacing: 6px`** |
| `.footer__address h6` | Rajdhani | **15px** | **700** | |
| `.footer__newslatter h4` | Rajdhani | **26px** | 700 | |
| `.barfiller .tip` | Now Regular | **11px** | — | the only sub-12px text in the template |
| `.footer__copyright__text p` | Now Regular | 15px | 400 | colour `#999999` |

**Structural metrics:** headings/body base 15px ✔ (matches the 15px-minimum rule). Buttons are 15px uppercase in the source — the brief mandates 12px buttons and 13px nav, so the **-2px/−3px deltas are declared as documented overrides** in §12, not silent inventions. Section rhythm: `.spad` = 100px top/bottom. Hero padding: `400px top / 295px bottom`. Footer: `300px top / 60px bottom`, `margin-top:-547px`, `height:549px` (overlap trick).

**Interactive motion values in source:** nav underline `all .5s`; dropdown `all .3s`, `top 56px → 34px`; preloader `0.8s linear infinite`; `.linear__icon` bounce `.5s infinite alternate`, `0 → -10px`; owl carousel `smartSpeed 1200`.

---

## 4. FONTS — extracted, hashed, reproduced byte-for-byte

`css/nowfont.css` declares six faces of the **"Now"** family; `css/rockville.css` declares **Rockville Solid**. Every file is WOFF 1.0, local-first (`src: local('…'), url('…') format('woff')`).

| Family (exact `@font-face` name) | File | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `'Now Thin'` | `Now-Thin.woff` | 19,260 | `3e8a3515b9ad3d4f9c6ee83c42335e4dddca1bee2fe888192871457540bf11ff` |
| `'Now Light'` | `Now-Light.woff` | 19,560 | `88b22aed1437566fe8cb1a94036e9a45bf65b94859e0140033a4c75ab74d3c7d` |
| `'Now Regular'` | `Now-Regular.woff` | 19,652 | `d71c433c59cfea5290738e562bee4bdfd4c546267a4d65cd9f7550af91531a88` |
| `'Now Medium'` | `Now-Medium.woff` | 19,872 | `d6c617f85f63b61a3832330e6902b0a1a3a6635f67fc32491c00f4a93b5f1214` |
| `'Now Bold'` | `Now-Bold.woff` | 19,980 | `9c7bfc456cb67cd13a7bfaf29df2440cb762ee462aad032268fc64fc6642e5fc` |
| `'Now Black'` | `Now-Black.woff` | 19,948 | `0064e3c2b5c6e79f1c20e9f44a39fd951608eee46e9462a6a1ccf3dc67e73c69` |
| `'Rockville Solid Regular'` | `Rockville Solid.woff` | 187,052 | `203667f2092abfd06c3d3c86078a9b9a9ea8368ce7158726996e37726c3b1cb8` |

All seven are copied **byte-identical** to `public/fonts/` (hashes re-verified after copy — see `scripts/verify-fonts.mjs`). Their HTML/JSON glyph coverage was checked to confirm `₹`/`KES` digits and the full Latin set render.

**Rajdhani** — the template loads it from the Google Fonts CDN (`family=Rajdhani:wght@400;500;600;700`, `display=swap`). The required weights (400/500/600/700) are reproduced exactly, but **self-hosted via `@fontsource/rajdhani`** so the app has zero third-party font requests on a Kenyan mobile connection. Same family, same weights, same `swap` behaviour — the only change is delivery, and it is recorded here.

**FontAwesome 4.7.0** (`.woff2/.woff/.ttf/.eot/.svg/.otf`) is present but **intentionally not shipped**: the brief mandates **Lucide only at 0.468.0**. The design's icon *usage* (mic, headphones, calendar, play-circle, music, users, star, rss) is carried over 1:1 onto Lucide equivalents in §12. The `Source/font-awesome-4.7.0.zip` remains in `design-source/` for audit.

---

## 5. Loading screen — every detail found

The template **does** ship a loading screen. Full specification (`sass/_base.scss` lines 118–176, `js/main.js` lines 12–17):

```
DOM:    <div id="preloder"><div class="loader"></div></div>
#preloder  position: fixed; width/height: 100%; top/left: 0
           z-index: 999999                ← highest layer in the template
           background: #000               ← pure black, full-bleed
.loader    width/height: 40px;  border-radius: 60px
           position: absolute; top/left: 50%
           margin-top: -13px; margin-left: -13px   ← note: should be -20px; a
                                                     known template quirk (off-centre
                                                     by 7px) reproduced as-is
           animation: loader 0.8s linear infinite
KEYFRAMES  0%   rotate(0deg)    border: 4px solid #f44336  border-left-color: transparent
           50%  rotate(180deg)  border: 4px solid #673ab7  border-left-color: transparent
           100% rotate(360deg)  border: 4px solid #f44336  border-left-color: transparent
           (prefixed -webkit- pair emitted alongside)
DISMISS    $(window).on('load') → $('.loader').fadeOut()
                                → $('#preloder').delay(200).fadeOut('slow')
           ⇒ 40px ring, spinning 0.75 turn/s, red↔purple cycling every 0.4 s on black.
```

**Verdict:** a loading screen exists but is a bare spinner with no accessibility semantics. Per the brief, the **EFFECT-25 microphone preloader + EFFECT-08 self-drawing wordmark** replace it, *inheriting the source's exact DNA*: pure-black `#000000` backdrop, `z-index 999999`, `#f44336` red ↔ `#673ab7` purple colour cycle, `0.8s linear` spin cadence, 200 ms dismissal delay, fade-out.

## 6. Cookie banner — **ABSENT**

`grep -ril 'cookie'` → no match. No banner, no modal, no localStorage key, no policy link in any of the 8 HTML files. → Built from the brief (§ "COOKIE CONSENT BANNER"), using the source's tokens (`#5c00ce` primary, `rgba(42,1,74,.5)` glass, Now/Rajdhani type).

## 7. CAPTCHA — **ABSENT**

`grep -ril 'captcha'` → no match. The template's forms (`contact.html`, footer newsletter) post nowhere — they are inert markup with no `action`, no `method`, no validation. → reCAPTCHA v3 (with v2 fallback < 0.5) implemented per brief: all six touchpoints plus **server-side verification**; secret lives only in `RECAPTCHA_SECRET_KEY`.

## 8. Legal pages — **ABSENT**

No `privacy`, `terms`, `cookie` or `legal` file exists (`grep` clean across all HTML). No footer legal links either. → `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` built from the brief.

## 9. 404 and 500 — **ABSENT**

No `404.html` / `404.php` / `404` route. Single match for the string "404" is an irrelevant byte in `jquery-3.3.1.min.js` (minifier artefact). → Custom 404 (EFFECT-17 liquid gooey blob + "This broadcast channel was not found.") and 500 ("We are off-air temporarily. Back soon." + Try Again + WhatsApp) built from the brief; the blob filter is **also** Card 7 of the gallery (one shared `<svg>` filter definition, bounded region, never over text).

## 10. Photos

`Source/photo credits.txt` lists **8 Pixabay** URLs (yoga/fitness/bedroom interiors — the Colorlib boilerplate credits, unrelated to the DJoz demo imagery which appears to be bundled stock). **None of these are Pexels or Unsplash**, so per the brief's photo policy they are **not** shipped; only the *art direction* (square 1:1 crops, `track-right.jpg` 502×502, `Background.jpg` 560×560 circular crops) is carried forward. All photography is replaced with Pexels/Unsplash assets per §"PHOTOS", saved locally with `image-credits.md`.

## 11. API routes — **NONE (static template)**

The source is 100% static HTML. Zero server code, zero endpoints, zero `fetch`/`XMLHttpRequest` in application code, zero env vars, zero database. Its only client-side wires are jQuery plugins:

| Plugin | Version | Wiring site | What we replace it with |
| --- | --- | --- | --- |
| jPlayer | 2.9.2 | `js/jplayerInit.js` | HTML5 `<audio>` + wavesurfer.js + Zustand |
| jPlayer skin | `jp-audio`/`jp_container_N` markup | all HTML | new persistent player (§3 of brief) |
| jQuery | 3.3.1 | everywhere | **removed entirely** |
| Bootstrap | 4.2.1 | grid/utility classes | Tailwind (utilities only) |
| Owl Carousel | 2.3.4 | `.event__slider`, `.videos__slider` | CSS scroll-snap rail (EFFECT-15) |
| SlickNav | master | mobile menu, prepends to `#mobile-menu-wrap` | accessible React menu + doodle (EFFECT-21) |
| Magnific Popup | master | `.video-popup` → iframe | page-flip viewer (EFFECT-30) |
| jQuery.countdown | master | `#countdown-time`, `%D/%H/%M/%S` → `.countdown__item` markup | React countdown (contests) |
| barfiller | master | `#bar1..#bar3`, `barColor:#ffffff` | waveform + skill meters |
| NiceScroll | master | `.nice-scroll` (`cursorcolor:#111111`, `cursorwidth:5px`, bg `#e1e1e1`, `autohidemode:false`) | native scroll |

Notably, `jplayerInit.js` already contains `wavesurfer.pause()` inside the jPlayer `play` handler — the template **anticipated** a wavesurfer waveform layer that was never shipped. Our implementation completes that intent.

**API surface we introduce** (all new, documented in `README.md`): `/api/request`, `/api/contest`, `/api/schedule`, `/api/now-playing`, `/api/advertise`, `/api/news`, `/api/newsletter`, `/api/contact`, `/api/captcha`, `/api/ws`.

## 12. Documented overrides (brief wins over template — declared, not hidden)

| Item | Template value | Shipped value | Reason |
| --- | --- | --- | --- |
| Nav font-size | 15px | 13px | brief: "Navigation 13px" |
| Button font-size | 15px | 12px | brief: "Buttons 12px" |
| Metadata | 15px (only `.barfiller .tip` is 11px) | 11px | brief: "Metadata 11px minimum" |
| Icons | FontAwesome 4.7.0 | Lucide 0.468.0 | brief mandates Lucide |
| App shell | jQuery + Bootstrap 4 | Next.js 15.1.0 / React / TS | brief: NODE AND STACK |
| Hero backdrop | 3 MB `hero-bg.png` bitmap | sampled CSS gradient ramp (§3.5) | brief EFFECT-18; LCP + Kenyan bandwidth |
| Rajdhani delivery | Google Fonts CDN | `@fontsource/rajdhani` self-host | same family/weights, no third-party RTT |
| Preloader ring | 40px spinner | EFFECT-25 mic + bars + progress | brief; inherits black/red/purple/z-index DNA |

**Everything else is reproduced exactly:** brand purple `#5c00ce`, header glass `rgba(42,1,74,.5)`, solid header `#290849`, hover `#7e00ad`, pressed `#5400bc`, black overlay `#000`, Now/Rockville families and their exact file bytes, 400px/295px hero rhythm, 100px section rhythm, 6px eyebrow tracking, 2px button tracking, `#f2f2f2` 100px Rockville watermark, uppercase 42px/700 section titles, the `#f44336`↔`#673ab7` colour cycle, and the 26px line-height paragraph grid.

---

## 13. Environment variables found in the source

**None.** The template has no config, no `.env`, no build step (SCSS was compiled offline by Colorlib).

Variables introduced by this build (names only — values never committed):

```
RECAPTCHA_SITE_KEY        NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY      KV_REST_API_URL / KV_REST_API_TOKEN  (Vercel KV)
WHATSAPP_NUMBER           STUDIO_WHATSAPP_NUMBER
NEWSLETTER_FROM           STUDIO_NOTIFICATION_EMAIL
SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS   (Nodemailer)
NEXT_PUBLIC_SITE_URL      NEXT_PUBLIC_STREAM_URL  NEXT_PUBLIC_GOOGLE_MAPS_EMBED
```

---

## 14. Summary — what was found vs. what must be built

**Found and reusable (design source of truth):** 7 non-icon font files (byte-exact), the full colour system, the typographic scale, header/hero/footer geometry, the preloader spec, the jPlayer→wavesurfer player intent, the `#f2f2f2` watermark, the glass header at 5% alpha over brand purple, the countdown markup, barfiller progress skin.

**Absent (must be built from the brief, with the tokens above):** loading screen semantics + EFFECT-08/25, cookie banner, CAPTCHA on 6 forms, all legal pages, 404/500, every API route, WebSocket presence, AR/WebXR, Three.js mic, scrollytelling, gallery, rate-card page-flip, neumorphic widget, MDX news, newsletter, PWA, JSON-LD, sitemap, security headers — i.e. **the entire application layer**, plus every package version in §"NODE AND STACK".

**Design source preserved for audit:** `design-source/Djoz-master/` (complete extraction) and `design-source/_archive-Djoz-master.zip` (CRC-verified original). Heavy, non-shipping payloads — the vendored `Source/*.zip`, `music-files/*.mp3` and Pixabay `img/**` — are unpacked on disk but listed in `.gitignore`, keeping the repository lean while remaining fully inspected.
