import type { EntityRecord } from './entities';

const SITE_URL = 'https://googlementor.com';

function toSchemaType(kind: EntityRecord['kind']): 'Restaurant' | 'LocalBusiness' | 'TouristAttraction' | 'Place' {
  if (kind === 'restaurant') return 'Restaurant';
  if (kind === 'attraction') return 'TouristAttraction';
  if (kind === 'municipality') return 'Place';
  return 'LocalBusiness';
}

function buildAddress(entity: EntityRecord): { '@type': 'PostalAddress'; streetAddress?: string; addressLocality?: string; addressRegion?: string; addressCountry: string } {
  return {
    '@type': 'PostalAddress',
    ...(entity.address ? { streetAddress: entity.address } : {}),
    ...(entity.kind === 'municipality' ? { addressLocality: entity.name } : {}),
    ...(entity.region ? { addressRegion: entity.region } : {}),
    addressCountry: 'GR',
  };
}

export function buildEntityJsonLd(
  entity: EntityRecord,
  canonicalUrl: string,
  subjectOfUrls: string[] = []
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': toSchemaType(entity.kind),
    '@id': canonicalUrl,
    name: entity.name,
    url: canonicalUrl,
    ...(entity.aliases?.length ? { alternateName: entity.aliases } : {}),
    ...(entity.kind === 'restaurant' && entity.categories?.length ? { servesCuisine: entity.categories } : {}),
    address: buildAddress(entity),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: entity.lat,
      longitude: entity.lng,
    },
    ...(subjectOfUrls.length
      ? {
          subjectOf: subjectOfUrls.map((url) => ({ '@id': url })),
        }
      : {}),
    ...(entity.url ? { sameAs: [entity.url] } : {}),
  };
}

export function buildBreadcrumbJsonLd(entity: EntityRecord, canonicalUrl: string): Record<string, unknown> {
  const items: Array<Record<string, unknown>> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Search',
      item: `${SITE_URL}/search`,
    },
  ];

  if (entity.kind === 'restaurant' && entity.categories?.length) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: entity.categories[0],
      item: `${SITE_URL}/search?category=${encodeURIComponent(entity.categoryIds?.[0] || '')}`,
    });
  }

  if (entity.region) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: entity.region,
      item: `${SITE_URL}/search?region=${encodeURIComponent(entity.region)}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: entity.name,
    item: canonicalUrl,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
