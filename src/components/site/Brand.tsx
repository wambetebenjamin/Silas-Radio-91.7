import { AudioLines } from 'lucide-react';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand--light' : ''}`}>
      <span className="brand__icon"><AudioLines size={28} strokeWidth={1.8} aria-hidden="true" /></span>
      <span className="brand__name">silas<span>RADIO <b>91.7</b></span></span>
    </span>
  );
}
