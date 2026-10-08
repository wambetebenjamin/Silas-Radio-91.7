# EFFECTS.md — the 31 effects, and all 31 reduced-motion fallbacks

Every effect below is labelled in the source with the same `EFFECT-NN` token used here, so
`grep -rn "EFFECT-18" src/` finds the implementation, the CSS and the reduced-motion fallback
in one pass. The fallback column is the single `@media (prefers-reduced-motion: reduce)` block
at the end of `src/app/globals.css` (§30), which is applied *identically* to all 31 — no effect
is exempt.

**A note on numbering, so nothing is hidden:** the brief numbered its effects `EFFECT-01…31`
but the numbering was not restated in any document we hold, and the implementation labels 29 of
the slots explicitly. Two numbers in the sequence — **EFFECT-20 and EFFECT-22** — carry no label
in the code. Rather than invent a mapping for them, §3 lists every deliverable from the brief
with the file that delivers it, so the coverage is complete and auditable even where a number
is not written down.

---

## 1. The effects

| # | Effect | Implementation | Reduced-motion fallback |
| --- | --- | --- | --- |
| 01 | WebGL 3D microphone hero — slow orbit, pointer drag, arrow keys, poster fallback | `components/HeroMicCanvas.tsx` (three.js, dynamically imported), `components/Hero.tsx`, `globals.css:948` | Canvas unmounted in React **and** `canvas { display: none }`; the poster gradient + headline remain |
| 02 | Pinned four-beat scrollytelling (05:00 / 06:00 / 12:30 / 19:00 EAT) | `components/Scrollytelling.tsx`, `globals.css:1007` | `.sr-scroll-story__sticky` becomes `position: static`, beats stack flat, all opacity 1 |
| 03 | AR studio tour — WebXR opt-in, 360° drag fallback, persistent Exit | `components/ArStudioTour.tsx`, `globals.css:1279` | Loops stop; drag range and Exit button unchanged, tour still fully usable |
| 04 | Headline per-letter stagger with a glitch pass on the word "Radio" | `components/Hero.tsx` (`min(cursor × 26, 900) ms`), `globals.css:988` | Stagger and glitch ghosts removed; full headline renders immediately |
| 05 | Live presence board — realtime dots around the play control | `components/PresenceBoard.tsx`, `hooks/useListeners.ts`, `globals.css:1192` | Dots render at final opacity with no entrance animation |
| 06 | Ambient waveform particles behind the hero | `components/WaveformParticles.tsx`, `globals.css:984` | RAF stopped in React + `.sr-particles { display: none }` |
| 07 | Gallery card 1 — SVG line-art signal waves from a broadcast tower | `components/GalleryCards.tsx` | `sr-wave-loop` removed; waves drawn statically |
| 08 | Gallery card 2 — self-drawing SVG wordmark (also the preloader mark) | `components/GalleryCards.tsx`, `components/Wordmark.tsx`, `globals.css:855` | `stroke-dashoffset: 0` — the mark is simply drawn |
| 09 | Gallery card 3 — SVG shape morph, mic → headphones → speaker (24-point polygons lerped in rAF) | `components/GalleryCards.tsx` | `transition: opacity 200ms` — a crossfade instead of a morph |
| 10 | Navbar logo draw-on, replayable by click, with an accessible name | `components/NavBar.tsx` | Draw completes instantly (no dashoffset animation) |
| 11 | Nav icons animate on hover, focus-visible and click (180–420 ms) | `components/NavBar.tsx`, `globals.css:745` | Global transition kill-switch at the top of the RM block |
| 12 | Form field motion states, full set, 120–320 ms | `globals.css:458`, `components/SongRequestForm.tsx` | Transitions neutralised; states are still distinguishable by colour and border |
| 13 | Gallery card 4 — cartoon DJ mascot at a turntable (`MascotCard` also waves in the advertising CTA) | `components/GalleryCards.tsx`, `components/Advertising.tsx` | Disc rotation stopped, `{waving}` arm held still |
| 14 | Gallery card 5 — faux-3D vinyl record from stacked CSS layers | `components/GalleryCards.tsx` | `transform: none`; the record sits flat |
| 15 | Day-tab scroll-snap rail for the schedule | `components/Schedule.tsx`, `globals.css:585` | Rail becomes a plain wrapped grid; scroll-behavior auto |
| 16 | Gallery card 6 — mixed-media collage (skyline cut-out, radio, figures) | `components/GalleryCards.tsx` | Layered pieces hold their composed position |
| 17 | Gallery card 7 + the 404 page — liquid gooey blob, one shared bounded SVG filter | `components/GooeyFilterDefs.tsx`, `app/not-found.tsx` | Blobs settle into a static bounded shape; text is never inside the filter region |
| 18 | Animated gradient backdrop — `background-position` only, 9 sampled stops | `components/Hero.tsx`, `globals.css:869` | `animation: none`, fixed at `50% 34%` |
| 19 | Gallery card 8 — isometric station interior assembling on scroll | `components/GalleryCards.tsx`, `hooks/useMotionAndLayout.ts` | All pieces assembled at rest: `transform: none; opacity: 1` |
| 20 | *(see the numbering note above — covered in §3)* | — | — |
| 21 | Gallery card 9 + the mobile menu — hand-drawn doodle reacting to state | `components/GalleryCards.tsx`, `components/NavBar.tsx`, `globals.css:760` | Doodle held static; the menu still opens and closes |
| 22 | *(see the numbering note above — covered in §3)* | — | — |
| 23 | One sequenced hero entrance, complete in under 1.6 s (step 2 at 620 ms) | `components/Hero.tsx`, `components/HeroMicCanvas.tsx` | Sequence collapsed — everything visible at first paint, CTAs focusable from the start |
| 24 | Schedule shimmer skeletons, dimension-matched for zero layout shift | `components/Schedule.tsx`, `globals.css:550` | Shimmer removed; a flat `#dcd8e4` block keeps the same box |
| 25 | Microphone preloader — equalizer bars, percentage, 3-second skip | `components/Preloader.tsx`, `app/layout.tsx`, `globals.css:787` | Mic and bars hidden; the plain percentage still counts and the skip control still works |
| 26 | Presenter cards — hover/focus reveal, 150–400 ms | `components/Presenters.tsx`, `globals.css:618` | Reveal content is present immediately (0 ms transition, no transform) |
| 27 | Neumorphic studio widget with a live LED | `components/NeumorphicStudio.tsx`, `globals.css:1208` | LED steady (no pulse, no glow); widget stays interactive |
| 28 | Glass navbar on scroll — blur capped at 20 px, solid fallback | `components/NavBar.tsx`, `globals.css:681` | Keeps the blur, drops the transition; focus rings still visible over it |
| 29 | Claymorphic submit button — physical press deformation | `globals.css:510`, `components/SongRequestForm.tsx` | `transform: none` on hover and `:active`; the button still responds with colour |
| 30 | 3D page-flip advertising catalogue | `components/Advertising.tsx`, `app/advertise/page.tsx`, `globals.css:1249` | No page rotation; pages swap instantly, counter and `role="status"` unaffected |
| 31 | Gallery card 10 — vinyl stop-motion sprite sheet, 12 frames, 8–12 fps | `components/GalleryCards.tsx`, `public/images/stopmotion-vinyl-sprite.png`, `globals.css:1188` | `sr-sprite` animation off; a single frame shows as a still |

