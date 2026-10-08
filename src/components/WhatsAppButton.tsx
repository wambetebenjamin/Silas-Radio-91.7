'use client';

import { MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';

/**
 * Floating WhatsApp button — fixed above the pinned audio player.
 *
 * Link and tooltip text are mandated by the spec and taken verbatim.
 * Colours come from the design source where available; WhatsApp's own brand
 * green (#25d366) is used for the button because it is an external brand,
 * with the source's purple reserved for on-site CTAs.
 */
export function WhatsAppButton() {
  return (
    <a
      className="sr-whatsapp"
      href={SITE.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${SITE.whatsappTooltip} — opens WhatsApp chat with the studio`}
    >
      <MessageCircle size={22} strokeWidth={2.2} aria-hidden="true" />
      <span>WhatsApp</span>
      <span className="sr-whatsapp__tooltip" role="tooltip">
        Request a song or enquire about advertising
      </span>
    </a>
  );
}
