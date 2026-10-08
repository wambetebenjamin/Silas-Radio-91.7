'use client';

import { useEffect, useState } from 'react';

/**
 * Shared hooks.
 *
 * `useReducedMotion` is the backbone of the 31 reduced-motion fallbacks: when
 * it reports true, effects must present their static state (not merely run
 * faster). Every animated effect in this codebase reads it.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True once the window has scrolled past `threshold` (EFFECT-28 glass nav). */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

/** True when the document is hidden — used to pause particles and sprites. */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}

export interface MediaQueryFlags {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isNarrow: boolean;
}

/** Breakpoints from the spec: 1440 / 1024 / 768 / 480 / 390 / 320. */
export function useBreakpoints(): MediaQueryFlags {
  const [flags, setFlags] = useState<MediaQueryFlags>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isNarrow: false,
  });

  useEffect(() => {
    const queries = {
      isNarrow: window.matchMedia('(max-width: 479px)'),
      isMobile: window.matchMedia('(max-width: 767px)'),
      isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
      isDesktop: window.matchMedia('(min-width: 1024px)'),
    };

    const update = () =>
      setFlags({
        isNarrow: queries.isNarrow.matches,
        isMobile: queries.isMobile.matches,
        isTablet: queries.isTablet.matches,
        isDesktop: queries.isDesktop.matches,
      });

    update();
    const listeners = Object.values(queries).map((query) => {
      query.addEventListener('change', update);
      return () => query.removeEventListener('change', update);
    });
    return () => listeners.forEach((off) => off());
  }, []);

  return flags;
}

/** IntersectionObserver boolean for a single element (EFFECT-07, 19, 31). */
export function useInViewport<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: IntersectionObserverInit = { threshold: 0.35 },
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return inView;
}
