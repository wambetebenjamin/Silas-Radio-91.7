export const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/shows', label: 'Shows' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/news', label: 'Stories' },
  { href: '/about', label: 'About' },
];

export const EXPLORE_NAV = [
  { href: '/presenters', label: 'Our presenters' },
  { href: '/studio', label: 'Inside the studio' },
  { href: '/request', label: 'Request a song' },
  { href: '/contests', label: 'Contests & giveaways' },
  { href: '/advertise', label: 'Advertise with us' },
  { href: '/newsletter', label: 'The weekly playlist' },
  { href: '/contact', label: 'Contact the station' },
];

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
