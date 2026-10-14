import { SITE } from '@/lib/site';
import { PRESENTERS, SCHEDULE } from '@/lib/site';

/**
 * JSON-LD structured data for the station (rendered once, in the root layout).
 *
 * Every item below is derived from the canonical schedule and presenter data in
 * `src/lib/site.ts` and linked to a real page, so the markup can never drift into
 * describing routes that do not exist.
 */

export function StationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['RadioStation', 'LocalBusiness'],
        '@id': `${SITE.url}/#station`,
        name: SITE.name,
        alternateName: 'Silas Radio',
        description:
          'Community radio station broadcasting from Nairobi on 91.7 FM and online: East African music, community stories, local news and podcasts.',
        url: SITE.url,
        logo: `${SITE.url}/icons/icon-512.png`,
        image: `${SITE.url}/images/culture/nairobi-skyline.jpg`,
        telephone: SITE.phone,
        email: SITE.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.studioAddress.street,
          addressLocality: SITE.studioAddress.locality,
          addressRegion: SITE.studioAddress.region,
          postalCode: SITE.studioAddress.postalCode,
          addressCountry: SITE.studioAddress.country,
        },
        geo: { '@type': 'GeoCoordinates', latitude: -1.2833, longitude: 36.8172 },
        areaServed: [
          { '@type': 'City', name: 'Nairobi' },
          { '@type': 'Country', name: 'Kenya' },
        ],
        broadcastAffiliateOf: { '@type': 'Organization', name: 'Silas Radio 91.7' },
        broadcastFrequency: { '@type': 'BroadcastFrequencySpecification', broadcastFrequencyValue: '91.7', broadcastSignalModulation: 'FM' },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        ],
        sameAs: [
          SITE.social.youtube,
          SITE.social.instagram,
        ],
        potentialAction: {
          '@type': 'ListenAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/listen`, actionPlatform: 'http://schema.org/DesktopWebPlatform' },
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: 'en-KE',
        publisher: { '@id': `${SITE.url}/#station` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE.url}/news?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Silas Radio 91.7 weekly schedule',
        numberOfItems: SCHEDULE.length,
        itemListElement: SCHEDULE.map((slot, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${slot.name} with ${slot.presenter}`,
          url: `${SITE.url}/shows/${slot.id}`,
          description: slot.description,
        })),
      },
      {
        '@type': 'ItemList',
        name: 'Silas Radio 91.7 presenters',
        numberOfItems: PRESENTERS.length,
        itemListElement: PRESENTERS.map((presenter, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: presenter.name,
          url: `${SITE.url}/presenters/${presenter.slug}`,
          description: `${presenter.show} — ${presenter.showDays}, ${presenter.showTimes}`,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is static and generated from typed content, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
