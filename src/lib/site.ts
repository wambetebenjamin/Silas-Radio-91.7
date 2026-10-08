/**
 * Silas Radio 91.7 — station content + configuration.
 *
 * Single source of truth for schedule, presenters, packages, legal metadata
 * and contact details. Everything static lives here so pages stay declarative.
 */

export const SITE = {
  name: 'Silas Radio 91.7',
  shortName: 'Silas Radio',
  frequency: '91.7 FM',
  tagline: 'Nairobi Speaks. Silas Radio Listens.',
  subtext:
    'Live 24 hours. Community stories. East African music. 91.7 FM and online.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://silasradio917.co.ke',
  locale: 'en_KE',
  city: 'Nairobi',
  country: 'Kenya',
  streamUrl:
    process.env.NEXT_PUBLIC_STREAM_URL ?? '/audio/stream/demo-01.mp3',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254112272061',
  whatsappDisplay: '+254 112 272 061',
  /** Spec-mandated deep link used by the floating button and the player shortcut. */
  whatsappLink:
    'https://wa.me/254112272061?text=Hello!%20I%20would%20like%20to%20make%20a%20song%20request%20or%20enquire%20about%20advertising%20on%20Silas%20Radio.',
  whatsappTooltip: 'Request a song or enquire about advertising',
  studioAddress: {
    street: 'Kimathi Street, Studio 4, 3rd Floor',
    locality: 'Nairobi CBD',
    region: 'Nairobi County',
    postalCode: '00100',
    country: 'KE',
    full: 'Kimathi Street, Studio 4, 3rd Floor, Nairobi CBD, Nairobi County, 00100, Kenya',
  },
  phone: '+254 112 272 061',
  email: 'studio@silasradio917.co.ke',
  advertisingEmail: 'advertise@silasradio917.co.ke',
  mapsEmbed:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED ??
    'https://www.google.com/maps?q=Kimathi+Street,+Nairobi,+Kenya&output=embed',
  social: {
    spotify: 'https://open.spotify.com/show/silas-radio-917',
    applePodcasts: 'https://podcasts.apple.com/podcast/silas-radio-917',
    youtube: 'https://www.youtube.com/@silasradio917',
    instagram: 'https://www.instagram.com/silasradio917',
  },
  /** Live listener count shown in the hero and presence board (SSR seed). */
  listenersSeed: 8241,
  presenceSeed: 9014,
} as const;

/* -------------------------------------------------------------------------- */
/*  SHOW SCHEDULE                                                             */
/* -------------------------------------------------------------------------- */

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type Day = (typeof DAYS)[number];

export interface ShowSlot {
  id: string;
  name: string;
  presenter: string;
  presenterSlug: string;
  start: string; // 24h "HH:MM"
  end: string; // 24h, may be "24:00" for midnight
  duration: string; // human readable, source-style
  days: Day[];
  hasRecording: boolean;
  description: string;
}

/** Times in Africa/Nairobi (EAT, UTC+3) — SSR renders real clock data. */
export const TIMEZONE = 'Africa/Nairobi';

export const SCHEDULE: ShowSlot[] = [
  {
    id: 'amaka-early',
    name: 'Amaka Early Drive',
    presenter: 'Mary Wanjiru',
    presenterSlug: 'mary-wanjiru',
    start: '05:00',
    end: '09:00',
    duration: '4 hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hasRecording: true,
    description:
      'Nairobi wakes up with traffic, matatu gospel and the stories shaping the day.',
  },
  {
    id: 'midday-community',
    name: 'Midday Community Hour',
    presenter: 'Zawadi Achieng',
    presenterSlug: 'zawadi-achieng',
    start: '12:00',
    end: '14:00',
    duration: '2 hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hasRecording: true,
    description:
      'Community organisations, county updates and listener call-ins from every estate.',
  },
  {
    id: 'sheng-express',
    name: 'Sheng Express',
    presenter: 'Brian Otieno',
    presenterSlug: 'brian-otieno',
    start: '16:00',
    end: '19:00',
    duration: '3 hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hasRecording: true,
    description:
      'The commute home in Sheng — new East African releases, dedications and shout-outs.',
  },
  {
    id: 'genre-night',
    name: 'Genre Night',
    presenter: 'Grace Muthoni',
    presenterSlug: 'grace-muthoni',
    start: '20:00',
    end: '23:00',
    duration: '3 hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    hasRecording: true,
    description:
      'Benga, afrobeat, gengetone and bongo flava — one genre per night, mixed live.',
  },
  {
    id: 'friday-heat',
    name: 'Friday Heat',
    presenter: 'Kevin Omondi',
    presenterSlug: 'kevin-omondi',
    start: '19:00',
    end: '23:30',
    duration: '4 hours 30 minutes',
    days: ['Friday'],
    hasRecording: true,
    description: 'Nairobi weekend kickoff — DJ sets, road stories and live dedications.',
  },
  {
    id: 'saturday-market',
    name: 'Saturday Market',
    presenter: 'Tom Kariuki',
    presenterSlug: 'tom-kariuki',
    start: '08:00',
    end: '12:00',
    duration: '4 hours',
    days: ['Saturday'],
    hasRecording: false,
    description: 'Live from the market: traders, food, fashion and the sound of the weekend.',
  },
  {
    id: 'nairobi-nights',
    name: 'Nairobi Nights',
    presenter: 'Zawadi Achieng',
    presenterSlug: 'zawadi-achieng',
    start: '21:00',
    end: '24:00',
    duration: '3 hours',
    days: ['Saturday'],
    hasRecording: true,
    description: 'Slow jams and long-form storytelling after dark.',
  },
  {
    id: 'sunday-reflections',
    name: 'Sunday Reflections',
    presenter: 'Mary Wanjiru',
    presenterSlug: 'mary-wanjiru',
    start: '09:00',
    end: '12:00',
    duration: '3 hours',
    days: ['Sunday'],
    hasRecording: true,
    description: 'Faith, family and community service across Nairobi.',
  },
  {
    id: 'diaspora-window',
    name: 'Diaspora Window',
    presenter: 'Brian Otieno',
    presenterSlug: 'brian-otieno',
    start: '15:00',
    end: '17:00',
    duration: '2 hours',
    days: ['Sunday'],
    hasRecording: true,
    description: 'Connecting Nairobi to listeners in the diaspora, live across time zones.',
  },
  {
    id: 'overnight-mix',
    name: 'Overnight Mix',
    presenter: 'Kevin Omondi',
    presenterSlug: 'kevin-omondi',
    start: '00:00',
    end: '05:00',
    duration: '5 hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    hasRecording: false,
    description: 'Non-stop East African music through the night, 91.7 FM.',
  },
];

