import { SectionHead } from './SectionHead';
import {
  CollageCard,
  DoodleCard,
  GooeyCard,
  IsometricCard,
  MascotCard,
  MorphCard,
  SignalWavesCard,
  StopMotionCard,
  VinylCard,
  WordmarkCard,
} from './GalleryCards';

/**
 * 7. Broadcasts gallery — the 10-card gallery.
 *
 * Card order and effects exactly as specified:
 *   1 EFFECT-07 signal waves · 2 EFFECT-08 wordmark · 3 EFFECT-09 morph
 *   4 EFFECT-13 mascot · 5 EFFECT-14 faux-3D vinyl · 6 EFFECT-16 collage
 *   7 EFFECT-17 gooey blob · 8 EFFECT-19 isometric assembly · 9 EFFECT-21 doodle
 *   10 EFFECT-31 stop-motion sprite
 *
 * Layout: 3 columns desktop, 2 columns tablet, 1 column mobile.
 */
const CARDS = [
  {
    id: 'effect-07',
    title: 'Signal waves',
    blurb: 'Line-art tower with signal waves looping while the card is in the viewport.',
    Art: SignalWavesCard,
  },
  {
    id: 'effect-08',
    title: 'Self-drawing wordmark',
    blurb: 'The SILAS RADIO wordmark draws itself stroke by stroke, on demand.',
    Art: WordmarkCard,
  },
  {
    id: 'effect-09',
    title: 'Icon morph',
    blurb: 'Mic, headphones and speaker morph between matched points, reversing on mouse-out.',
    Art: MorphCard,
  },
  {
    id: 'effect-13',
    title: 'Station mascot',
    blurb: 'Our cartoon DJ reacts to hover and focus — watch the arm and the disc.',
    Art: MascotCard,
  },
  {
    id: 'effect-14',
    title: 'Faux-3D vinyl',
    blurb: 'Stacked CSS layers tilt with your pointer. No WebGL, no 3D library.',
    Art: VinylCard,
  },
  {
    id: 'effect-16',
    title: 'Nairobi collage',
    blurb: 'Skyline cut-out, radio tower vector and a grain overlay, mixed by hand.',
    Art: CollageCard,
  },
  {
    id: 'effect-17',
    title: 'Liquid blob',
    blurb: 'A gooey SVG filter that merges and separates on hover — the same filter as our 404 page.',
    Art: GooeyCard,
  },
  {
    id: 'effect-19',
    title: 'Studio isometric',
    blurb: 'The studio interior assembles on scroll along true 120-degree isometric axes.',
    Art: IsometricCard,
  },
  {
    id: 'effect-21',
    title: 'Note doodles',
    blurb: 'Hand-drawn musical notes and sound waves, kept clear of every label.',
    Art: DoodleCard,
  },
  {
    id: 'effect-31',
    title: 'Stop-motion vinyl',
    blurb: 'A record spins and the needle drops — 12 frames, one sprite sheet, halts off-screen.',
    Art: StopMotionCard,
  },
] as const;

export function Gallery() {
  return (
    <section className="spad" id="gallery" aria-labelledby="gallery-heading" style={{ background: '#0b0018' }}>
      <div className="sr-container">
        <SectionHead
          id="gallery-heading"
          eyebrow="Craft"
          ghost="GALLERY"
          title="Broadcasts gallery"
          light
        />
        <p className="sr-lead !text-white/70 mb-8">
          Ten pieces built from the station's own visual language. Every one of them has a
          reduced-motion fallback, and none of them are required to use the site.
        </p>

        <ul className="sr-gallery">
          {CARDS.map(({ id, title, blurb, Art }) => (
            <li key={id}>
              <article className="sr-gcard" tabIndex={0} aria-labelledby={`gallery-${id}`}>
                <Art />
                <div className="sr-gcard__body">
                  <h3 id={`gallery-${id}`}>{title}</h3>
                  <p>{blurb}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { MascotCard };