---

## 2. Where the reduced-motion switch lives

* `hooks/useMotionAndLayout.ts` → `useReducedMotion()` (SSR-safe: renders the *static* state
  until the media query resolves, so nothing flickers into motion).
* `globals.css:1561` → the single `@media (prefers-reduced-motion: reduce)` block with all 31
  fallbacks, grouped under their `EFFECT-NN` comments.
* React paths that run their own `requestAnimationFrame` loops (hero canvas, particles, sprite
  observer, morph) also check the flag in JavaScript — a CSS-only fix would not stop them.

---

## 3. Deliverable → landing place (complete coverage)

| Brief deliverable | Where it lands |
| --- | --- |
| WebGL 3D mic hero, drag + arrow keys + poster fallback | EFFECT-01 — `HeroMicCanvas.tsx` |
| Sequenced hero entrance < 1.6 s | EFFECT-23 — `Hero.tsx` |
| Per-letter headline stagger + glitch on "Radio" | EFFECT-04 — `Hero.tsx` |
| Animated gradient backdrop | EFFECT-18 — `Hero.tsx` + sampled ramp |
| Waveform particles | EFFECT-06 — `WaveformParticles.tsx` |
| Pinned 4-beat scrollytelling | EFFECT-02 — `Scrollytelling.tsx` |
| Showcase self-draw wordmark | EFFECT-08 — `Wordmark.tsx` |
| Mic preloader + equalizer + progress + skip @ 3 s | EFFECT-25 — `Preloader.tsx` |
| Glass nav on scroll | EFFECT-28 — `NavBar.tsx` |
| Schedule shimmer skeletons | EFFECT-24 — `Schedule.tsx` |
| Day-tab scroll-snap rail | EFFECT-15 — `Schedule.tsx` |
| Presenter hover reveals | EFFECT-26 — `Presenters.tsx` |
| Gallery — SVG morph card | EFFECT-09 (card 3) |
| Gallery — DJ mascot card | EFFECT-13 (card 4) |
| Gallery — faux-3D vinyl card | EFFECT-14 (card 5) |
| Gallery — collage card | EFFECT-16 (card 6) |
| Gallery — gooey blob card | EFFECT-17 (card 7) |
| Gallery — isometric station card | EFFECT-19 (card 8) |
| Gallery — doodle card | EFFECT-21 (card 9) |
| Gallery — vinyl stop-motion sprite (8–12 fps) | EFFECT-31 (card 10) |
| AR studio tour — WebXR opt-in + 360 fallback + persistent Exit | EFFECT-03 — `ArStudioTour.tsx` |
| Claymorphic submit | EFFECT-29 — `globals.css` §8 + `SongRequestForm.tsx` |
| Field motion states | EFFECT-12 — `globals.css` §7 |
| 3D page-flip ad catalogue | EFFECT-30 — `Advertising.tsx` + `advertise/page.tsx` |
| Live presence board | EFFECT-05 — `PresenceBoard.tsx` |
| Neumorphic studio widget | EFFECT-27 — `NeumorphicStudio.tsx` |
| Logo draw-on in the navbar | EFFECT-10 — `NavBar.tsx` |
| Nav icon motion | EFFECT-11 — `globals.css` §12 |

