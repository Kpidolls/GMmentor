const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const SITE_URL = 'https://googlementor.com';
const INPUT_FILE = join(process.cwd(), 'public', 'data', 'entities.json');
const OUTPUT_FILE = join(process.cwd(), 'public', 'data', 'place-enrichment.json');
const OVERRIDES_FILE = join(process.cwd(), 'public', 'data', 'place-enrichment.overrides.json');
const SCHEMA_VERSION = 1;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return earthRadiusKm * c;
}

function kindLabel(kind) {
  if (kind === 'restaurant') return 'restaurant';
  if (kind === 'municipality') return 'neighborhood area';
  if (kind === 'attraction') return 'attraction';
  return 'local place';
}

function normalizeRegion(entity) {
  if (entity.region && entity.region.trim()) return entity.region.trim();
  if (entity.address && entity.address.includes(',')) {
    const parts = entity.address.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
  }
  return 'Greece';
}

function deriveVibeTags(entity) {
  const categoryIds = Array.isArray(entity.categoryIds) ? entity.categoryIds : [];
  const tags = new Set();

  if (entity.kind === 'restaurant') {
    tags.add('curated');
    if (categoryIds.includes('cheap-eats')) tags.add('budget-friendly');
    if (categoryIds.includes('luxury-dining')) tags.add('premium-dining');
    if (categoryIds.includes('desserts')) tags.add('sweet-stop');
    if (categoryIds.includes('coffee-brunch')) tags.add('daytime-favorite');
    if (categoryIds.includes('rooftop-lounges')) tags.add('city-views');
    if (categoryIds.includes('fish-tavernas')) tags.add('seafood-local');
    if (categoryIds.includes('family-friendly')) tags.add('family-ready');
    if (categoryIds.includes('wineries-vineyards')) tags.add('wine-moment');
  }

  if (entity.kind === 'municipality') {
    tags.add('local-neighborhood');
    tags.add('base-for-exploring');
  }

  if (entity.kind === 'attraction' || entity.kind === 'poi') {
    tags.add('sightseeing-core');
    tags.add('photo-worthy');
  }

  if (tags.size === 0) {
    tags.add('curated');
    tags.add('discoverable');
  }

  return Array.from(tags).slice(0, 4);
}

function deriveBestFor(entity) {
  const categoryIds = Array.isArray(entity.categoryIds) ? entity.categoryIds : [];
  const bestFor = new Set(['first-time visitors']);

  if (entity.kind === 'restaurant') {
    bestFor.add('food lovers');
    if (categoryIds.includes('family-friendly')) bestFor.add('families');
    if (categoryIds.includes('cheap-eats')) bestFor.add('budget travelers');
    if (categoryIds.includes('luxury-dining')) bestFor.add('special occasions');
  }

  if (entity.kind === 'municipality') {
    bestFor.add('walk-and-explore days');
    bestFor.add('return visitors');
  }

  if (entity.kind === 'attraction' || entity.kind === 'poi') {
    bestFor.add('culture seekers');
    bestFor.add('photography lovers');
  }

  return Array.from(bestFor).slice(0, 4);
}

function deriveVisitMoments(entity) {
  const categoryIds = Array.isArray(entity.categoryIds) ? entity.categoryIds : [];

  if (entity.kind === 'municipality') {
    return ['late morning walks', 'sunset exploration'];
  }

  if (entity.kind === 'restaurant') {
    if (categoryIds.includes('coffee-brunch')) return ['early morning', 'late brunch'];
    if (categoryIds.includes('desserts')) return ['afternoon break', 'after dinner'];
    if (categoryIds.includes('rooftop-lounges')) return ['golden hour', 'night out'];
    return ['lunch stop', 'dinner stop'];
  }

  return ['daytime visit', 'sunset stop'];
}

function derivePracticalNote(entity, nearbyWalkableCount) {
  const hasAddress = Boolean(entity.address);
  const hasExternalMap = Boolean(entity.url);

  if (entity.kind === 'municipality') {
    return `${nearbyWalkableCount} curated places are within walkable distance from this area center.`;
  }

  if (!hasAddress && !hasExternalMap) {
    return 'Use the coordinates for precise navigation from your current location.';
  }

  if (hasAddress && hasExternalMap) {
    return 'Address and direct map link are available for easy turn-by-turn access.';
  }

  if (hasAddress) {
    return 'Address is available. Open the map button to verify live routing options.';
  }

  return 'Direct map link is available for quick navigation.';
}

