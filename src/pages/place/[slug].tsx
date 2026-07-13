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
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { buildBreadcrumbJsonLd, buildEntityJsonLd } from '../../lib/entityStructuredData';
import {
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

type CategoryNarrativeProfile = {
  typeLabelKey: string;
  bestForDefaults: string[];
  visitMomentDefaults: string[];
};

const GENERIC_BEST_FOR_TAGS = new Set(['first-time visitors', 'food lovers', 'route planners']);
const GENERIC_VISIT_MOMENT_TAGS = new Set(['lunch stop', 'dinner stop', 'daytime visit']);

const CATEGORY_NARRATIVE_PROFILES: Record<string, CategoryNarrativeProfile> = {
  'family-friendly': {
    typeLabelKey: 'familyFriendlySpot',
    bestForDefaults: ['families with kids', 'parents with children'],
    visitMomentDefaults: ['quick family lunch', 'relaxed family dinner'],
  },
  'coffee-brunch': {
    typeLabelKey: 'cafe',
    bestForDefaults: ['coffee lovers', 'remote workers'],
    visitMomentDefaults: ['late brunch', 'afternoon break'],
  },
  desserts: {
    typeLabelKey: 'dessertShop',
    bestForDefaults: ['dessert lovers', 'families with kids'],
    visitMomentDefaults: ['afternoon break', 'after dinner'],
  },
  'cheap-eats': {
    typeLabelKey: 'streetFoodSpot',
    bestForDefaults: ['budget travelers', 'food lovers'],
    visitMomentDefaults: ['lunch stop', 'late-night bites'],
  },
  'gyros-souvlaki': {
    typeLabelKey: 'streetFoodSpot',
    bestForDefaults: ['budget travelers', 'food lovers'],
    visitMomentDefaults: ['lunch stop', 'late-night bites'],
  },
  attractions: {
    typeLabelKey: 'attractionSpot',
    bestForDefaults: ['culture seekers', 'photography lovers'],
    visitMomentDefaults: ['early morning', 'daytime visit'],
  },
  'wineries-vineyards': {
    typeLabelKey: 'wineEstate',
    bestForDefaults: ['wine lovers', 'special occasions'],
    visitMomentDefaults: ['golden hour', 'sunset exploration'],
  },
  'monasteries-churches': {
    typeLabelKey: 'monasteryChurchSite',
    bestForDefaults: ['culture seekers', 'quiet reflection'],
    visitMomentDefaults: ['early morning', 'late morning walks'],
  },
  'rooftop-lounges': {
    typeLabelKey: 'rooftopLounge',
    bestForDefaults: ['special occasions', 'photography lovers'],
    visitMomentDefaults: ['golden hour', 'night out'],
  },
  vegetarian: {
    typeLabelKey: 'vegetarianSpot',
    bestForDefaults: ['food lovers', 'health-conscious travelers'],
    visitMomentDefaults: ['lunch stop', 'afternoon break'],
  },
  'fish-tavernas': {
    typeLabelKey: 'fishTaverna',
    bestForDefaults: ['food lovers', 'return visitors'],
    visitMomentDefaults: ['lunch stop', 'dinner stop'],
  },
  'luxury-dining': {
    typeLabelKey: 'fineDiningSpot',
    bestForDefaults: ['special occasions', 'food lovers'],
    visitMomentDefaults: ['dinner stop', 'night out'],
  },
};

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

const MAX_PLACE_TITLE_LENGTH = 70;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escapedLength(value: string): number {
  return escapeHtml(value).length;
}

function buildTitleWithSuffix(base: string, suffix: string, maxLength: number): string {
  const full = `${base}${suffix}`;
  if (escapedLength(full) <= maxLength) {
    return full;
  }

  if (!base) {
    return '';
  }

  const ellipsisSuffix = `...${suffix}`;
  let low = 0;
  let high = base.length;
  let best = '';

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidateBase = base.slice(0, middle).trimEnd();
    const candidate = `${candidateBase}${ellipsisSuffix}`;

    if (escapedLength(candidate) <= maxLength) {
      best = candidateBase;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return best ? `${best}${ellipsisSuffix}` : '';
}

function buildPlaceSeoTitle(name: string, kind: string): string {
  const withKindSuffix = ` | ${kind} | Googlementor`;
  const plainSuffix = ' | Googlementor';

  const kindTitle = buildTitleWithSuffix(name, withKindSuffix, MAX_PLACE_TITLE_LENGTH);
  if (kindTitle) {
    return kindTitle;
  }

  const plainTitle = buildTitleWithSuffix(name, plainSuffix, MAX_PLACE_TITLE_LENGTH);
  if (plainTitle) {
    return plainTitle;
  }

  return 'Googlementor';
}

function displayContext(entity: EntityRecord): string {
  if (entity.address) return entity.address;
  if (entity.region) return entity.region;
  if (entity.kind === 'municipality' && entity.region_en) return entity.region_en;
  return 'Greece';
}

function displayNeighborhood(entity: EntityRecord): string {
  if (entity.address) {
    const [firstSegment] = entity.address.split(',').map((part) => part.trim()).filter(Boolean);
    if (firstSegment) {
      return firstSegment;
    }
  }

  if (entity.region) {
    return entity.region;
  }

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
  const slugSet = new Set<string>();

  index.entities.forEach((entity) => {
    if (entity.slug) {
      slugSet.add(entity.slug);
    }

    entity.legacySlugs?.forEach((legacySlug) => {
      if (legacySlug) {
        slugSet.add(legacySlug);
      }
    });
  });

  const paths = Array.from(slugSet).sort((a, b) => a.localeCompare(b)).map((slug) => ({
    params: { slug },
  }));

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

  const canonicalEntity = entity;

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
    .slice(0, 24);

  return {
    props: {
      entity,
      sameCategory: getSameCategoryEntities(entity, index.entities, 12),
      nearby: nearbyWithDistance,
      sameRegion: getSameRegionEntities(entity, index.entities, 16),
      mentionedGuides: getMentionedGuidesForEntity(entity, 8).map((post) => ({
        slug: post.slug,
        title: post.title,
      })),
      canonicalSlug: canonicalEntity.slug,
      isCanonicalEntity: slug === canonicalEntity.slug,
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
  const neighborhood = displayNeighborhood(entity);
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
  const categoryNarrativeProfile = primaryCategoryId ? CATEGORY_NARRATIVE_PROFILES[primaryCategoryId] : undefined;
  const typeLabelKey = categoryNarrativeProfile?.typeLabelKey || (entity.kind === 'restaurant' ? 'restaurant' : 'localSpot');
  const placeTypeLabel = t(`place.typeLabels.${typeLabelKey}`, localizedKind.toLowerCase());

  const bestForRaw = (effectiveEnrichment.best_for || []).slice(0, 2);
  const visitMomentsRaw = (effectiveEnrichment.visit_moments || []).slice(0, 2);

  const shouldFallbackBestFor = Boolean(
    categoryNarrativeProfile && (bestForRaw.length === 0 || bestForRaw.every((tag) => GENERIC_BEST_FOR_TAGS.has(tag)))
  );
  const shouldFallbackVisitMoments = Boolean(
    categoryNarrativeProfile && (visitMomentsRaw.length === 0 || visitMomentsRaw.every((tag) => GENERIC_VISIT_MOMENT_TAGS.has(tag)))
  );

  const resolvedBestForRaw = shouldFallbackBestFor
    ? (categoryNarrativeProfile?.bestForDefaults || bestForRaw)
    : bestForRaw;
  const resolvedVisitMomentsRaw = shouldFallbackVisitMoments
    ? (categoryNarrativeProfile?.visitMomentDefaults || visitMomentsRaw)
    : visitMomentsRaw;

  const showKindBadge = !(entity.kind === 'restaurant' && categoryBadgeLabels.length > 0);
  const metaDescription = buildPlaceMetaDescription({
    placeName: entity.name,
    context,
    typeLabel: localizedKind,
    categoryLabel: primaryCategory,
  });
  const bestForLabels = resolvedBestForRaw
    .map((tag) => t(`place.dynamicTags.${tag}`, tag));
  const visitMomentLabels = resolvedVisitMomentsRaw
    .map((tag) => t(`place.dynamicTags.${tag}`, tag));
  const heroAudience = bestForLabels.join(isGreek ? ' και ' : ' and ');
  const subjectOfUrls = mentionedGuides.map((guide) => `${SITE_URL}/blog/${guide.slug}`);
  const entityJsonLd = buildEntityJsonLd(entity, canonicalUrl, subjectOfUrls);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(entity, canonicalUrl);
  const shareTitle = `${entity.name} | ${localizedKind} | Googlementor`;
  const pageTitle = buildPlaceSeoTitle(entity.name, localizedKind);
  const socialTitle = buildPlaceSeoTitle(entity.name, localizedKind);
  const featuredVibeRaw = effectiveEnrichment.vibe_tags[0] || 'curated';
  const featuredVibe = t(`place.dynamicTags.${featuredVibeRaw}`, featuredVibeRaw);
  const favoriteBadgeLabel = t('place.badges.favorite', "People's Favorite");
  const curatedBadgeLabel = t('place.badges.curated', 'Googlementor Pick');
  const tagline = heroAudience
    ? t('place.tagline.withAudience', {
      type: placeTypeLabel,
      neighborhood,
      audience: heroAudience,
      defaultValue: `A people's favorite ${placeTypeLabel} in ${neighborhood}, especially good for ${heroAudience}.`,
    })
    : t('place.tagline.base', {
      type: placeTypeLabel,
      neighborhood,
      defaultValue: `A people's favorite ${placeTypeLabel} in ${neighborhood}.`,
    });
  const shareText = `${entity.name} - ${tagline}`;
  const sameCategoryWithDistance = useMemo(
    () => sameCategory
      .map((candidate) => ({
        ...candidate,
        distanceKm: calculateDistance(entity.lat, entity.lng, candidate.lat, candidate.lng),
      }))
      .slice(0, 6),
    [entity.lat, entity.lng, sameCategory]
  );
  const sameRegionWithDistance = useMemo(
    () => sameRegion
      .map((candidate) => ({
        ...candidate,
        distanceKm: calculateDistance(entity.lat, entity.lng, candidate.lat, candidate.lng),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm),
    [entity.lat, entity.lng, sameRegion]
  );
  const usefulStopCandidates = useMemo(() => {
    const primaryIds = new Set(entity.categoryIds || []);
    const complementary = nearby.filter((candidate) => !(candidate.categoryIds || []).some((categoryId) => primaryIds.has(categoryId)));

    return complementary.length >= 3 ? complementary : nearby;
  }, [entity.categoryIds, nearby]);
  const nearbyGroupedByCategory = useMemo(() => {
    const grouped = new Map<string, { label: string; items: Array<EntityRecord & { distanceKm: number }> }>();

    usefulStopCandidates.forEach((candidate) => {
      const categoryId = candidate.categoryIds?.[0] || 'uncategorized';
      const fallbackCategoryName = candidate.categories?.[0] || categoryId;
      const label = categoryId === 'uncategorized'
        ? t('place.nearby.uncategorized', 'Other')
        : t(`place.categoryNames.${categoryId}`, fallbackCategoryName);

      if (!grouped.has(label)) {
        grouped.set(label, { label, items: [] });
      }

      grouped.get(label)?.items.push(candidate);
    });

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        items: group.items.sort((left, right) => left.distanceKm - right.distanceKm).slice(0, 2),
      }))
      .slice(0, 4);
  }, [t, usefulStopCandidates]);
  const usefulStopIds = nearbyGroupedByCategory.flatMap((group) => group.items.map((candidate) => candidate.id));
  const walkableNearby = useMemo(() => {
    const excludedIds = new Set([
      ...sameCategoryWithDistance.map((candidate) => candidate.id),
      ...usefulStopIds,
    ]);
    const filtered = nearby.filter((candidate) => !excludedIds.has(candidate.id));
    const walkable = filtered.filter((candidate) => candidate.distanceKm <= 0.8);

    return (walkable.length > 0 ? walkable : filtered).slice(0, 4);
  }, [nearby, sameCategoryWithDistance, usefulStopIds]);
  const moreNearbyOptions = useMemo(() => {
    const excluded = new Set<string>([
      ...sameCategoryWithDistance.map((candidate) => candidate.id),
      ...walkableNearby.map((candidate) => candidate.id),
      ...usefulStopIds,
    ]);

    const merged = [...nearby, ...sameRegionWithDistance];
    const deduped = new Map<string, (EntityRecord & { distanceKm: number })>();

    merged.forEach((candidate) => {
      if (!excluded.has(candidate.id) && !deduped.has(candidate.id)) {
        deduped.set(candidate.id, candidate);
      }
    });

    return Array.from(deduped.values()).slice(0, 6);
  }, [nearby, sameCategoryWithDistance, sameRegionWithDistance, usefulStopIds, walkableNearby]);
  const shareCaption = t('place.share.autoCaption', 'Discovered via Googlementor curated picks across Greece.');
  const nearbyGroupAccentSchemes = ['blue', 'teal', 'orange', 'purple'] as const;
  const promoBadgeText = favoriteBadgeLabel.toUpperCase();
  const promoPlaceName = isSanZachariFeatured ? 'Σαν Ζάχαρη' : entity.name;
  const promoCategoryAddress = isSanZachariFeatured
    ? 'Dessert Shops · Ελ. Βενιζέλου 119, Νέα Ιωνία'
    : `${entity.kind === 'restaurant' && categoryBadgeLabels.length > 0 ? categoryBadgeLabels[0] : localizedKind} · ${neighborhood}`;
  const promoHighlight = isSanZachariFeatured
    ? 'Αγαπημένο των ντόπιων. Αξίζει κοινοποίηση.'
    : tagline;
  const promoLink = isSanZachariFeatured
    ? 'googlementor.com/place/san-zachari-4ba5'
    : canonicalUrl.replace(/^https?:\/\//, '');
  const promoTags = useMemo(
    () => (isSanZachariFeatured
      ? ['Ζαχαροπλαστεία', 'Επιλεγμένο']
      : [primaryCategoryLabel, featuredVibe, neighborhood].filter(Boolean)),
    [featuredVibe, isSanZachariFeatured, neighborhood, primaryCategoryLabel]
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

  const handleSharePlace = async () => {
    if (canNativeShare && typeof navigator !== 'undefined') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: canonicalUrl,
        });
        return;
      } catch {
        // Ignore cancellation and transient errors.
      }
    }

    await handleCopyLink();
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

  const handleShareCard = async () => {
    if (canNativeShare && typeof navigator !== 'undefined') {
      try {
        await navigator.share({
          title: t('place.share.cardShareTitle', { name: entity.name, defaultValue: 'Celebrate {{name}} on Googlementor' }),
          text: shareCaption,
          url: canonicalUrl,
        });
        return;
      } catch {
        // Ignore cancellation and transient errors.
      }
    }

    handleDownloadPromo();
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
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={isCanonicalEntity ? 'index, follow' : 'noindex, follow'} />
        <link rel="canonical" href={canonicalUrl} />
        {!isCanonicalEntity ? <meta httpEquiv="refresh" content={`0;url=${canonicalUrl}`} /> : null}
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="el" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={socialTitle} />
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

      <Box
        mb={8}
        borderWidth="1px"
        borderColor="orange.100"
        borderRadius="2xl"
        p={{ base: 5, md: 8 }}
        bg="white"
        boxShadow="sm"
      >
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="orange" textTransform="none">{favoriteBadgeLabel}</Badge>
              <Badge colorScheme="gray" textTransform="none">{curatedBadgeLabel}</Badge>
              {showKindBadge ? <Badge colorScheme="blue" textTransform="none">{localizedKind}</Badge> : null}
            </HStack>

            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              {primaryCategoryLabel} · {neighborhood}
            </Text>
            <Heading as="h1" size="2xl">
              {entity.name}
            </Heading>
            <Text color="gray.700" lineHeight="1.7" noOfLines={2}>
              {tagline}
            </Text>

            {bestForLabels.length > 0 || visitMomentLabels.length > 0 ? (
              <HStack spacing={2} flexWrap="wrap">
                {bestForLabels.map((label) => (
                  <Badge key={`hero-best-${label}`} colorScheme="teal" textTransform="none">{label}</Badge>
                ))}
                {visitMomentLabels.map((label) => (
                  <Badge key={`hero-time-${label}`} colorScheme="orange" textTransform="none">{label}</Badge>
                ))}
              </HStack>
            ) : null}

            <Box borderWidth="1px" borderRadius="xl" p={3} bg="gray.50">
              <Text fontSize="sm" color="gray.700" mb={2}>{shareCaption}</Text>
              <HStack spacing={2} flexWrap="wrap">
                <Button size="sm" colorScheme="blue" onClick={handleShareCard}>
                  {t('place.share.cardButton', 'Share this card')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyCaption}>
                  {copiedCaption ? t('place.share.copiedShort', 'Copied') : t('place.share.copyCaption', 'Copy caption')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? t('place.share.copiedShort', 'Copied') : t('place.share.copyLink', 'Copy link')}
                </Button>
              </HStack>
            </Box>
          </VStack>

          <VStack align="stretch" spacing={3}>
            <Box borderWidth="1px" borderRadius="2xl" p={4} bg="white" boxShadow="sm">
              <Heading as="h2" size="sm" mb={3}>{t('place.promo.posterTitle', 'Social poster preview')}</Heading>
              {socialPosterPreview ? (
                <Image
                  src={socialPosterPreview}
                  alt={t('place.promo.previewAlt', { name: entity.name, defaultValue: 'Promo card preview for {{name}}' })}
                  w="full"
                  h={{ base: '320px', md: '360px' }}
                  objectFit="cover"
                  borderRadius="xl"
                  borderWidth="1px"
                />
              ) : (
                <Box h="260px" borderWidth="1px" borderRadius="xl" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="sm" color="gray.500">{t('place.promo.generating', 'Generating preview...')}</Text>
                </Box>
              )}
            </Box>

            <Button colorScheme="blue" minH="44px" w={{ base: '100%', md: 'auto' }} onClick={handleSharePlace}>
              {t('place.share.heroButton', 'Share this place')}
            </Button>
          </VStack>
        </SimpleGrid>
      </Box>

      <Box mb={8} borderWidth="1px" borderRadius="xl" p={{ base: 4, md: 5 }} bg="gray.50">
        <HStack spacing={3} flexWrap="wrap" align="stretch" w="full">
          <Button
            as={Link}
            href={entity.url || `https://www.google.com/maps/search/?api=1&query=${entity.lat},${entity.lng}`}
            isExternal
            colorScheme="blue"
            minH="44px"
            w={{ base: '100%', sm: 'auto' }}
          >
            {t('place.openDirections', 'Navigate')}
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

      {nearby.length > 0 ? (
        <Box mb={8} borderWidth="1px" borderColor="blue.100" borderRadius="2xl" p={{ base: 5, md: 6 }} bg="blue.50">
          <Heading as="h2" size="md" mb={2}>
            {t('place.nearby.title', 'Closest useful stops')}
          </Heading>
          <Text color="gray.700" mb={4}>{t('place.nearby.subtitle', 'A quick travel-assistant view of the closest useful stops to walk to next.')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {nearbyGroupedByCategory.map((group, groupIndex) => {
              const accentScheme = nearbyGroupAccentSchemes[groupIndex % nearbyGroupAccentSchemes.length];

              return (
              <Box key={group.label} borderWidth="1px" borderRadius="lg" p={4} bg="white">
                <Box
                  mb={3}
                  px={3}
                  py={2}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={`${accentScheme}.200`}
                  bg={`${accentScheme}.50`}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={`${accentScheme}.800`}
                  >
                    {group.label}
                  </Text>
                </Box>
                <VStack align="stretch" spacing={2}>
                  {group.items.map((candidate) => (
                    <Box key={`${group.label}-${candidate.id}`}>
                      <HStack justify="space-between" align="baseline" spacing={3}>
                        <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.700" fontWeight="semibold">
                          {candidate.name}
                        </Link>
                        <Text as="span" fontSize="sm" color="gray.600">{formatDistance(candidate.distanceKm)}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {candidate.address || candidate.region || t('common.greece', 'Greece')}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      ) : null}

      {sameCategoryWithDistance.length > 0 ? (
        <Box mb={8} borderWidth="1px" borderColor="teal.100" borderRadius="2xl" p={{ base: 5, md: 6 }} bg="teal.50">
          <Heading as="h2" size="md" mb={3}>
            {t('place.sameCategory.title', 'Try next in the same category')}
          </Heading>
          <Text color="gray.600" mb={4}>{t('place.sameCategory.subtitle', 'If you liked this pick, these are strong alternatives nearby.')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {sameCategoryWithDistance.map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4} bg="white">
                <HStack justify="space-between" align="baseline" spacing={3} mb={1}>
                  <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                    {candidate.name}
                  </Link>
                  <Text as="span" fontSize="sm" color="gray.600">{formatDistance(candidate.distanceKm)}</Text>
                </HStack>
                <Text color="gray.600" fontSize="sm">{candidate.address || candidate.region || t('common.greece', 'Greece')}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {walkableNearby.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            {t('place.walkable.title', 'Best Walkable Picks Nearby')}
          </Heading>
          <Text color="gray.600" mb={4}>{t('place.walkable.subtitle', 'Great options within a short walk.')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {walkableNearby.map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4} bg="white">
                <HStack justify="space-between" align="flex-start" spacing={3} mb={2}>
                  <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                    {candidate.name}
                  </Link>
                  <Badge colorScheme="blue" textTransform="none">{formatDistance(candidate.distanceKm)}</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm" mt={1}>{candidate.address || candidate.region || t('common.greece', 'Greece')}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {moreNearbyOptions.length > 0 ? (
        <Box mb={8}>
          <Heading as="h2" size="md" mb={3}>
            {t('place.moreNearby.title', 'More Nearby Options')}
          </Heading>
          <Text color="gray.600" mb={4}>{t('place.moreNearby.subtitle', 'A lighter set of extra nearby options if you want to keep exploring.')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {moreNearbyOptions.map((candidate) => (
              <Box key={candidate.id} borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <HStack justify="space-between" align="flex-start" spacing={3} mb={2}>
                  <Link as={NextLink} href={`/place/${candidate.slug}`} color="blue.600" fontWeight="semibold">
                    {candidate.name}
                  </Link>
                  <Badge colorScheme="gray" textTransform="none">{formatDistance(candidate.distanceKm)}</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm" mt={1}>{candidate.address || candidate.region || t('common.greece', 'Greece')}</Text>
              </Box>
            ))}
          </SimpleGrid>
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