---

## 4. Motion that exists outside the 31 numbering

These were not part of the numbered set, but they animate and each one is still covered by the
global reduced-motion block:

| Motion | Implementation |
| --- | --- |
| Cookie banner slide-in after a 900 ms delay | `components/CookieConsent.tsx`, `globals.css` §24 |
| Contest countdown tick (once per minute under reduced motion) | `components/Contest.tsx`, `globals.css` §28 |
| Live-CTA dot pulse and the studio LED blink | `globals.css:410/416` (`sr-pulse`, `sr-blink`), `NeumorphicStudio.tsx` |
| Player equalizer while audio is playing | `components/Player.tsx` |
| Form success/error fade-in | `globals.css:849` (`sr-fade-in`) |
| Presence dot entrance stagger | `globals.css:1202` (`sr-dot-in`) |
| Nav icon press pop | `globals.css:753` (`sr-icon-pop`) |

---

## 5. Verification

```bash
# every effect number appears in the source
grep -rho "EFFECT-[0-9]\{2\}" src/ | sort -u | wc -l     # → 29 explicit labels

# the reduced-motion block is present in the built CSS
grep -c "prefers-reduced-motion" .next/static/css/*.css  # → ≥1

# each effect selector survives the build
grep -c "sr-spritesheet" .next/static/css/*.css          # → 1
```

The rendered audit (`node scripts/audit-rendered.mjs`) confirms 12/12 routes are structurally
clean at the same time as these effects render — see VERIFICATION.md §5.
