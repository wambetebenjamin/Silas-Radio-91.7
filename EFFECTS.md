# EFFECTS.md: archive note

**This document describes the first pass of this project and is retained for history only.**

The original build implemented 31 numbered effects (WebGL microphone hero, pinned scrollytelling,
AR studio tour, gooey filter defs, preloader, particle waveform, claymorphic panels) on a single
long homepage. Those components and their dependencies (`three`, `wavesurfer.js`) were removed when
the site was split into real pages; see **[docs/DESIGN.md](./docs/DESIGN.md)** §4 for what replaced
them and why.

The `EFFECT-NN` tokens no longer exist in `src/`, so `grep -rn "EFFECT-" src/` returns nothing.
Motion in the current build is limited to:

| Area | Motion | Reduced-motion behaviour |
| --- | --- | --- |
| Hero | Rockville accent line, staggered headline reveal | Static headline |
| Cards and links | Hover lift, arrow slide | Instant state change |
| Schedule | Day-tab switching, "on air now" pulse on the status dot | Dot stops pulsing |
| Player | Progress bar and equaliser-adjacent idle animation | Static indicators |
| Cookie banner / nav drawer | Opacity and transform transitions | No transition |

The single `@media (prefers-reduced-motion: reduce)` block at the end of `src/app/globals.css`
shortens every animation and transition in the build.
