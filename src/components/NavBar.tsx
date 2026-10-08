'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Headphones,
  Menu,
  Mic,
  PlayCircle,
  Radio,
  Ticket,
  Users,
  Volume2,
  X,
} from 'lucide-react';

import { Wordmark } from './Wordmark';
import { useScrolled } from '@/hooks/useMotionAndLayout';
import { usePlayerStore } from '@/store/player';

/**
 * 1. Sticky navbar
 *   EFFECT-10 — logo animates once, replays on click, accessible name
 *               "Silas Radio 91.7 Home".
 *   EFFECT-11 — nav icons animate on hover / focus-visible / click, 180–420ms.
 *   EFFECT-28 — glassmorphic on scroll, blur capped at 20px, solid fallback,
 *               focus rings stay visible over the blur.
 */

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Radio;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', Icon: Radio },
  { href: '/#schedule', label: 'Shows', Icon: Calendar },
  { href: '/#presenters', label: 'Presenters', Icon: Users },
  { href: '/podcasts', label: 'Podcasts', Icon: Headphones },
  { href: '/news', label: 'News', Icon: Mic },
  { href: '/advertise', label: 'Advertise', Icon: Volume2 },
  { href: '/contests', label: 'Contests', Icon: Ticket },
];

export function NavBar() {
  const scrolled = useScrolled(24);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoReplay, setLogoReplay] = useState(0);
  const [pressedIcon, setPressedIcon] = useState<string | null>(null);
  const setPlaying = usePlayerStore((state) => state.play);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  // Close the mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const handleLogoClick = () => {
    // EFFECT-10: replay the draw on click
    setLogoReplay((value) => value + 1);
  };

  const handleIconPress = (label: string) => {
    setPressedIcon(label);
    window.setTimeout(() => setPressedIcon(null), 420);
  };

  const listenLive = () => {
    if (!isPlaying) setPlaying();
    document.getElementById('player')?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <header className="sr-nav" data-scrolled={scrolled}>
      <div className="sr-container sr-nav__inner">
        {/* EFFECT-10 — logo, animates once then replays on click */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 py-3"
          aria-label="Silas Radio 91.7 Home"
        >
          <Wordmark width={150} duration={1100} replayKey={logoReplay} label={null} color="#ffffff" />
        </Link>

        <nav aria-label="Main" className="sr-nav__menu ml-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? 'page' : undefined}
                onMouseDown={() => handleIconPress(label)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') handleIconPress(label);
                }}
                className="flex items-center gap-1.5"
              >
                <Icon
                  size={15}
                  strokeWidth={2}
                  className="sr-nav-icon"
                  data-pressed={pressedIcon === label}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button type="button" className="sr-live-cta" onClick={listenLive}>
            <span className="sr-live-cta__dot" aria-hidden="true" />
            <PlayCircle size={16} strokeWidth={2.2} aria-hidden="true" />
            Listen Live
          </button>

          <button
            type="button"
            className="sr-nav__icon-btn"
            aria-expanded={menuOpen}
            aria-controls="sr-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — EFFECT-21 doodle driven by aria-expanded state */}
      <div
        id="sr-mobile-menu"
        className="sr-mobile-menu lg:hidden"
        hidden={!menuOpen}
        aria-expanded={menuOpen}
      >
        <MenuDoodle expanded={menuOpen} />
        <ul>
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <li key={label}>
              <Link href={href} className="flex items-center gap-3">
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** EFFECT-21 — hand-drawn mobile menu doodle, reacts to aria-expanded. */
function MenuDoodle({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className="sr-doodle"
      viewBox="0 0 220 40"
      width="220"
      height="40"
      aria-hidden="true"
      data-expanded={expanded}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 34 C34 12 52 30 74 18 C96 6 112 26 134 16" />
        <circle cx="150" cy="14" r="5" />
        <path d="M150 19 L150 30" />
        <path d="M144 24 L156 24" />
        <path d="M170 30 C176 18 184 18 190 30" />
        <path d="M196 12 L206 22 M206 12 L196 22" />
        <path d="M212 30 C212 20 216 18 214 8" />
      </g>
    </svg>
  );
}
