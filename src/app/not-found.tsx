import Link from 'next/link';
import { ArrowUpRight, Radio } from 'lucide-react';

export default function NotFound() {
  return <section className="sr-error-page"><div className="container"><p className="sr-error-page__code" aria-hidden="true">404</p><p className="eyebrow">A little off the dial</p><h1>This frequency is quiet.</h1><p className="max-w-[520px] mx-auto mt-5">We couldn’t find that page. But there’s plenty of good company back at the station.</p><div className="button-row justify-center"><Link href="/" className="button button--lime">Back to the station <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/listen" className="button button--ghost"><Radio size={16} aria-hidden="true" />Open the listening room</Link></div><p className="mt-8 text-[12px]">Looking for something? Try the <Link className="underline" href="/shows">shows</Link>, the <Link className="underline" href="/schedule">schedule</Link>, or the <Link className="underline" href="/news">community stories</Link>.</p></div></section>;
}
