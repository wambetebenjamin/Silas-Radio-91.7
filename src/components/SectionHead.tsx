/**
 * Section heading reproduced from the design source:
 *  - 42px / 700 uppercase Rajdhani heading
 *  - 100px Rockville Solid ghost word behind it at top: -45px, colour #f2f2f2
 *  - optional 6px-tracked eyebrow (source `.hero__text span`)
 */
export function SectionHead({
  title,
  ghost,
  eyebrow,
  light = false,
  align = 'left',
  id,
  as = 'h2',
}: {
  title: string;
  ghost?: string;
  eyebrow?: string;
  light?: boolean;
  align?: 'left' | 'center';
  id?: string;
  /** Page-level headings use h1; section headings inside a page use h2. */
  as?: 'h1' | 'h2';
}) {
  const Heading = as;
  return (
    <div
      className={`sr-section-head ${light ? 'sr-section-head--light' : ''}`}
      style={{ textAlign: align }}
    >
      {ghost ? (
        <p className="sr-section-head__ghost" aria-hidden="true">
          {ghost}
        </p>
      ) : null}
      {eyebrow ? <span className="sr-eyebrow">{eyebrow}</span> : null}
      <Heading id={id}>{title}</Heading>
    </div>
  );
}
