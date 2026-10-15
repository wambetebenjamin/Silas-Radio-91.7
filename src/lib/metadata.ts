import type { Metadata } from 'next';
import { SITE } from './site';

export function pageMetadata(title: string, description: string, path: string, image = '/images/studio/broadcast-mic-green.jpg'): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title, description, url: `${SITE.url}${path}`, type: 'website', images: [{ url: image, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
