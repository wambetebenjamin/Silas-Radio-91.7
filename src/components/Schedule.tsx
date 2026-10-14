'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowUpRight, AudioLines, Clock3 } from 'lucide-react';
import { DAYS, type Day } from '@/lib/site';
import { getShow, scheduleForDay } from '@/lib/programming';
import { useBroadcast } from '@/hooks/useBroadcast';

export function Schedule({ initialDay, initialTime }: { initialDay: Day; initialTime: string }) {
  const [day, setDay] = useState(initialDay);
  const broadcast = useBroadcast(initialTime);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const rows = scheduleForDay(day);
  const select = (value: Day) => {
    setDay(value);
    const url = new URL(window.location.href);
    url.searchParams.set('day', value);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  };
  return <><div className="schedule-toolbar"><h2>{day} on your radio.</h2><p><Clock3 size={14} aria-hidden="true" />All times East Africa Time (UTC+3)</p></div><div className="day-tabs" role="tablist" aria-label="Day of the week">{DAYS.map((value, index) => <button key={value} type="button" role="tab" id={`tab-${value}`} aria-controls="schedule-panel" aria-selected={day === value} tabIndex={day === value ? 0 : -1} ref={(node) => { tabs.current[index] = node; }} onClick={() => select(value)} onKeyDown={(event) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % 7 : event.key === 'ArrowLeft' ? (index + 6) % 7 : event.key === 'Home' ? 0 : event.key === 'End' ? 6 : null;
    if (next === null) return;
    event.preventDefault(); select(DAYS[next]); tabs.current[next]?.focus();
  }} aria-label={`${value}${broadcast?.day === value ? ', today' : ''}`}>{value.slice(0, 3)}{broadcast?.day === value && <small>Today</small>}</button>)}</div><div id="schedule-panel" role="tabpanel" aria-labelledby={`tab-${day}`} tabIndex={0} className="schedule-list">{rows.map((slot) => {
    const show = getShow(slot.id);
    const live = day === broadcast?.day && slot.id === broadcast.current.id && slot.start === broadcast.current.start;
    const href = slot.selection ? '/listen' : `/shows/${slot.id}`;
    return <article className="schedule-row" key={`${slot.id}-${slot.start}`} data-live={live}><div className="schedule-time">{slot.start}<span>until {slot.end}</span></div><div className="schedule-art">{show ? <Image src={show.image} alt="" width={64} height={64} /> : <AudioLines size={26} aria-hidden="true" />}</div><div><h3><Link href={href}>{slot.name}</Link></h3><p>With {slot.presenter}</p><p className="schedule-description">{slot.description}</p></div><div className="schedule-category">{live && <span className="tag tag--purple">On air now</span>}<span>{show?.category ?? 'Music selection'}</span></div><Link href={href} aria-label={`Explore ${slot.name}`}><ArrowUpRight size={19} aria-hidden="true" /></Link></article>;
  })}</div><p className="schedule-note">Between hosted shows, the Silas Selection keeps the music going. Programmes may change for special broadcasts. <Link className="text-link" href="/contact">Ask the studio <ArrowUpRight size={13} aria-hidden="true" /></Link></p></>;
}
