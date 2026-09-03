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

export function buildBreadcrumbJsonLd(
  entity: EntityRecord,
  canonicalUrl: string,
  options?: {
    areaSlug?: string;
    areaName?: string;
    categorySlug?: string;
    categoryName?: string;
  }
): Record<string, unknown> {
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

  if (options?.areaSlug && options?.areaName) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: options.areaName,
      item: `${SITE_URL}/area/${options.areaSlug}`,
    });

    if (options.categorySlug && options.categoryName) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: options.categoryName,
        item: `${SITE_URL}/${options.categorySlug}/${options.areaSlug}`,
      });
    }
  }
  // No area/category fallback here: /search only supports query-string filters,
  // and those URLs are blocked by robots.txt (Disallow: /*?*), so they must
  // never be emitted as breadcrumb "item" URLs. Skip straight to the entity.

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
