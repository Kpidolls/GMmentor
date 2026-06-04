import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Button, Container, Divider, Heading, HStack, Link, ListItem, SimpleGrid, Text, UnorderedList } from '@chakra-ui/react';

import { buildBreadcrumbJsonLd, buildEntityJsonLd } from '../../lib/entityStructuredData';
import {
  EntityRecord,
  findEntityBySlug,
  getSameCategoryEntities,
  getSameRegionEntities,
  loadEntitiesIndex,
} from '../../lib/entities';
import { getMentionedGuidesForEntity } from '../../lib/knowledgeGraph';
import { calculateDistance, formatDistance } from '../../utils/locationUtils';

const SITE_URL = 'https://googlementor.com';

type EntityPageProps = {
  entity: EntityRecord;
  sameCategory: EntityRecord[];
  nearby: Array<EntityRecord & { distanceKm: number }>;
  sameRegion: EntityRecord[];
  mentionedGuides: Array<{ slug: string; title: string }>;
};

function displayContext(entity: EntityRecord): string {
  if (entity.address) return entity.address;
  if (entity.region) return entity.region;
  if (entity.kind === 'municipality' && entity.region_en) return entity.region_en;
  return 'Greece';
}

function kindLabel(entity: EntityRecord): string {
  if (entity.kind === 'restaurant') return 'Restaurant';
  if (entity.kind === 'municipality') return 'Municipality';
  if (entity.kind === 'attraction') return 'Tourist Attraction';
  return 'Local Place';
}

export const getStaticPaths: GetStaticPaths = async () => {
  const index = loadEntitiesIndex();
  const paths = index.entities
    .filter((entity) => Boolean(entity.slug))
    .map((entity) => ({ params: { slug: entity.slug } }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<EntityPageProps> = async ({ params }) => {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  if (!slug) return { notFound: true };

  const index = loadEntitiesIndex();
  const entity = findEntityBySlug(index.entities, slug);

  if (!entity) {
    return { notFound: true };
  }

  const nearbyWithDistance = index.entities
    .filter((candidate) => candidate.id !== entity.id)
    .map((candidate) => ({
      ...candidate,
      distanceKm: calculateDistance(entity.lat, entity.lng, candidate.lat, candidate.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);

  return {
    props: {
      entity,
      sameCategory: getSameCategoryEntities(entity, index.entities, 8),
      nearby: nearbyWithDistance,
      sameRegion: getSameRegionEntities(entity, index.entities, 8),
      mentionedGuides: getMentionedGuidesForEntity(entity, 8).map((post) => ({
        slug: post.slug,
        title: post.title,
      })),
    },
  };
};

export default function PlacePage({ entity, sameCategory, nearby, sameRegion, mentionedGuides }: EntityPageProps) {
  const canonicalUrl = `${SITE_URL}/place/${entity.slug}`;
  const context = displayContext(entity);
  const subjectOfUrls = mentionedGuides.map((guide) => `${SITE_URL}/blog/${guide.slug}`);
  const entityJsonLd = buildEntityJsonLd(entity, canonicalUrl, subjectOfUrls);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(entity, canonicalUrl);

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>{`${entity.name} | ${kindLabel(entity)} | Googlementor`}</title>
        <meta
          name="description"
          content={`${entity.name} in ${context}. Discover details, nearby places, and a direct Google Maps link on Googlementor.`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <Box mb={8}>
        <Text fontSize="sm" color="gray.500" mb={2}>
          {kindLabel(entity)}
        </Text>
        <Heading as="h1" size="2xl" mb={3}>
          {entity.name} - {context}
        </Heading>
        <Text color="gray.700" mb={4}>
          Coordinates: {entity.lat.toFixed(6)}, {entity.lng.toFixed(6)}
        </Text>
        <HStack spacing={3} flexWrap="wrap">
          <Button as={Link} href={entity.url || `https://www.google.com/maps/search/?api=1&query=${entity.lat},${entity.lng}`} isExternal colorScheme="blue">
            View on Google Maps
          </Button>
          <Button as={NextLink} href="/search" variant="outline">
            Explore More Places
          </Button>
        </HStack>
      </Box>

      {entity.aliases?.length ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            Alternative Names
          </Heading>
          <Text color="gray.700">{entity.aliases.join(', ')}</Text>
        </Box>
      ) : null}

      {sameCategory.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            Related in the Same Category
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {sameCategory.map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                  {candidate.name}
                </Link>
                {candidate.address ? <Text color="gray.600" fontSize="sm" mt={1}>{candidate.address}</Text> : null}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      <Divider my={8} />

      {nearby.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            Nearby Places
          </Heading>
          <UnorderedList spacing={2} ml={5}>
            {nearby.map((candidate) => (
              <ListItem key={candidate.id}>
                <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600">
                  {candidate.name}
                </Link>{' '}
                <Text as="span" color="gray.600">({formatDistance(candidate.distanceKm)})</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}

      {sameRegion.length > 0 ? (
        <Box>
          <Heading as="h2" size="md" mb={3}>
            In the Same Region
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {sameRegion.map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                  {candidate.name}
                </Link>
                {candidate.region ? <Text color="gray.600" fontSize="sm" mt={1}>{candidate.region}</Text> : null}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {mentionedGuides.length > 0 ? (
        <Box mt={8}>
          <Heading as="h2" size="md" mb={3}>
            Mentioned in Guides
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {mentionedGuides.map((guide) => (
              <Box key={guide.slug} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/blog/${guide.slug}`} color="blue.600" fontWeight="semibold">
                  {guide.title}
                </Link>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}
    </Container>
  );
}
