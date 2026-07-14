import Head from 'next/head';
import NextLink from 'next/link';
import type { GetStaticProps } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  Box,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';

import { loadEntitiesIndex } from '../lib/entities';
import { createIntentEngine } from '../lib/intent';

const SITE_URL = 'https://googlementor.com';

type AreaLink = {
  href: string;
  name: string;
  region: string;
  count: number;
};

type AreasPageProps = {
  areaLinks: AreaLink[];
  totalAreas: number;
};

type IntentCoverage = {
  generatedAreaRoutes?: string[];
};

export const getStaticProps: GetStaticProps<AreasPageProps> = async () => {
  const entitiesIndex = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: entitiesIndex.entities });

  let routes: string[] = [];
  try {
    const coverageFile = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
    const coverage = JSON.parse(readFileSync(coverageFile, 'utf8')) as IntentCoverage;
    routes = Array.isArray(coverage.generatedAreaRoutes) ? coverage.generatedAreaRoutes : [];
  } catch {
    routes = [];
  }

  const fallbackRoutes = engine.areas.records.map((area) => area.urlSlug);
  const candidateRoutes = routes.length > 0 ? routes : fallbackRoutes;

  const areaLinks = candidateRoutes
    .map((routeSlug) => {
      const area = engine.resolver.resolveArea(routeSlug);
      if (!area) {
        return null;
      }

      const payload = engine.query.getIntentResults({ areaId: area.id, limit: 1 });
      if (!payload || !payload.passesThreshold) {
        return null;
      }

      return {
        href: `/area/${area.urlSlug}`,
        name: area.nameEn || area.name,
        region: area.regionEn || area.region || 'Greece',
        count: payload.counts.totalInArea,
      } as AreaLink;
    })
    .filter(Boolean)
    .sort((left, right) => {
      const l = left as AreaLink;
      const r = right as AreaLink;

      if (l.region !== r.region) {
        return l.region.localeCompare(r.region);
      }
      if (r.count !== l.count) {
        return r.count - l.count;
      }
      return l.name.localeCompare(r.name);
    }) as AreaLink[];

  return {
    props: {
      areaLinks,
      totalAreas: areaLinks.length,
    },
  };
};

export default function AreasPage({ areaLinks, totalAreas }: AreasPageProps) {
  const title = `All Area Guides (${totalAreas}) | Googlementor`;
  const description = `Browse all indexed area guides on Googlementor. Explore ${totalAreas} areas with curated places, attractions, and restaurants.`;
  const canonicalUrl = `${SITE_URL}/areas`;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Area Guides',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: areaLinks.length,
      itemListElement: areaLinks.slice(0, 300).map((area, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: area.name,
        url: `${SITE_URL}${area.href}`,
      })),
    },
  };

  let currentRegion = '';

  return (
    <Container maxW="6xl" py={10}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </Head>

      <Box mb={8} borderWidth="1px" borderColor="orange.100" borderRadius="2xl" p={{ base: 5, md: 8 }} bg="white" boxShadow="sm">
        <Text fontSize="sm" color="gray.500" mb={2}>Crawl Hub</Text>
        <Heading as="h1" size="2xl" mb={3}>All Area Guides</Heading>
        <Text color="gray.700">
          This index lists every published area guide route. Use it to quickly discover local pages and deeper place collections.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
        {areaLinks.map((area) => {
          const showRegionHeader = area.region !== currentRegion;
          if (showRegionHeader) {
            currentRegion = area.region;
          }

          return (
            <Box key={area.href} borderWidth="1px" borderRadius="lg" p={4} bg="white">
              {showRegionHeader ? (
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.08em" color="gray.500" mb={2}>
                  {area.region}
                </Text>
              ) : null}
              <Link as={NextLink} href={area.href} color="blue.700" fontWeight="semibold">
                {area.name}
              </Link>
              <Text color="gray.600" fontSize="sm" mt={1}>{area.count} places</Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}