/* -------------------------------------------------------------------------- */
/*  PRESENTERS                                                                */
/* -------------------------------------------------------------------------- */

export interface Presenter {
  slug: string;
  name: string;
  show: string;
  showDays: string;
  showTimes: string;
  bio: string;
  image: string;
  imageAlt: string;
  /** Decorative geometric fallback tune per spec */
  social: { instagram: string; x: string };
  bookEventsHref: string;
}

export const PRESENTERS: Presenter[] = [
  {
    slug: 'mary-wanjiru',
    name: 'Mary Wanjiru',
    show: 'Amaka Early Drive',
    showDays: 'Monday – Friday',
    showTimes: '05:00 – 09:00 EAT',
    bio: 'Fifteen years on Nairobi breakfast radio. Mary built Amaka Early Drive around matatu routes, market prices and the people who are already awake at 5am.',
    image: '/images/presenters/presenter-mary.jpg',
    imageAlt: 'Presenter Mary Wanjiru speaking into a studio microphone with headphones.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'zawadi-achieng',
    name: 'Zawadi Achieng',
    show: 'Midday Community Hour · Nairobi Nights',
    showDays: 'Monday – Friday · Saturday',
    showTimes: '12:00 – 14:00 · 21:00 – 24:00 EAT',
    bio: 'Community reporter turned host. Zawadi brings residents, ward leaders and CBOs into the same conversation, then slows the city down after dark.',
    image: '/images/presenters/presenter-zawadi.jpg',
    imageAlt: 'Presenter Zawadi Achieng recording vocals wearing headphones in a studio.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'brian-otieno',
    name: 'Brian Otieno',
    show: 'Sheng Express · Diaspora Window',
    showDays: 'Monday – Friday · Sunday',
    showTimes: '16:00 – 19:00 · 15:00 – 17:00 EAT',
    bio: 'Sheng is Brian’s first language on air. He runs the commute show and the Sunday window that keeps Nairobi talking to the diaspora.',
    image: '/images/presenters/presenter-brian.jpg',
    imageAlt: 'Presenter Brian Otieno smiling with headphones on an orange studio background.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'grace-muthoni',
    name: 'Grace Muthoni',
    show: 'Genre Night',
    showDays: 'Monday – Thursday',
    showTimes: '20:00 – 23:00 EAT',
    bio: 'Crate digger and selector. Grace mixes one genre a night — benga to bongo flava — and explains where every record came from.',
    image: '/images/presenters/presenter-grace.jpg',
    imageAlt: 'Presenter Grace Muthoni smiling while speaking into a studio microphone.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'kevin-omondi',
    name: 'Kevin Omondi',
    show: 'Friday Heat · Overnight Mix',
    showDays: 'Friday · Nightly',
    showTimes: '19:00 – 23:30 · 00:00 – 05:00 EAT',
    bio: 'The producer behind the Friday Heat mix and the overnight bed of East African music that keeps 91.7 FM alive when the city sleeps.',
    image: '/images/presenters/presenter-kevin.jpg',
    imageAlt: 'Presenter Kevin Omondi in studio portrait wearing glasses and headphones.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'tom-kariuki',
    name: 'Tom Kariuki',
    show: 'Saturday Market',
    showDays: 'Saturday',
    showTimes: '08:00 – 12:00 EAT',
    bio: 'Broadcasts live from the market floor with traders, cooks and tailors — a four-hour tour of Nairobi’s Saturday economy.',
    image: '/images/presenters/presenter-tom.jpg',
    imageAlt: 'Presenter Tom Kariuki wearing headphones and singing into a studio microphone.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
  {
    slug: 'otieno-mwangi',
    name: 'Otieno Mwangi',
    show: 'Podcast Desk — The Studio Sessions',
    showDays: 'Published Thursdays',
    showTimes: 'On demand',
    bio: 'Long-form producer. Otieno turns the week’s best studio conversations into the podcast feed for listeners who missed them live.',
    image: '/images/presenters/presenter-otieno.jpg',
    imageAlt: 'Podcast host Otieno Mwangi wearing headphones and holding a microphone.',
    social: { instagram: 'https://instagram.com/silasradio917', x: 'https://x.com/silasradio917' },
    bookEventsHref: '/advertise#enquiry',
  },
];

/* -------------------------------------------------------------------------- */
/*  ADVERTISING PACKAGES (prices in KES, as spec'd)                            */
/* -------------------------------------------------------------------------- */

export interface AdPackage {
  slug: string;
  name: string;
  placement: string;
  reach: string;
  priceKES: string;
  priceNote: string;
  inclusions: string[];
  cta: string;
  featured?: boolean;
}

export const PACKAGES: AdPackage[] = [
  {
    slug: 'thirty-second-spot',
    name: '30-Second Spot',
    placement: 'Primetime ad break (Amaka Early Drive, Sheng Express, Friday Heat)',
    reach: '118,000 weekly listeners across Nairobi and online',
    priceKES: '18,500',
    priceNote: 'per week, 12 spots',
    inclusions: [
      '12 × 30-second spots in primetime breaks',
      'Script edit and studio voice-over',
      'Included in the podcast re-cut',
      'Weekly play confirmation report',
    ],
    cta: 'Request a Proposal',
  },
  {
    slug: 'presenter-live-read',
    name: 'Presenter Live Read',
    placement: 'Live read inside the show by the presenter',
    reach: '62,000 weekly listeners on the host’s show blocks',
    priceKES: '42,000',
    priceNote: 'per month, 20 reads',
    inclusions: [
      '20 presenter live reads, 45 seconds each',
      'Written with the presenter in brand voice',
      'Mentions on the show’s podcast episode',
      'Social post from the station handle',
      'Mid-campaign performance check-in',
    ],
    cta: 'Request a Proposal',
    featured: true,
  },
  {
    slug: 'show-naming-rights',
    name: 'Show Naming Rights',
    placement: 'Show title, idents, jingles, podcast artwork credit',
    reach: 'Full show audience: 34,000–71,000 weekly',
    priceKES: '150,000',
    priceNote: 'per month, single show',
    inclusions: [
      'Show renamed to include your brand',
      'Custom ident and jingle package',
      'Naming credit on podcast artwork and episode notes',
      'Two presenter live reads per week',
      'Banner placement on the show and schedule pages',
      'Quarterly audience report',
    ],
    cta: 'Request a Proposal',
  },
  {
    slug: 'digital-on-air-bundle',
    name: 'Digital and On-Air Bundle',
    placement: 'On-air spots + site, newsletter and podcast inventory',
    reach: 'On-air plus 41,000 monthly site visits and 9,400 newsletter subscribers',
    priceKES: '96,000',
    priceNote: 'per month',
    inclusions: [
      '24 × 30-second on-air spots',
      'Homepage and show-page banner rotation',
      'One sponsored newsletter slot per week',
      'Pre-roll on the weekly podcast episode',
      'Spoken WhatsApp channel mention',
      'Monthly consolidated reporting dashboard',
    ],
    cta: 'Request a Proposal',
  },
];

/* -------------------------------------------------------------------------- */
/*  LEGAL                                                                     */
/* -------------------------------------------------------------------------- */

export const LEGAL = {
  privacyUpdated: '2025-10-01',
  termsUpdated: '2025-10-01',
  cookieUpdated: '2025-10-01',
  dataProtectionAuthority: 'Office of the Data Protection Commissioner (ODPC), Kenya',
  governingLaw: 'the Republic of Kenya',
} as const;

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

/** Minutes since midnight, handling "24:00" as end-of-day. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Slot is live if the Nairobi wall-clock now falls between start and end.
 * A slot that ends at "24:00" is handled, as is the 00:00 overnight show.
 */
export function isSlotLive(slot: ShowSlot, now: Date): boolean {
  const day = now.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: TIMEZONE,
  }) as Day;
  const minutes =
    Number(
      now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: TIMEZONE,
      }).slice(0, 2),
    ) * 60 +
    Number(
      now.toLocaleTimeString('en-GB', {
        minute: '2-digit',
        timeZone: TIMEZONE,
      }).slice(0, 2),
    );

  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  return slot.days.includes(day) && minutes >= start && minutes < end;
}

/** Human 12-hour label from 24-hour source data ("24:00" → "12:00 AM"). */
export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h % 24;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDurationLabel(start: string, end: string): string {
  return `${to12h(start)} – ${to12h(end)}`;
}
