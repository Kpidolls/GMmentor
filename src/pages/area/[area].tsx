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

type AreaPageProps = {
  payload: IntentResultsPayload;
};

function buildBreadcrumbJsonLd(areaSlug: string, areaName: string): Record<string, unknown> {
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
        name: 'Areas',
        item: `${SITE_URL}/search`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: areaName,
        item: `${SITE_URL}/area/${areaSlug}`,
      },
    ],
  };
}

function buildCollectionJsonLd(payload: IntentResultsPayload, canonicalUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Best places in ${payload.area.name}`,
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

export const getStaticPaths: GetStaticPaths = async () => {
  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });

  const paths = engine.areas.records
    .filter((area) => {
      const payload = engine.query.getIntentResults({ areaId: area.id });
      return Boolean(payload?.passesThreshold);
    })
    .map((area) => ({ params: { area: area.urlSlug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<AreaPageProps> = async ({ params }) => {
  const areaSlug = Array.isArray(params?.area) ? params.area[0] : params?.area;
  if (!areaSlug) {
    return { notFound: true };
  }

  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });
  const area = engine.areas.records.find((record) => record.urlSlug === areaSlug);
  if (!area) {
    return { notFound: true };
  }

  const payload = engine.query.getIntentResults({ areaId: area.id, limit: 30, relatedLimit: 10 });
  if (!payload || !payload.passesThreshold) {
    return { notFound: true };
  }

  return {
    props: {
      payload,
    },
  };
};

export default function AreaPage({ payload }: AreaPageProps) {
  const canonicalUrl = `${SITE_URL}/area/${payload.area.urlSlug}`;
  const title = `Best places in ${payload.area.name} | Googlementor`;
  const description = `Discover ${payload.counts.totalInArea} curated places in ${payload.area.name}, with nearby alternatives and top categories.`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(payload.area.urlSlug, payload.area.name);
  const collectionJsonLd = buildCollectionJsonLd(payload, canonicalUrl);

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
      </Head>

      <Box mb={8}>
        <Text fontSize="sm" color="gray.500" mb={2}>Area Guide</Text>
        <Heading as="h1" size="2xl" mb={3}>
          Best places in {payload.area.name}
        </Heading>
        <Text color="gray.700" mb={2}>
          {payload.counts.totalInArea} places found near {payload.area.name}
          {payload.area.regionEn ? ` (${payload.area.regionEn})` : payload.area.region ? ` (${payload.area.region})` : ''}.
        </Text>
        <Text color="gray.600">
          Explore curated local picks and jump to maps or related areas.
        </Text>
      </Box>

      {payload.relatedCategories.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top categories in this area</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {payload.relatedCategories.map((item) => (
              <Box key={item.categoryId} borderWidth="1px" borderRadius="lg" p={4}>
                {item.passesThreshold ? (
                  <Link
                    as={NextLink}
                    href={`/${item.categorySlug}/${payload.area.urlSlug}`}
                    color="blue.600"
                    fontWeight="semibold"
                  >
                    {item.categoryName}
                  </Link>
                ) : (
                  <Text fontWeight="semibold">{item.categoryName}</Text>
                )}
                <Text color="gray.600" fontSize="sm">{item.count} places nearby</Text>
                {item.passesThreshold ? (
                  <Text color="blue.600" fontSize="sm" mt={1}>
                    View {item.categoryName.toLowerCase()} in {payload.area.name}
                  </Text>
                ) : null}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      <Box mb={8}>
        <Heading as="h2" size="md" mb={3}>Top places near {payload.area.name}</Heading>
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

      {payload.relatedAreas.some((item) => item.passesThreshold) ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Related nearby areas</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {payload.relatedAreas
              .filter((item) => item.passesThreshold)
              .map((item) => (
              <Box key={item.areaId} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/area/${item.areaSlug}`} color="blue.600" fontWeight="semibold">
                  {item.areaName}
                </Link>
                <Text color="gray.600" fontSize="sm">{item.count} places</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      <Button as={NextLink} href="/search" variant="outline">
        Explore all locations
      </Button>
    </Container>
  );
}
