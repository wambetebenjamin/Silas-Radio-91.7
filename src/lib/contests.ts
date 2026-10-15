/** Existing giveaway retained as an archive, never silently extended. */
export const CONTESTS = [{
  slug: 'genre-night-vinyl-sets', title: 'The Genre Night vinyl set',
  prize: 'Three vinyl records picked by Grace Muthoni, plus a studio visit for two.',
  deadline: '2025-12-05T21:00:00+03:00',
}];
export function contestIsOpen(slug: string, now = new Date()) {
  const contest = CONTESTS.find((item) => item.slug === slug);
  return Boolean(contest && now.getTime() < new Date(contest.deadline).getTime());
}
