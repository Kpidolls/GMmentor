import { useEffect, useMemo, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Image,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { buildBreadcrumbJsonLd, buildEntityJsonLd } from '../../lib/entityStructuredData';
import {
  buildEntitySeoSignature,
  EntityRecord,
  findEntityBySlug,
  getSameCategoryEntities,
  getSameRegionEntities,
  loadEntitiesIndex,
} from '../../lib/entities';
import { getMentionedGuidesForEntity } from '../../lib/knowledgeGraph';
import { getPlaceEnrichmentByEntityId, PlaceEnrichment } from '../../lib/placeEnrichment';
import { calculateDistance, formatDistance } from '../../utils/locationUtils';
import { buildPlaceMetaDescription } from '../../config/metaDescriptions';
import { dispatchAddToItinerary } from '../../utils/itineraryEvents';

const SITE_URL = 'https://googlementor.com';

type EntityPageProps = {
  entity: EntityRecord;
  sameCategory: EntityRecord[];
  nearby: Array<EntityRecord & { distanceKm: number }>;
  sameRegion: EntityRecord[];
  mentionedGuides: Array<{ slug: string; title: string }>;
  canonicalSlug: string;
  isCanonicalEntity: boolean;
  enrichment: PlaceEnrichment['effective'] | null;
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

function fallbackSummary(entity: EntityRecord, context: string): { en: string; el: string } {
  return {
    en: `${entity.name} is a curated ${kindLabel(entity).toLowerCase()} in ${context}. Use this page to build a stronger route with nearby places and practical planning actions.`,
    el: `${entity.name} einai ena epilegmeno simeio stin perioxi ${context}. Xrisimopoiiste ti selida gia kaliteri diadromi me kontines protaseis kai praktikes energeies.`,
  };
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number): void {
  const words = text.split(/\s+/).filter(Boolean);
  let line = '';
  let lineIndex = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      lineIndex += 1;
      line = word;
      if (lineIndex >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (lineIndex < maxLines && line) {
    const finalText = lineIndex === maxLines - 1 && ctx.measureText(line).width > maxWidth
      ? `${line.slice(0, Math.max(0, line.length - 3))}...`
      : line;
    ctx.fillText(finalText, x, y + lineIndex * lineHeight);
  }
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

  const seoSignature = buildEntitySeoSignature(entity);
  const canonicalEntity = index.entities
    .filter((candidate) => buildEntitySeoSignature(candidate) === seoSignature)
    .sort((left, right) => left.slug.localeCompare(right.slug))[0] || entity;

  const nearbyCandidates = index.entities.filter((candidate) => {
    if (candidate.id === entity.id) {
      return false;
    }

    // Build-time optimization: keep candidates local by region or coordinate box.
    const inSameRegion = Boolean(entity.region && candidate.region && candidate.region === entity.region);
    const inBoundingBox =
      Math.abs(candidate.lat - entity.lat) <= 0.28 &&
      Math.abs(candidate.lng - entity.lng) <= 0.28;

    return inSameRegion || inBoundingBox;
  });

  const nearbyWithDistance = nearbyCandidates
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
      canonicalSlug: canonicalEntity.slug,
      isCanonicalEntity: canonicalEntity.slug === entity.slug,
      enrichment: getPlaceEnrichmentByEntityId(entity.id)?.effective || null,
    },
  };
};

export default function PlacePage({ entity, sameCategory, nearby, sameRegion, mentionedGuides, canonicalSlug, isCanonicalEntity, enrichment }: EntityPageProps) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [socialPosterPreview, setSocialPosterPreview] = useState('');
  const canonicalUrl = `${SITE_URL}/place/${canonicalSlug}`;
  const isSanZachariFeatured = canonicalSlug === 'san-zachari-4ba5';
  const context = displayContext(entity);
  const isGreek = i18n.language?.startsWith('el');
  const fallback = fallbackSummary(entity, context);
  const effectiveEnrichment = enrichment || {
    summary_en: fallback.en,
    summary_el: fallback.el,
    vibe_tags: ['curated', 'discoverable'],
    best_for: ['first-time visitors', 'route planners'],
    visit_moments: ['daytime visit'],
    practical_note: 'Use this page to connect nearby places and build a stronger route.',
    nearby_walkable_count: nearby.filter((item) => item.distanceKm <= 0.8).length,
    nearby_count_2km: nearby.filter((item) => item.distanceKm <= 2).length,
    confidence: 0.7,
  };
  const defaultSummary = isGreek ? effectiveEnrichment.summary_el : effectiveEnrichment.summary_en;
  const primaryCategory = entity.categories?.find(Boolean);
  const primaryCategoryId = entity.categoryIds?.[0];
  const primaryCategoryLabel = primaryCategoryId
    ? t(`place.categoryNames.${primaryCategoryId}`, primaryCategory || primaryCategoryId)
    : (primaryCategory || t('common.greece', 'Greece'));
  const localizedKind = entity.kind === 'restaurant'
    ? t('place.kind.restaurant', 'Restaurant')
    : entity.kind === 'municipality'
      ? t('place.kind.municipality', 'Municipality')
      : entity.kind === 'attraction'
        ? t('place.kind.attraction', 'Tourist Attraction')
        : t('place.kind.localPlace', 'Local Place');
  const categoryBadgeLabels = (entity.categoryIds || [])
    .map((categoryId, index) => {
      const fallbackCategoryName = entity.categories?.[index] || categoryId;
      return t(`place.categoryNames.${categoryId}`, fallbackCategoryName);
    })
    .filter(Boolean)
    .slice(0, 2);
  const summary = isSanZachariFeatured
    ? (isGreek
      ? `${entity.name} είναι επιλεγμένο ζαχαροπλαστείο στη ${context}. Αγαπημένο των ντόπιων, με κοντινές προτάσεις Googlementor για εύκολη διαδρομή.`
      : `${entity.name} is a featured dessert shop in ${context}. A local favorite with nearby Googlementor picks to help you build an easy route.`)
    : defaultSummary;
  const showKindBadge = !(entity.kind === 'restaurant' && categoryBadgeLabels.length > 0);
  const metaDescription = buildPlaceMetaDescription({
    placeName: entity.name,
    context,
    typeLabel: localizedKind,
    categoryLabel: primaryCategory,
  });
  const subjectOfUrls = mentionedGuides.map((guide) => `${SITE_URL}/blog/${guide.slug}`);
  const entityJsonLd = buildEntityJsonLd(entity, canonicalUrl, subjectOfUrls);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(entity, canonicalUrl);
  const shareTitle = `${entity.name} | ${localizedKind} | Googlementor`;
  const shareText = `${entity.name} - ${summary}`;
  const featuredVibeRaw = effectiveEnrichment.vibe_tags[0] || 'curated';
  const featuredVibe = t(`place.dynamicTags.${featuredVibeRaw}`, featuredVibeRaw);
  const similarPlaces = sameCategory.slice(0, 3);
  const nearbyGroupedByCategory = useMemo(() => {
    const grouped = new Map<string, { label: string; items: Array<EntityRecord & { distanceKm: number }> }>();

    nearby.forEach((candidate) => {
      const ids = candidate.categoryIds?.length ? candidate.categoryIds : ['uncategorized'];

      ids.forEach((categoryId, index) => {
        const fallbackCategoryName = candidate.categories?.[index] || categoryId;
        const label = categoryId === 'uncategorized'
          ? t('place.nearby.uncategorized', 'Other')
          : t(`place.categoryNames.${categoryId}`, fallbackCategoryName);

        if (!grouped.has(label)) {
          grouped.set(label, { label, items: [] });
        }

        grouped.get(label)?.items.push(candidate);
      });
    });

    return Array.from(grouped.values());
  }, [nearby, t]);
  const shareReason = t('place.share.reason', {
    name: entity.name,
    vibe: featuredVibe,
    nearby: effectiveEnrichment.nearby_walkable_count,
    defaultValue:
      '{{name}} stands out for its {{vibe}} vibe and its connection to {{nearby}} walkable discoveries nearby. This is exactly the type of place worth sharing with friends before your trip.',
  });
  const shareCaption = t('place.share.singleCaption', {
    name: entity.name,
    context,
    defaultValue: `Proud to see ${entity.name} featured on Googlementor. A local favorite in ${context} worth discovering.`,
  });
  const promoBadgeText = 'GOOGLEMENTOR FEATURED';
  const promoPlaceName = isSanZachariFeatured ? 'Σαν Ζάχαρη' : entity.name;
  const promoCategoryAddress = isSanZachariFeatured
    ? 'Dessert Shops · Ελ. Βενιζέλου 119, Νέα Ιωνία'
    : `${entity.kind === 'restaurant' && categoryBadgeLabels.length > 0 ? categoryBadgeLabels[0] : localizedKind} · ${context}`;
  const promoHighlight = isSanZachariFeatured
    ? 'Αγαπημένο των ντόπιων. Αξίζει κοινοποίηση.'
    : t('place.share.posterLine', 'Loved by locals. Worth sharing.');
  const promoLink = isSanZachariFeatured
    ? 'googlementor.com/place/san-zachari-4ba5'
    : canonicalUrl.replace(/^https?:\/\//, '');
  const promoTags = useMemo(
    () => (isSanZachariFeatured
      ? ['Ζαχαροπλαστεία', 'Επιλεγμένο']
      : [primaryCategoryLabel, featuredVibe].filter(Boolean)),
    [featuredVibe, isSanZachariFeatured, primaryCategoryLabel]
  );

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const width = 1080;
    const height = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const drawRoundedRect = (
      drawCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number
    ) => {
      const r = Math.min(radius, w / 2, h / 2);
      drawCtx.beginPath();
      drawCtx.moveTo(x + r, y);
      drawCtx.lineTo(x + w - r, y);
      drawCtx.quadraticCurveTo(x + w, y, x + w, y + r);
      drawCtx.lineTo(x + w, y + h - r);
      drawCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      drawCtx.lineTo(x + r, y + h);
      drawCtx.quadraticCurveTo(x, y + h, x, y + h - r);
      drawCtx.lineTo(x, y + r);
      drawCtx.quadraticCurveTo(x, y, x + r, y);
      drawCtx.closePath();
    };

    const drawTag = (label: string, x: number, y: number) => {
      ctx.font = '600 28px Roboto, Arial, sans-serif';
      const horizontalPadding = 26;
      const tagWidth = ctx.measureText(label).width + horizontalPadding * 2;
      const tagHeight = 52;

      drawRoundedRect(ctx, x, y, tagWidth, tagHeight, 26);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillText(label, x + horizontalPadding, y + 35);
      return tagWidth;
    };

    ctx.fillStyle = '#f5f1e8';
    ctx.fillRect(0, 0, width, height);

    drawRoundedRect(ctx, 70, 90, width - 140, height - 180, 44);
    ctx.fillStyle = '#0f1720';
    ctx.fill();

    ctx.strokeStyle = '#d4b883';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawRoundedRect(ctx, 120, 150, 430, 58, 29);
    ctx.fillStyle = '#e7c87e';
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.font = '700 30px Roboto, Arial, sans-serif';
    ctx.fillText(promoBadgeText, 145, 189);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 108px Roboto, Arial, sans-serif';
    wrapCanvasText(ctx, promoPlaceName, 120, 360, width - 240, 114, 3);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 34px Roboto, Arial, sans-serif';
    wrapCanvasText(ctx, promoCategoryAddress, 120, 680, width - 240, 48, 2);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 42px Roboto, Arial, sans-serif';
    wrapCanvasText(ctx, promoHighlight, 120, 790, width - 240, 56, 2);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 900);
    ctx.lineTo(width - 120, 900);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 30px Roboto, Arial, sans-serif';
    wrapCanvasText(ctx, promoLink, 120, 968, width - 240, 42, 2);

    let tagX = 120;
    const tagY = 1044;
    const tagSpacing = 18;
    for (const tag of promoTags.slice(0, 3)) {
      if (!tag) {
        continue;
      }

      const tagWidth = drawTag(tag, tagX, tagY);
      tagX += tagWidth + tagSpacing;
      if (tagX > width - 180) {
        break;
      }
    }

    setSocialPosterPreview(canvas.toDataURL('image/png'));
  }, [canonicalUrl, context, entity.name, featuredVibe, isSanZachariFeatured, localizedKind, primaryCategoryLabel, promoBadgeText, promoCategoryAddress, promoHighlight, promoLink, promoPlaceName, promoTags, t]);

  const handleAddToItinerary = () => {
    dispatchAddToItinerary({
      id: entity.id,
      name: entity.name,
      type: entity.kind === 'municipality' ? 'area' : 'place',
      url: entity.url || `${SITE_URL}/place/${canonicalSlug}`,
      notes: summary,
    });

    toast({
      title: t('place.celebration.title', 'Added to your route'),
      description: t('place.celebration.description', { name: entity.name, defaultValue: '{{name}} is now part of your trip plan.' }),
      status: 'success',
      duration: 2800,
      isClosable: true,
    });
  };

  const handleCopyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast({
        title: t('place.share.copied', 'Link copied'),
        status: 'success',
        duration: 2200,
        isClosable: true,
      });
    } catch {
      toast({
        title: t('place.share.copyFailed', 'Could not copy link'),
        status: 'error',
        duration: 2200,
        isClosable: true,
      });
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare || typeof navigator === 'undefined') {
      return;
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: canonicalUrl,
      });
    } catch {
      // Ignore cancellation and transient errors.
    }
  };

  const handleDownloadPromo = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const dataUrl = socialPosterPreview;

    if (!dataUrl) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = `${entity.slug || entity.id}-social-poster.png`;
    anchor.click();

    toast({
      title: t('place.promo.downloaded', 'Promo card downloaded'),
      description: t('place.promo.readyToPost', 'Ready for Instagram, TikTok, WhatsApp, and Facebook.'),
      status: 'success',
      duration: 3200,
      isClosable: true,
    });
  };

  const handleCopyCaption = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareCaption);
      setCopiedCaption(true);
      window.setTimeout(() => setCopiedCaption(false), 1800);
      toast({
        title: t('place.share.captionCopied', 'Caption copied'),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: t('place.share.copyFailed', 'Could not copy link'),
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>{`${entity.name} | ${localizedKind} | Googlementor`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={isCanonicalEntity ? 'index, follow' : 'noindex, follow'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <Box mb={8} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 8 }} bg="white" boxShadow="sm">
        <HStack spacing={2} mb={3} flexWrap="wrap">
          {showKindBadge ? <Badge colorScheme="blue" textTransform="none">{localizedKind}</Badge> : null}
          {categoryBadgeLabels.length > 0
            ? categoryBadgeLabels.map((categoryLabel) => (
              <Badge key={categoryLabel} colorScheme="teal" textTransform="none">{categoryLabel}</Badge>
            ))
            : primaryCategory
              ? <Badge colorScheme="teal" textTransform="none">{primaryCategoryLabel}</Badge>
              : null}
          <Badge colorScheme="gray" textTransform="none">{context}</Badge>
        </HStack>
        <Heading as="h1" size="2xl" mb={3}>
          {entity.name}
        </Heading>
        <Text color="gray.700" mb={4} lineHeight="1.8">
          {summary}
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={5}>
          <Box borderWidth="1px" borderRadius="lg" p={3} bg="gray.50">
            <Text fontSize="xs" color="gray.600">{t('place.stats.walkable', 'Walkable nearby picks')}</Text>
            <Text fontWeight="bold" fontSize="xl">{effectiveEnrichment.nearby_walkable_count}</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="lg" p={3} bg="gray.50">
            <Text fontSize="xs" color="gray.600">{t('place.stats.nearby2km', 'Nearby within 2km')}</Text>
            <Text fontWeight="bold" fontSize="xl">{effectiveEnrichment.nearby_count_2km}</Text>
          </Box>
        </SimpleGrid>

        <HStack spacing={3} flexWrap="wrap" align="stretch" w="full">
          <Button
            as={Link}
            href={entity.url || `https://www.google.com/maps/search/?api=1&query=${entity.lat},${entity.lng}`}
            isExternal
            colorScheme="blue"
            minH="44px"
            w={{ base: '100%', sm: 'auto' }}
          >
            {t('place.openDirections', 'Open directions in Google Maps')}
          </Button>
          <Button
            variant="outline"
            colorScheme="teal"
            minH="44px"
            w={{ base: '100%', sm: 'auto' }}
            whiteSpace="normal"
            lineHeight="short"
            textAlign="center"
            onClick={handleAddToItinerary}
          >
            {t('place.addToItinerary', 'Add to itinerary')}
          </Button>
          <Button as={NextLink} href="/search" variant="outline" minH="44px" w={{ base: '100%', sm: 'auto' }}>
            {t('place.exploreMore', 'Explore More Places')}
          </Button>
        </HStack>
      </Box>

      <Box mb={8} borderWidth="1px" borderColor="blue.100" borderRadius="xl" p={5} bg="white" boxShadow="sm">
        <Heading as="h2" size="md" mb={3}>{t('place.share.title', 'This place deserves to be shared')}</Heading>
        <Text color="gray.700" mb={4}>{shareReason}</Text>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <Box borderWidth="1px" borderRadius="lg" p={3} bg="white">
            <Heading as="h3" size="sm" mb={3}>{t('place.promo.posterTitle', 'Social poster preview')}</Heading>
            {socialPosterPreview ? (
              <Image
                src={socialPosterPreview}
                alt={t('place.promo.previewAlt', { name: entity.name, defaultValue: 'Promo card preview for {{name}}' })}
                w="full"
                h={{ base: '360px', md: '420px' }}
                objectFit="cover"
                borderRadius="md"
                borderWidth="1px"
              />
            ) : (
              <Box h="260px" borderWidth="1px" borderRadius="md" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="sm" color="gray.500">{t('place.promo.generating', 'Generating preview...')}</Text>
              </Box>
            )}
          </Box>

          <VStack align="stretch" spacing={3}>
            <Box borderWidth="1px" borderRadius="lg" p={3} bg="white">
              <Heading as="h3" size="sm" mb={3}>{t('place.share.captionsTitle', 'Ready-to-share caption')}</Heading>
              <Box borderWidth="1px" borderRadius="md" p={3}>
                <Text fontSize="sm" color="gray.700" mb={2}>{shareCaption}</Text>
                <Button size="xs" variant="outline" onClick={handleCopyCaption}>
                  {copiedCaption ? t('place.share.copiedShort', 'Copied') : t('place.share.copyCaption', 'Copy caption')}
                </Button>
              </Box>
            </Box>

            <HStack spacing={2} flexWrap="wrap">
              <Button size="sm" colorScheme="blue" onClick={handleDownloadPromo}>
                {t('place.promo.downloadPoster', 'Download social poster')}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                {copied ? t('place.share.copiedShort', 'Copied') : t('place.share.copyLink', 'Copy link')}
              </Button>
              {canNativeShare ? (
                <Button size="sm" variant="outline" colorScheme="teal" onClick={handleNativeShare}>
                  {t('place.share.native', 'Share')}
                </Button>
              ) : null}
            </HStack>

            <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
              <Heading as="h3" size="sm" mb={2}>{t('place.share.similarTitle', 'Similar places you can also share')}</Heading>
              {similarPlaces.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {similarPlaces.map((candidate) => (
                    <Box key={candidate.id} borderWidth="1px" borderRadius="md" p={3}>
                      <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.700" fontWeight="semibold">
                        {candidate.name}
                      </Link>
                      <Text fontSize="sm" color="gray.600" mt={1}>{candidate.address || candidate.region || t('common.greece', 'Greece')}</Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.600">{t('place.share.similarFallback', 'More similar places will appear as this category grows.')}</Text>
              )}
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>

      {sameCategory.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            {t('place.sameCategory.title', 'Try next in the same category')}
          </Heading>
          <Text color="gray.600" mb={3}>{t('place.sameCategory.subtitle', 'If you liked this pick, these are strong alternatives nearby.')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {sameCategory.slice(0, 6).map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4}>
                <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                  {candidate.name}
                </Link>
                <Text color="gray.600" fontSize="sm" mt={1}>{candidate.address || candidate.region || t('common.greece', 'Greece')}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {nearby.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            {t('place.nearby.title', 'Closest useful stops')}
          </Heading>
          <VStack align="stretch" spacing={3}>
            {nearbyGroupedByCategory.map((group) => (
              <Box key={group.label} borderWidth="1px" borderRadius="lg" p={3} bg="white">
                <Text fontSize="sm" fontWeight="semibold" color="gray.800" mb={2}>
                  {group.label}
                </Text>
                <UnorderedList spacing={1} ml={5}>
                  {group.items.map((candidate) => (
                    <ListItem key={`${group.label}-${candidate.id}`}>
                      <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600">
                        {candidate.name}
                      </Link>{' '}
                      <Text as="span" color="gray.600">({formatDistance(candidate.distanceKm)})</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            ))}
          </VStack>
        </Box>
      ) : null}

      {entity.aliases?.length ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            {t('place.aliases.title', 'Alternative names')}
          </Heading>
          <Text color="gray.700">{entity.aliases.join(', ')}</Text>
        </Box>
      ) : null}

      {sameRegion.length > 0 ? (
        <Box>
          <Heading as="h2" size="md" mb={3}>
            {t('place.sameRegion.title', 'Explore more in this area')}
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
            {t('place.guides.title', 'Trusted guide mentions')}
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
