import { DAYS, PRESENTERS, SCHEDULE, TIMEZONE, toMinutes, type Day, type ShowSlot } from './site';

export type ShowCategory = 'Music' | 'Community' | 'Culture';

const EDITORIAL: Record<string, { category: ShowCategory; image: string; note: string }> = {
  'amaka-early': {
    category: 'Community', image: '/images/presenters/presenter-mary.jpg',
    note: 'Mary is on the microphone before the first matatu fills up, with local updates, listener calls and the records early commuters ask for.',
  },
  'midday-community': {
    category: 'Community', image: '/images/culture/community-interview.jpg',
    note: 'Zawadi gives community organisers, residents and ward leaders a seat at the table, and takes questions from listeners across the city.',
  },
  'sheng-express': {
    category: 'Culture', image: '/images/presenters/presenter-brian.jpg',
    note: 'Brian hosts the commute home in Sheng, mixing new East African releases with listener dedications and shout-outs.',
  },
  'genre-night': {
    category: 'Music', image: '/images/studio/turntable-closeup.jpg',
    note: 'Grace plays one genre a night and goes past the hits, explaining which Nairobi studio recorded the track, who produced it and where the artist came from.',
  },
  'friday-heat': {
    category: 'Music', image: '/images/culture/festival-night.jpg',
    note: 'Kevin takes over the decks to open the weekend, with a four-and-a-half-hour mix of East African favourites and listener shout-outs.',
  },
  'saturday-market': {
    category: 'Culture', image: '/images/culture/djembe-street-musician.jpg',
    note: 'Tom broadcasts from the market floor, following the traders, cooks and tailors who work Nairobi’s Saturday economy.',
  },
  'nairobi-nights': {
    category: 'Music', image: '/images/culture/nairobi-skyline.jpg',
    note: 'A slower Saturday night show. Zawadi plays soul, R&B and Kenyan slow jams, with longer interviews and fewer interruptions.',
  },
  'sunday-reflections': {
    category: 'Community', image: '/images/presenters/presenter-mary.jpg',
    note: 'Mary hosts a Sunday morning of conversation about faith, family and community work, with music between the interviews.',
  },
  'diaspora-window': {
    category: 'Community', image: '/images/culture/nairobi-expressway.jpg',
    note: 'A Sunday show for Kenyans who live abroad. Brian takes calls across time zones and reports what is happening back home.',
  },
  'overnight-mix': {
    category: 'Music', image: '/images/studio/studio-vocal-booth.jpg',
    note: 'A continuous run of East African music for the night shift or the late drive, selected by Kevin, from midnight until 05:00.',
  },
};

export const SHOWS = SCHEDULE.map((slot) => ({ ...slot, ...EDITORIAL[slot.id] }));
export type Show = (typeof SHOWS)[number];
export const getShow = (slug: string) => SHOWS.find((show) => show.id === slug);
export const getPresenter = (slug: string) => PRESENTERS.find((presenter) => presenter.slug === slug);

export function showDays(days: readonly Day[]): string {
  if (days.length === 7) return 'Every day';
  if (days.join(',') === DAYS.slice(0, 5).join(',')) return 'Mon to Fri';
  if (days.join(',') === DAYS.slice(0, 4).join(',')) return 'Mon to Thu';
  return days.map((day) => day.slice(0, 3)).join(' & ');
}

export function nairobiClock(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { day: value('weekday') as Day, minutes: Number(value('hour')) * 60 + Number(value('minute')) };
}

export interface BroadcastSlot extends ShowSlot { selection?: boolean }
const timeLabel = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Fill gaps explicitly instead of claiming the breakfast host is on air all day. */
export function scheduleForDay(day: Day): BroadcastSlot[] {
  const scheduled = SCHEDULE.filter((show) => show.days.includes(day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const result: BroadcastSlot[] = [];
  let cursor = 0;
  const fill = (end: number) => {
    if (cursor >= end) return;
    result.push({
      id: 'silas-selection', name: 'The Silas Selection', presenter: 'Silas Radio', presenterSlug: '',
      start: timeLabel(cursor), end: timeLabel(end), duration: `${end - cursor} minutes`, days: [day],
      hasRecording: false, selection: true, description: 'East African favourites and fresh discoveries between our hosted shows.',
    });
  };
  for (const show of scheduled) {
    fill(toMinutes(show.start));
    result.push(show);
    cursor = toMinutes(show.end);
  }
  fill(1440);
  return result;
}

export function broadcastAt(now: Date) {
  const clock = nairobiClock(now);
  const today = scheduleForDay(clock.day);
  const index = today.findIndex((slot) => clock.minutes >= toMinutes(slot.start) && clock.minutes < toMinutes(slot.end));
  const upcoming = today.slice(index + 1);
  const tomorrow = DAYS[(DAYS.indexOf(clock.day) + 1) % DAYS.length];
  return { current: today[index], next: [...upcoming, ...scheduleForDay(tomorrow)].slice(0, 2), day: clock.day };
}

/** The supplied archive includes sample music, not published station recordings. */
export const EPISODES = [
  {
    slug: 'amaka-early-preview', showId: 'amaka-early', title: 'The Amaka Early Drive preview',
    description: 'Sample audio supplied with the design archive, used here to demonstrate the on-demand player.',
    image: '/images/studio/broadcast-mic-green.jpg', audio: '/audio/stream/demo-01.mp3',
    category: 'Community' as ShowCategory, number: '01',
  },
  {
    slug: 'genre-night-preview', showId: 'genre-night', title: 'The Genre Night preview',
    description: 'Sample audio supplied with the design archive, paired with the Genre Night show page.',
    image: '/images/studio/turntable-closeup.jpg', audio: '/audio/stream/demo-02.mp3',
    category: 'Music' as ShowCategory, number: '02',
  },
  {
    slug: 'sheng-express-preview', showId: 'sheng-express', title: 'The Sheng Express preview',
    description: 'Sample audio supplied with the design archive, paired with the Sheng Express show page.',
    image: '/images/presenters/presenter-brian.jpg', audio: '/audio/stream/demo-03.mp3',
    category: 'Culture' as ShowCategory, number: '03',
  },
];
export type Episode = (typeof EPISODES)[number];
export const getEpisode = (slug: string) => EPISODES.find((episode) => episode.slug === slug);
