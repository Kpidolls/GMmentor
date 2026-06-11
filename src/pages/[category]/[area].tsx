import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
} from '@chakra-ui/react';

import { createIntentEngine } from '../../lib/intent';
import { loadEntitiesIndex } from '../../lib/entities';
import type { IntentResultsPayload } from '../../lib/intent';
import { formatDistance } from '../../utils/locationUtils';

const SITE_URL = 'https://googlementor.com';

type CategoryAreaPageProps = {
  payload: IntentResultsPayload;
  hasAreaGuidePage: boolean;
  topGuides: Array<{
    slug: string;
    title: string;
    date: string;
  }>;
};

function buildBreadcrumbJsonLd(categorySlug: string, areaSlug: string, categoryName: string, areaName: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: areaName,
        item: `${SITE_URL}/area/${areaSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/${categorySlug}/${areaSlug}`,
      },
    ],
  };
}

function buildCollectionJsonLd(payload: IntentResultsPayload, canonicalUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: payload.category
      ? `Best ${payload.category.name} in ${payload.area.name}`
      : `Best places in ${payload.area.name}`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: payload.entities.length,
      itemListElement: payload.entities.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.entity.name,
        url: item.entity.slug ? `${SITE_URL}/place/${item.entity.slug}` : item.entity.url || canonicalUrl,
      })),
    },
  };
}

function buildGuideItemListJsonLd(
  categoryName: string,
  areaName: string,
  canonicalUrl: string,
  topGuides: Array<{ slug: string; title: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top guides for ${categoryName} in ${areaName}`,
    url: canonicalUrl,
    numberOfItems: topGuides.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: topGuides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.title,
      url: `${SITE_URL}/blog/${guide.slug}`,
    })),
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });
  const paths: Array<{ params: { category: string; area: string } }> = [];
  const seen = new Set<string>();

  for (const category of engine.categories.records) {
    for (const area of engine.areas.records) {
      const payload = engine.query.getIntentResults({
        categoryId: category.id,
        areaId: area.id,
      });
      if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
        continue;
      }

      const key = `${category.urlSlug}/${area.urlSlug}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      paths.push({
        params: {
          category: category.urlSlug,
          area: area.urlSlug,
        },
      });
    }
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<CategoryAreaPageProps> = async ({ params }) => {
  const categorySlug = Array.isArray(params?.category) ? params.category[0] : params?.category;
  const areaSlug = Array.isArray(params?.area) ? params.area[0] : params?.area;
  if (!categorySlug || !areaSlug) {
    return { notFound: true };
  }

  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });
  const resolution = engine.resolver.resolveIntent(categorySlug, areaSlug);
  if (resolution.status !== 'resolved' || !resolution.categoryId || !resolution.areaId) {
    return { notFound: true };
  }

  const payload = engine.query.getIntentResults({
    categoryId: resolution.categoryId,
    areaId: resolution.areaId,
    limit: 30,
    relatedLimit: 10,
  });

  const areaGuidePayload = engine.query.getIntentResults({
    areaId: resolution.areaId,
    limit: 1,
  });

  if (!payload || !payload.category || !payload.passesThreshold || payload.entities.length === 0) {
    return { notFound: true };
  }

  if (payload.category.urlSlug !== categorySlug || payload.area.urlSlug !== areaSlug) {
    return { notFound: true };
  }

  const { getMentionedGuidesForEntity } = await import('../../lib/knowledgeGraph');
  const topGuidesMap = new Map<string, { slug: string; title: string; date: string }>();

  for (const rankedEntity of payload.entities.slice(0, 12)) {
    const guides = getMentionedGuidesForEntity(rankedEntity.entity, 3);
    for (const guide of guides) {
      if (topGuidesMap.has(guide.slug)) {
        continue;
      }
      topGuidesMap.set(guide.slug, {
        slug: guide.slug,
        title: guide.title,
        date: guide.date,
      });

      if (topGuidesMap.size >= 8) {
        break;
      }
    }

    if (topGuidesMap.size >= 8) {
      break;
    }
  }

  const topGuides = Array.from(topGuidesMap.values()).sort((left, right) =>
    right.date.localeCompare(left.date)
  );

  return {
    props: {
      payload,
      hasAreaGuidePage: Boolean(areaGuidePayload?.passesThreshold),
      topGuides,
    },
  };
};

