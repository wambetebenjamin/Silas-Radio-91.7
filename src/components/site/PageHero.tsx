import Link from 'next/link';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {items.map((item, index) => (
          <li key={item.label}>
            <ChevronRight size={12} aria-hidden="true" />
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ eyebrow, title, description, breadcrumb, children }: {
  eyebrow: string; title: string; description: string; breadcrumb: string; children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <Breadcrumbs items={[{ label: breadcrumb }]} />
        <div className="page-hero__content">
          <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
          <div className="page-hero__intro"><p>{description}</p>{children}</div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, href, linkLabel = 'Explore more', light = false }: {
  eyebrow: string; title: string; href?: string; linkLabel?: string; light?: boolean;
}) {
  return (
    <div className={`section-heading ${light ? 'section-heading--light' : ''}`}>
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {href && <Link className="text-link" href={href}>{linkLabel}<ArrowUpRight size={17} aria-hidden="true" /></Link>}
    </div>
  );
}
