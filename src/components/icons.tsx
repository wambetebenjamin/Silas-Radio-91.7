/**
 * Icon helpers.
 *
 * Lucide is the only icon set on this site (0.468.0). WhatsApp and a couple of
 * brand marks have no Lucide equivalent, so they are drawn here as plain
 * inline SVG paths with the same stroke conventions (24px grid, 2px stroke) —
 * no icon font, no decoration, no sparkles.
 */

export function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M8.5 9.5c.4 2.3 2 3.9 4.3 4.3" />
      <path d="M9.2 8.7c-.4.2-.6.6-.5 1M14.6 14.4c.3 0 .6-.2.8-.5" />
    </svg>
  );
}
