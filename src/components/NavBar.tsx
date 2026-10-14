'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, Radio, X } from 'lucide-react';
import { PRIMARY_NAV, EXPLORE_NAV, isActivePath } from '@/lib/navigation';
import { Brand } from './site/Brand';

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [pathname]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (moreOpen) { setMoreOpen(false); moreButton.current?.focus(); }
      if (mobileOpen) { setMobileOpen(false); mobileButton.current?.focus(); }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [moreOpen, mobileOpen]);

  const close = () => { setMobileOpen(false); setMoreOpen(false); };
  return (
    <>
      <div className="station-bar"><div className="container"><span><span className="status-dot" />FROM NAIROBI, WITH LOVE.</span><span>91.7 FM <i /> EAST AFRICAN MUSIC. EVERY DAY.</span><Link href="/contact">Say hello <ArrowUpRight size={12} aria-hidden="true" /></Link></div></div>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/" aria-label="Silas Radio 91.7 home" onClick={close}><Brand light /></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {PRIMARY_NAV.map((item) => <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}>{item.label}</Link>)}
            <div className="nav-more" ref={moreRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setMoreOpen(false); }}>
              <button type="button" ref={moreButton} aria-expanded={moreOpen} aria-controls="explore-menu" className={EXPLORE_NAV.some((item) => isActivePath(pathname, item.href)) ? 'is-active' : ''} onClick={() => setMoreOpen(!moreOpen)}>Explore <ChevronDown size={13} aria-hidden="true" /></button>
              <div id="explore-menu" className="nav-dropdown" hidden={!moreOpen}>
                <span className="eyebrow">More on your frequency</span>
                {EXPLORE_NAV.map((item) => <Link key={item.href} href={item.href} onClick={close} aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}>{item.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
              </div>
            </div>
          </nav>
          <div className="site-header__actions">
            <Link className="button button--lime button--small" href="/listen" onClick={close}><Radio size={16} aria-hidden="true" /><span>Listen live</span></Link>
            <button className="menu-toggle" type="button" ref={mobileButton} aria-controls="mobile-navigation" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
          </div>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!mobileOpen}>
          <div className="container">
            {PRIMARY_NAV.map((item) => <Link key={item.href} href={item.href} onClick={close} aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}
            <span className="eyebrow">Explore the station</span>
            {EXPLORE_NAV.map((item) => <Link key={item.href} href={item.href} onClick={close} aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}
          </div>
        </nav>
      </header>
    </>
  );
}