export default function CategoryAreaPage({ payload, hasAreaGuidePage, topGuides }: CategoryAreaPageProps) {
  if (!payload.category) {
    return null;
  }

  const canonicalUrl = `${SITE_URL}/${payload.category.urlSlug}/${payload.area.urlSlug}`;
  const title = `Best ${payload.category.name} in ${payload.area.name} | Googlementor`;
  const description = `Discover ${payload.counts.totalCategoryArea} curated ${payload.category.name.toLowerCase()} in ${payload.area.name}, with nearby alternatives.`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    payload.category.urlSlug,
    payload.area.urlSlug,
    payload.category.name,
    payload.area.name
  );
  const collectionJsonLd = buildCollectionJsonLd(payload, canonicalUrl);
  const guidesItemListJsonLd =
    topGuides.length > 0
      ? buildGuideItemListJsonLd(payload.category.name, payload.area.name, canonicalUrl, topGuides)
      : null;
  const topAttractions = payload.entities.filter((item) => item.entity.categoryIds?.includes('attractions')).slice(0, 8);
  const topRestaurants = payload.entities
    .filter((item) => item.entity.kind === 'restaurant' && !item.entity.categoryIds?.includes('attractions'))
    .slice(0, 8);

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
        {guidesItemListJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesItemListJsonLd) }}
          />
        ) : null}
      </Head>

      <Box mb={8}>
        <Text fontSize="sm" color="gray.500" mb={2}>Intent Collection</Text>
        <Heading as="h1" size="2xl" mb={3}>
          Best {payload.category.name} in {payload.area.name}
        </Heading>
        <Text color="gray.700" mb={2}>
          {payload.counts.totalCategoryArea} results found in this category and area.
        </Text>
        <Text color="gray.600">Explore curated options and nearby related areas.</Text>
      </Box>

      {payload.entities.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top picks</Heading>
          <UnorderedList spacing={2} ml={5}>
            {payload.entities.map((item) => (
              <ListItem key={item.entity.id}>
                {item.entity.slug ? (
                  <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                    {item.entity.name}
                  </Link>
                ) : (
                  <Text as="span">{item.entity.name}</Text>
                )}{' '}
                <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {topRestaurants.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top restaurants nearby</Heading>
          <UnorderedList spacing={2} ml={5}>
            {topRestaurants.map((item) => (
              <ListItem key={item.entity.id}>
                {item.entity.slug ? (
                  <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                    {item.entity.name}
                  </Link>
                ) : (
                  <Text as="span">{item.entity.name}</Text>
                )}{' '}
                <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {topAttractions.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top attractions nearby</Heading>
          <UnorderedList spacing={2} ml={5}>
            {topAttractions.map((item) => (
              <ListItem key={item.entity.id}>
                {item.entity.slug ? (
                  <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                    {item.entity.name}
                  </Link>
                ) : (
                  <Text as="span">{item.entity.name}</Text>
                )}{' '}
                <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {topGuides.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top guides for this area</Heading>
          <UnorderedList spacing={2} ml={5}>
            {topGuides.map((guide) => (
              <ListItem key={guide.slug}>
                <Link as={NextLink} href={`/blog/${guide.slug}`} color="blue.600">
                  {guide.title}
                </Link>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {payload.relatedAreas.some((item) => item.passesThreshold) ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Nearby areas for this category</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {payload.relatedAreas
              .filter((item) => item.passesThreshold)
              .map((item) => (
              <Box key={item.areaId} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/${payload.category?.urlSlug}/${item.areaSlug}`} color="blue.600" fontWeight="semibold">
                  {payload.category?.name} in {item.areaName}
                </Link>
                <Text color="gray.600" fontSize="sm">{item.count} places</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {payload.relatedCategories.some((item) => item.passesThreshold) ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Related lists in {payload.area.name}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {payload.relatedCategories
              .filter((item) => item.passesThreshold)
              .map((item) => (
                <Box key={item.categoryId} borderWidth="1px" borderRadius="lg" p={4}>
                  <Link as={NextLink} href={`/${item.categorySlug}/${payload.area.urlSlug}`} color="blue.600" fontWeight="semibold">
                    {item.categoryName} in {payload.area.name}
                  </Link>
                  <Text color="gray.600" fontSize="sm">{item.count} places</Text>
                </Box>
              ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {hasAreaGuidePage ? (
        <Button as={NextLink} href={`/area/${payload.area.urlSlug}`} variant="outline" mr={3}>
          View area guide
        </Button>
      ) : null}
      <Button as={NextLink} href="/search" variant="outline">
        Explore all locations
      </Button>
    </Container>
  );
}
