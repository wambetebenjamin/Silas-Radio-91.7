import { DAYS, PRESENTERS, SCHEDULE, TIMEZONE, toMinutes, type Day, type ShowSlot } from './site';

export type ShowCategory = 'Music' | 'Community' | 'Culture';

const EDITORIAL: Record<string, { category: ShowCategory; image: string; note: string }> = {
  'amaka-early': {
    category: 'Community', image: '/images/presenters/presenter-mary.jpg',
    note: 'Before the first matatu fills up, Mary is at the microphone. Start your day with the conversations, local updates and familiar records that make the early alarm worth it.',
  },
  'midday-community': {
    category: 'Community', image: '/images/culture/community-interview.jpg',
    note: 'A seat at the table for every neighbourhood. Zawadi makes room for community organisers, local questions and the everyday stories that deserve to be heard.',
  },
  'sheng-express': {
    category: 'Culture', image: '/images/presenters/presenter-brian.jpg',
    note: 'The city has its own language, and its own rhythm. Brian brings both to your journey home, with fresh releases, listener dedications and a conversation that never stands still.',
  },
  'genre-night': {
    category: 'Music', image: '/images/studio/turntable-closeup.jpg',
    note: 'One genre. A whole world to discover. Grace goes beyond the hits to connect the records, the artists and the stories behind East Africa’s most distinctive sounds.',
  },
  'friday-heat': {
    category: 'Music', image: '/images/culture/festival-night.jpg',
    note: 'Leave the working week behind. Kevin takes over the decks for a Friday-night mix of East African favourites, new discoveries and your weekend shout-outs.',
  },
  'saturday-market': {
    category: 'Culture', image: '/images/culture/djembe-street-musician.jpg',
    note: 'Meet the people who make the city move. Tom follows the food, the fashion and the conversations from the market floor into your Saturday morning.',
  },
  'nairobi-nights': {
    category: 'Music', image: '/images/culture/nairobi-skyline.jpg',
    note: 'When the city slows down, the stories get a little longer. Settle into Saturday evening with Zawadi, slow jams and space to breathe.',
  },
  'sunday-reflections': {
    category: 'Community', image: '/images/presenters/presenter-mary.jpg',
    note: 'A gentler start to Sunday. Mary brings together conversations about faith, family and the small acts of service that hold a community together.',
  },
  'diaspora-window': {
    category: 'Community', image: '/images/culture/nairobi-expressway.jpg',
    note: 'However far you travel, there is a little Nairobi in your day. Brian connects voices across time zones for a Sunday conversation with home.',
  },
  'overnight-mix': {
    category: 'Music', image: '/images/studio/studio-vocal-booth.jpg',
    note: 'For the night shift, the late drive and the moments between. A continuous selection of East African music, curated by Kevin, keeps you company until morning.',
  },
};

export const SHOWS = SCHEDULE.map((slot) => ({ ...slot, ...EDITORIAL[slot.id] }));
export type Show = (typeof SHOWS)[number];
export const getShow = (slug: string) => SHOWS.find((show) => show.id === slug);
export const getPresenter = (slug: string) => PRESENTERS.find((presenter) => presenter.slug === slug);

export function showDays(days: readonly Day[]): string {
  if (days.length === 7) return 'Every day';
  if (days.join(',') === DAYS.slice(0, 5).join(',')) return 'Mon – Fri';
  if (days.join(',') === DAYS.slice(0, 4).join(',')) return 'Mon – Thu';
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
    slug: 'amaka-early-preview', showId: 'amaka-early', title: 'Start your day on our frequency',
    description: 'Explore the Amaka Early Drive listening experience with this sample audio.',
    image: '/images/studio/broadcast-mic-green.jpg', audio: '/audio/stream/demo-01.mp3',
    category: 'Community' as ShowCategory, number: '01',
  },
  {
    slug: 'genre-night-preview', showId: 'genre-night', title: 'A little deeper into the crates',
    description: 'Try the on-demand player while discovering the world of Genre Night.',
    image: '/images/studio/turntable-closeup.jpg', audio: '/audio/stream/demo-02.mp3',
    category: 'Music' as ShowCategory, number: '02',
  },
  {
    slug: 'sheng-express-preview', showId: 'sheng-express', title: 'Take the city with you',
    description: 'Get a feel for listening on the move with the Sheng Express audio preview.',
    image: '/images/presenters/presenter-brian.jpg', audio: '/audio/stream/demo-03.mp3',
    category: 'Culture' as ShowCategory, number: '03',
  },
];
export type Episode = (typeof EPISODES)[number];
export const getEpisode = (slug: string) => EPISODES.find((episode) => episode.slug === slug);