function confidenceScore(entity, nearbyWalkableCount) {
  let score = 0.52;
  if (entity.address) score += 0.14;
  if (entity.url) score += 0.12;
  if (Array.isArray(entity.categoryIds) && entity.categoryIds.length > 0) score += 0.12;
  if (nearbyWalkableCount >= 4) score += 0.08;
  return Number(clamp(score, 0.55, 0.98).toFixed(2));
}

function buildSummary(entity, region, nearbyWalkableCount) {
  const type = kindLabel(entity.kind);
  const category = Array.isArray(entity.categories) && entity.categories.length > 0
    ? entity.categories[0]
    : null;

  const categoryText = category ? ` in the ${category} collection` : '';

  const en = `${entity.name} is a curated ${type} in ${region}${categoryText}. It is connected to ${nearbyWalkableCount} nearby Googlementor picks to help travelers build a stronger local route.`;
  const el = `${entity.name} είναι ένα επιλεγμένο ${type === 'restaurant' ? 'σημείο φαγητού' : 'σημείο ενδιαφέροντος'} στην περιοχή ${region}${category ? ` και ανήκει στη συλλογή ${category}` : ''}. Συνδέεται με ${nearbyWalkableCount} κοντινές προτάσεις του Googlementor για πιο ολοκληρωμένη εμπειρία.`;

  return { en, el };
}

function readOverrides() {
  if (!existsSync(OVERRIDES_FILE)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(OVERRIDES_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function pickNearbyStats(entity, entities) {
  let walkableCount = 0;
  let nearbyCount = 0;

  for (const candidate of entities) {
    if (candidate.id === entity.id) continue;

    if (Math.abs(candidate.lat - entity.lat) > 0.2 || Math.abs(candidate.lng - entity.lng) > 0.2) {
      continue;
    }

    const km = distanceKm(entity, candidate);
    if (km <= 0.8) walkableCount += 1;
    if (km <= 2.0) nearbyCount += 1;
  }

  return { walkableCount, nearbyCount };
}

function generate() {
  if (!existsSync(INPUT_FILE)) {
    throw new Error(`Missing entities file: ${INPUT_FILE}`);
  }

  const raw = JSON.parse(readFileSync(INPUT_FILE, 'utf8'));
  const entities = Array.isArray(raw && raw.entities) ? raw.entities : [];
  const overrides = readOverrides();

  const enrichments = entities.map((entity) => {
    const region = normalizeRegion(entity);
    const { walkableCount, nearbyCount } = pickNearbyStats(entity, entities);
    const summary = buildSummary(entity, region, walkableCount);

    const autoRecord = {
      entity_id: entity.id,
      generated: {
        summary_en: summary.en,
        summary_el: summary.el,
        vibe_tags: deriveVibeTags(entity),
        best_for: deriveBestFor(entity),
        visit_moments: deriveVisitMoments(entity),
        practical_note: derivePracticalNote(entity, walkableCount),
        nearby_walkable_count: walkableCount,
        nearby_count_2km: nearbyCount,
        confidence: confidenceScore(entity, walkableCount),
      },
    };

    const override = overrides[entity.id] && typeof overrides[entity.id] === 'object'
      ? overrides[entity.id]
      : null;

    return {
      ...autoRecord,
      ...(override ? { manual_override: override } : {}),
      effective: {
        ...autoRecord.generated,
        ...(override || {}),
      },
    };
  });

  const output = {
    meta: {
      generated_at: new Date().toISOString(),
      generator_version: '1.0',
      schema_version: SCHEMA_VERSION,
      canonical_url: `${SITE_URL}/data/place-enrichment.json`,
      total_entities: enrichments.length,
      override_entities: enrichments.filter((entry) => Boolean(entry.manual_override)).length,
    },
    enrichments,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Generated place enrichment for ${enrichments.length} entities -> ${OUTPUT_FILE}`);
}

try {
  generate();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
