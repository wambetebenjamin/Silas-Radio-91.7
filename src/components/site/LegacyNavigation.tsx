'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRESENTERS } from '@/lib/site';

const DESTINATIONS: Record<string, string> = {
  schedule: '/schedule', presenters: '/presenters', request: '/request', advertising: '/advertise',
  advertise: '/advertise', contests: '/contests', contact: '/contact', gallery: '/studio',
  studio: '/studio', 'studio-tour': '/studio', 'ar-studio': '/studio', player: '/listen', newsletter: '/newsletter',
};

/** Bookmarks to the former one-page site remain useful. */
export function LegacyNavigation() {
  const router = useRouter();
  useEffect(() => {
    const navigate = () => {
      const presenter = new URLSearchParams(window.location.search).get('presenter');
      if (presenter && PRESENTERS.some((person) => person.slug === presenter)) { router.replace(`/presenters/${presenter}`); return; }
      const target = DESTINATIONS[window.location.hash.slice(1)];
      if (target) router.replace(target);
    };
    navigate();
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, [router]);
  return null;
}
