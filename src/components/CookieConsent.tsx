'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export const CONSENT_STORAGE_KEY = 'silas-cookie-consent';
export const CONSENT_VERSION = 1;
export interface ConsentState { version: number; necessary: true; functional: boolean; analytics: boolean; decidedAt: string }
export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || 'null');
    return saved?.version === CONSENT_VERSION ? saved : null;
  } catch { return null; }
}
export function writeConsent(consent: ConsentState) {
  try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent)); } catch { /* Private browsing. */ }
  window.dispatchEvent(new CustomEvent('silas:consent', { detail: consent }));
}
export function CookieSettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event('silas:cookie-settings'))}>Cookie settings</button>;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [functional, setFunctional] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const saved = readConsent();
    setFunctional(saved?.functional ?? false);
    setVisible(!saved);
    const showSettings = () => setOpen(true);
    window.addEventListener('silas:cookie-settings', showSettings);
    return () => window.removeEventListener('silas:cookie-settings', showSettings);
  }, []);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  const save = (allow: boolean) => {
    writeConsent({ version: CONSENT_VERSION, necessary: true, functional: allow, analytics: false, decidedAt: new Date().toISOString() });
    setFunctional(allow); setVisible(false); setOpen(false);
  };
  return (
    <>
      {visible && <aside className="cookie-banner" aria-label="Cookie preferences"><span className="eyebrow">Cookies</span><p>Optional storage remembers your listening preferences between visits. <Link href="/legal/cookie-policy">Cookie policy</Link></p><div><button type="button" className="button button--primary button--small" onClick={() => save(true)}>Accept optional</button><button type="button" className="button button--outline button--small" onClick={() => save(false)}>Necessary only</button><button type="button" className="cookie-manage" onClick={() => setOpen(true)}>Settings</button></div></aside>}
      <dialog className="cookie-dialog" ref={dialog} aria-labelledby="cookie-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
        <button type="button" className="dialog-close" aria-label="Close cookie settings" onClick={() => setOpen(false)}><X aria-hidden="true" /></button><p className="eyebrow">Storage settings</p><h2 id="cookie-title">Cookie preferences</h2><p>Necessary storage remembers this choice. Optional functional storage remembers your volume and playback speed between visits. No advertising trackers are installed.</p><label className="cookie-option"><input type="checkbox" checked disabled />Necessary storage <span>Always on</span></label><label className="cookie-option"><input type="checkbox" checked={functional} onChange={(event) => setFunctional(event.target.checked)} />Remember my listening preferences</label><div className="button-row"><button type="button" className="button button--primary" onClick={() => save(functional)}>Save preferences</button><button type="button" className="button button--outline" onClick={() => save(false)}>Necessary only</button></div><Link className="text-link" href="/legal/cookie-policy" onClick={() => setOpen(false)}>Read our cookie policy</Link>
      </dialog>
    </>
  );
}
