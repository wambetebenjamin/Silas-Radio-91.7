import Link from 'next/link';
import { ArrowUpRight, Radio } from 'lucide-react';

export default function NotFound() {
  return <section className="sr-error-page"><div className="container"><p className="sr-error-page__code" aria-hidden="true">404</p><p className="eyebrow">Page not found</p><h1>We could not find that page</h1><p className="max-w-[520px] mx-auto mt-5">The address may have changed or the link may be out of date. The rest of the station is where you left it.</p><div className="button-row justify-center"><Link href="/" className="button button--accent">Back to the home page <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/listen" className="button button--ghost"><Radio size={16} aria-hidden="true" />Open the listening room</Link></div><p className="mt-8 text-[12px]">Try the <Link className="underline" href="/shows">shows</Link>, the <Link className="underline" href="/schedule">schedule</Link>, or the <Link className="underline" href="/news">community stories</Link>.</p></div></section>;
}
