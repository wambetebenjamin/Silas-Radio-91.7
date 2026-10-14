import { PageHero } from '@/components/site/PageHero';
import { Schedule } from '@/components/Schedule';
import { DAYS, type Day } from '@/lib/site';
import { nairobiClock } from '@/lib/programming';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Weekly schedule', 'Plan your listening with the full seven-day Silas Radio 91.7 schedule. All programme times are in Nairobi’s East Africa Time, UTC+3.', '/schedule');
export const dynamic = 'force-dynamic';
export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day } = await searchParams;
  const now = new Date();
  const initialDay = DAYS.includes(day as Day) ? day as Day : nairobiClock(now).day;
  return <><PageHero eyebrow="Make a little time for good radio" title="Your week. On the air." description="Know who’s behind the mic, find your favourite slot, and discover what comes next. A whole week of Nairobi, right here." breadcrumb="Schedule" /><section className="section"><div className="container"><Schedule initialDay={initialDay} initialTime={now.toISOString()} /></div></section></>;
}
