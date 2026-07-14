import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { createIntentEngine } from '../../lib/intent';
import { loadEntitiesIndex } from '../../lib/entities';
import type { IntentResultsPayload } from '../../lib/intent';
import { formatDistance } from '../../utils/locationUtils';
import { buildAreaMetaDescription } from '../../config/metaDescriptions';
import { dispatchAddToItinerary } from '../../utils/itineraryEvents';

const SITE_URL = 'https://googlementor.com';

type IntentCoverage = {
  generatedAreaRoutes?: string[];
};

type AreaPageProps = {
  payload: IntentResultsPayload;
  topGuides: Array<{
    slug: string;
    title: string;
    date: string;
  }>;
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

function buildGuideItemListJsonLd(
  areaName: string,
  canonicalUrl: string,
  topGuides: Array<{ slug: string; title: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top guides for ${areaName}`,
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
  const coveragePath = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
  try {
    const coverage = JSON.parse(readFileSync(coveragePath, 'utf8')) as IntentCoverage;
    const areaRoutes = Array.isArray(coverage.generatedAreaRoutes) ? coverage.generatedAreaRoutes : [];
    if (areaRoutes.length > 0) {
      return {
        paths: areaRoutes.map((area) => ({ params: { area } })),
        fallback: false,
      };
    }
  } catch {
    // Fall back to live engine generation when the artifact is unavailable.
  }

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
  if (!payload || payload.entities.length === 0) {
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
      topGuides,
    },
  };
};

export default function AreaPage({ payload, topGuides }: AreaPageProps) {
  const { t } = useTranslation();
  const canonicalUrl = `${SITE_URL}/area/${payload.area.urlSlug}`;
  const title = `Best places in ${payload.area.name} | Googlementor`;
  const description = buildAreaMetaDescription({
    areaName: payload.area.nameEn || payload.area.name,
    regionName: payload.area.regionEn || payload.area.region,
    count: payload.counts.totalInArea,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(payload.area.urlSlug, payload.area.name);
  const collectionJsonLd = buildCollectionJsonLd(payload, canonicalUrl);
  const topAttractions = payload.entities.filter((item) => item.entity.categoryIds?.includes('attractions')).slice(0, 10);
  const topRestaurants = payload.entities
    .filter((item) => item.entity.kind === 'restaurant' && !item.entity.categoryIds?.includes('attractions'))
    .slice(0, 10);
  const topPlaces = payload.entities.slice(0, 12);
  const guidesItemListJsonLd =
    topGuides.length > 0 ? buildGuideItemListJsonLd(payload.area.name, canonicalUrl, topGuides) : null;

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="el" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
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

      <Box
        mb={8}
        borderWidth="1px"
        borderColor="orange.100"
        borderRadius="2xl"
        p={{ base: 5, md: 8 }}
        bg="white"
        boxShadow="sm"
      >
        <VStack align="stretch" spacing={4}>
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="orange" textTransform="none">Area Guide</Badge>
            <Badge colorScheme="gray" textTransform="none">Curated picks</Badge>
            {payload.area.regionEn || payload.area.region ? (
              <Badge colorScheme="blue" textTransform="none">
                {payload.area.regionEn || payload.area.region}
              </Badge>
            ) : null}
          </HStack>

          <Heading as="h1" size="2xl">
            Best places in {payload.area.name}
          </Heading>

          <Text color="gray.700" lineHeight="1.7">
            {payload.counts.totalInArea} places found near {payload.area.name}.
            {' '}This guide highlights high-signal options with map-ready links, plus related categories and nearby areas.
          </Text>

          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="teal" textTransform="none">{topPlaces.length} featured places</Badge>
            <Badge colorScheme="teal" textTransform="none">{topAttractions.length} attractions</Badge>
            <Badge colorScheme="teal" textTransform="none">{topRestaurants.length} restaurants</Badge>
          </HStack>
        </VStack>
      </Box>

      {payload.relatedCategories.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Related lists in this area</Heading>
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
                <Button
                  size="sm"
                  mt={2}
                  variant="outline"
                  colorScheme="teal"
                  minH="42px"
                  w={{ base: '100%', sm: 'auto' }}
                  whiteSpace="normal"
                  lineHeight="short"
                  textAlign="center"
                  onClick={() =>
                    dispatchAddToItinerary({
                      id: `${item.categoryId}-${payload.area.urlSlug}`,
                      name: `${item.categoryName} in ${payload.area.name}`,
                      type: 'guide',
                      url: item.passesThreshold ? `${SITE_URL}/${item.categorySlug}/${payload.area.urlSlug}` : undefined,
                    })
                  }
                >
                  {t('place.addToItinerary', 'Add to itinerary')}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {topAttractions.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top attractions in {payload.area.name}</Heading>
          <UnorderedList spacing={2} ml={5}>
            {topAttractions.map((item) => (
              <ListItem key={item.entity.id}>
                <Box display="flex" flexWrap="wrap" alignItems="center" columnGap={2} rowGap={2}>
                  {item.entity.slug ? (
                    <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                      {item.entity.name}
                    </Link>
                  ) : (
                    <Text as="span">{item.entity.name}</Text>
                  )}
                  <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  minH="40px"
                  w={{ base: '100%', sm: 'auto' }}
                  justifyContent="center"
                  px={3}
                  whiteSpace="normal"
                  lineHeight="short"
                  textAlign="center"
                  onClick={() =>
                    dispatchAddToItinerary({
                      id: item.entity.id,
                      name: item.entity.name,
                      type: item.entity.kind === 'municipality' ? 'area' : 'place',
                      url: item.entity.slug ? `${SITE_URL}/place/${item.entity.slug}` : item.entity.url || undefined,
                    })
                  }
                >
                  {t('itinerary.addItem', 'Add point')}
                </Button>
                </Box>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {topRestaurants.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top restaurants in {payload.area.name}</Heading>
          <UnorderedList spacing={2} ml={5}>
            {topRestaurants.map((item) => (
              <ListItem key={item.entity.id}>
                <Box display="flex" flexWrap="wrap" alignItems="center" columnGap={2} rowGap={2}>
                  {item.entity.slug ? (
                    <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                      {item.entity.name}
                    </Link>
                  ) : (
                    <Text as="span">{item.entity.name}</Text>
                  )}
                  <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  minH="40px"
                  w={{ base: '100%', sm: 'auto' }}
                  justifyContent="center"
                  px={3}
                  whiteSpace="normal"
                  lineHeight="short"
                  textAlign="center"
                  onClick={() =>
                    dispatchAddToItinerary({
                      id: item.entity.id,
                      name: item.entity.name,
                      type: item.entity.kind === 'municipality' ? 'area' : 'place',
                      url: item.entity.slug ? `${SITE_URL}/place/${item.entity.slug}` : item.entity.url || undefined,
                    })
                  }
                >
                  {t('itinerary.addItem', 'Add point')}
                </Button>
                </Box>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {topGuides.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>Top guides for {payload.area.name}</Heading>
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

      <Box mb={8}>
        <Heading as="h2" size="md" mb={3}>Top places near {payload.area.name}</Heading>
        <UnorderedList spacing={2} ml={5}>
          {topPlaces.map((item) => (
            <ListItem key={item.entity.id}>
              <Box display="flex" flexWrap="wrap" alignItems="center" columnGap={2} rowGap={2}>
                {item.entity.slug ? (
                  <Link as={NextLink} href={`/place/${item.entity.slug}`} color="blue.600">
                    {item.entity.name}
                  </Link>
                ) : (
                  <Text as="span">{item.entity.name}</Text>
                )}
                <Text as="span" color="gray.600">({formatDistance(item.distanceKm)})</Text>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="teal"
                minH="40px"
                w={{ base: '100%', sm: 'auto' }}
                justifyContent="center"
                px={3}
                whiteSpace="normal"
                lineHeight="short"
                textAlign="center"
                onClick={() =>
                  dispatchAddToItinerary({
                    id: item.entity.id,
                    name: item.entity.name,
                    type: item.entity.kind === 'municipality' ? 'area' : 'place',
                    url: item.entity.slug ? `${SITE_URL}/place/${item.entity.slug}` : item.entity.url || undefined,
                  })
                }
              >
                {t('itinerary.addItem', 'Add point')}
              </Button>
              </Box>
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
                <Button
                  size="sm"
                  mt={2}
                  variant="outline"
                  colorScheme="teal"
                  minH="42px"
                  w={{ base: '100%', sm: 'auto' }}
                  whiteSpace="normal"
                  lineHeight="short"
                  textAlign="center"
                  onClick={() =>
                    dispatchAddToItinerary({
                      id: item.areaId,
                      name: item.areaName,
                      type: 'area',
                      url: `${SITE_URL}/area/${item.areaSlug}`,
                    })
                  }
                >
                  {t('place.addToItinerary', 'Add to itinerary')}
                </Button>
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
