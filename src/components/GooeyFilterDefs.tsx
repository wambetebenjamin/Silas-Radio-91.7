/**
 * EFFECT-17 — shared liquid gooey blob SVG filter.
 *
 * Mounted once at the root and referenced by `filter: url(#sr-gooey-filter)`
 * from:
 *   - gallery card 7 (hover blob)
 *   - the 404 page ("This broadcast channel was not found.")
 *
 * The filter region is bounded explicitly (`x/y/width/height` with generous
 * but finite margins) so it never paints outside its own box, and it is only
 * ever applied to decorative SVG shapes — never to text.
 */
export function GooeyFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id="sr-gooey-filter"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          {/* bounded blur */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          {/* contrast pass creates the gooey merge */}
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 20 -9"
            result="goo"
          />
          {/* re-apply the original graphic so edges stay crisp */}
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
