'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AudioLines } from 'lucide-react';
import { useBroadcast } from '@/hooks/useBroadcast';
import { SITE } from '@/lib/site';

export function HeroOnAir({ initialTime }: { initialTime: string }) {
  const broadcast = useBroadcast(initialTime);
  return (
    <div className="hero-onair"><span className="hero-onair__icon"><AudioLines size={23} aria-hidden="true" /></span><div><p>ON THE SCHEDULE NOW</p><strong>{broadcast?.current.name ?? 'The Silas Selection'}</strong><small>{broadcast?.current.presenter ?? 'Silas Radio'} · Nairobi, EAT</small></div><Link href="/listen" aria-label="Open the listening room"><ArrowUpRight size={20} aria-hidden="true" /></Link></div>
  );
}

export function FrequencyStrip({ initialTime }: { initialTime: string }) {
  const broadcast = useBroadcast(initialTime);
  if (!broadcast) return null;
  return (
    <section className="frequency-strip" aria-label="On the schedule">
      <div className="container frequency-strip__inner"><div className="frequency-strip__title"><span>ON THE FREQUENCY</span><Link href="/schedule" className="text-link">The full schedule <ArrowRight size={14} aria-hidden="true" /></Link></div>
        {[broadcast.current, ...broadcast.next].map((show, index) => <div className="frequency-slot" key={`${show.id}-${index}`}><div className="frequency-slot__time">{index === 0 ? <><span className="status-dot" /><b>NOW</b></> : <span>{index === 1 ? 'UP NEXT' : 'THEN'}</span>}<span>{show.start} – {show.end} EAT</span></div><h2><Link href={show.selection ? '/listen' : `/shows/${show.id}`}>{show.name}</Link></h2><span>{show.presenter}</span></div>)}
      </div>
    </section>
  );
}

export function ListeningNow({ initialTime }: { initialTime: string }) {
  const broadcast = useBroadcast(initialTime);
  return <div className="listen-now"><p>{SITE.streamConfigured ? 'ON AIR NOW' : 'CURRENT SCHEDULE · DEMO AUDIO BELOW'}</p><h2>{broadcast?.current.name ?? 'The Silas Selection'}</h2><span>With {broadcast?.current.presenter ?? 'Silas Radio'} · {broadcast?.current.start} – {broadcast?.current.end} EAT</span></div>;
}
