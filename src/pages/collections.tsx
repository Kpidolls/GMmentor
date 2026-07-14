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

type CollectionLink = {
  href: string;
  categoryName: string;
  areaName: string;
  count: number;
};

type CollectionGroup = {
  categoryName: string;
  categorySlug: string;
  items: CollectionLink[];
};

type CollectionsPageProps = {
  groups: CollectionGroup[];
  totalCollections: number;
};

type IntentCoverage = {
  generatedCategoryAreaRoutes?: Array<{ categorySlug: string; areaSlug: string }>;
};

export const getStaticProps: GetStaticProps<CollectionsPageProps> = async () => {
  const entitiesIndex = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: entitiesIndex.entities });

  let routes: Array<{ categorySlug: string; areaSlug: string }> = [];
  try {
    const coverageFile = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
    const coverage = JSON.parse(readFileSync(coverageFile, 'utf8')) as IntentCoverage;
    routes = Array.isArray(coverage.generatedCategoryAreaRoutes) ? coverage.generatedCategoryAreaRoutes : [];
  } catch {
    routes = [];
  }

  const fallbackRoutes = engine.categories.records.flatMap((category) =>
    engine.areas.records.map((area) => ({ categorySlug: category.urlSlug, areaSlug: area.urlSlug }))
  );

  const candidateRoutes = routes.length > 0 ? routes : fallbackRoutes;

  const byCategory = new Map<string, CollectionGroup>();

  for (const route of candidateRoutes) {
    const resolution = engine.resolver.resolveIntent(route.categorySlug, route.areaSlug);
    if (resolution.status !== 'resolved' || !resolution.category || !resolution.area) {
      continue;
    }

    const payload = engine.query.getIntentResults({
      categoryId: resolution.category.id,
      areaId: resolution.area.id,
      limit: 1,
    });

    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      continue;
    }

    const categorySlug = resolution.category.urlSlug;
    const group = byCategory.get(categorySlug) || {
      categoryName: resolution.category.name,
      categorySlug,
      items: [],
    };

    group.items.push({
      href: `/${categorySlug}/${resolution.area.urlSlug}`,
      categoryName: resolution.category.name,
      areaName: resolution.area.nameEn || resolution.area.name,
      count: payload.counts.totalCategoryArea,
    });

    byCategory.set(categorySlug, group);
  }

  const groups = Array.from(byCategory.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return left.areaName.localeCompare(right.areaName);
      }),
    }))
    .sort((left, right) => right.items.length - left.items.length);

  const totalCollections = groups.reduce((sum, group) => sum + group.items.length, 0);

  return {
    props: {
      groups,
      totalCollections,
    },
  };
};

export default function CollectionsPage({ groups, totalCollections }: CollectionsPageProps) {
  const title = `All Intent Collections (${totalCollections}) | Googlementor`;
  const description = `Browse all category and area collection pages on Googlementor. Compare curated lists across ${totalCollections} combinations.`;
  const canonicalUrl = `${SITE_URL}/collections`;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Intent Collections',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: totalCollections,
      itemListElement: groups
        .flatMap((group) => group.items)
        .slice(0, 300)
        .map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${item.categoryName} in ${item.areaName}`,
          url: `${SITE_URL}${item.href}`,
        })),
    },
  };

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
        <Heading as="h1" size="2xl" mb={3}>All Intent Collections</Heading>
        <Text color="gray.700">
          This index groups every published category and area collection route so users and crawlers can reach deep list pages quickly.
        </Text>
      </Box>

      <Box display="grid" gap={6}>
        {groups.map((group) => (
          <Box key={group.categorySlug} borderWidth="1px" borderRadius="xl" p={{ base: 4, md: 5 }} bg="white">
            <Heading as="h2" size="md" mb={3}>{group.categoryName}</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              {group.items.map((item) => (
                <Box key={item.href} borderWidth="1px" borderRadius="lg" p={3} bg="gray.50">
                  <Link as={NextLink} href={item.href} color="blue.700" fontWeight="semibold">
                    {item.categoryName} in {item.areaName}
                  </Link>
                  <Text color="gray.600" fontSize="sm" mt={1}>{item.count} places</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
