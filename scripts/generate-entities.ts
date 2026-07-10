// ---------------------------------------------------------------------------
// generate-entities.ts
//
// Generates public/data/entities.json - a canonical AI-discoverable index
// of all normalized locations derived from validated mapper output.
//
// Strictly downstream of validation: mappers handle all normalization + filtering.
// Generator only aggregates, projects to controlled fields, and writes output.
//
// Usage: tsx scripts/generate-entities.ts
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { DiscoverableLocation } from '../src/types/location';
import { toRestaurantList, toMunicipalityList } from '../src/utils/mappers';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const PUBLIC_DATA_DIR = join(process.cwd(), 'public', 'data');
const OUTPUT_DIR = join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'entities.json');
const CANONICAL_SITE_URL = 'https://googlementor.com';
const ENTITIES_CANONICAL_URL = `${CANONICAL_SITE_URL}/data/entities.json`;
const ENTITY_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Category label lookup: categoryId → human-readable name
// e.g. "greek-restaurants" → "Greek Restaurants"
// ---------------------------------------------------------------------------

interface CategoryMeta {
  id: string;
  name: string;
}

function buildCategoryLookup(): Map<string, string> {
  const filePath = join(PUBLIC_DATA_DIR, 'restaurantCategories.json');
  const raw: CategoryMeta[] = JSON.parse(readFileSync(filePath, 'utf8'));
  const map = new Map<string, string>();
  for (const cat of raw) {
    map.set(cat.id, cat.name);
  }
  return map;
}

const CATEGORY_LABEL = buildCategoryLookup();

// ---------------------------------------------------------------------------
// Dataset registry - same as validate-data.ts
// Maps dataset to the mapper that processes it at runtime
// ---------------------------------------------------------------------------

type DatasetMapper = (raw: unknown[]) => DiscoverableLocation[];

interface DatasetConfig {
  mapper: DatasetMapper;
  categoryId?: string; // Category to assign to all entities from this file
}

// Mapping from source filename to canonical category id (from restaurantCategories.json)
const RESTAURANT_CATEGORY_MAP: Record<string, string> = {
  'asianRestaurants.json':          'asian',
  'burgersRestaurants.json':        'burgers',
  'cheapEatsRestaurants.json':      'cheap-eats',
  'coffeeBrunchRestaurants.json':   'coffee-brunch',
  'dessertsRestaurants.json':       'desserts',
  'familyFriendly.json':            'family-friendly',
  'fishTavernasRestaurants.json':   'fish-tavernas',
  'greekRestaurants.json':          'greek-restaurants',
  'gyrosSouvlakiRestaurants.json':  'cheap-eats',
  'italianRestaurants.json':        'italian',
  'luxuryDiningRestaurants.json':   'luxury-dining',
  'mexicanRestaurants.json':        'mexican',
  'monasteriesChurches.json':       'monasteries-churches',
  'mustSeeAttractions.json':        'attractions',
  'rooftopLoungesRestaurants.json': 'rooftop-lounges',
  'vegetarianRestaurants.json':     'vegetarian',
  'wineriesVineyards.json':         'wineries-vineyards',
};

const REGISTRY: Record<string, DatasetConfig> = {};

for (const [filename, categoryId] of Object.entries(RESTAURANT_CATEGORY_MAP)) {
  REGISTRY[filename] = {
    mapper: toRestaurantList as unknown as DatasetMapper,
    categoryId,
  };
}

REGISTRY['municipalities.json'] = {
  mapper: toMunicipalityList as unknown as DatasetMapper,
};

// ---------------------------------------------------------------------------
// Controlled entity fields - not minimal, not full, but discoverable
// ---------------------------------------------------------------------------

interface EntityRecord {
  id?: string;
  slug?: string;
  legacySlugs?: string[];
  kind: string;
  name: string;
  lat: number;
  lng: number;
  aliases?: string[];
  url?: string;
  // Restaurant-specific
  address?: string;
  categoryIds?: string[];
  categories?: string[];   // Human-readable category labels, resolved from categoryIds
  // Municipality-specific
  region?: string;
  name_en?: string;
  region_en?: string;
}

function normalizeIdentityPart(value?: string): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildEntityIdentityKey(entity: EntityRecord): string {
  const normalizedName = normalizeIdentityPart(entity.name);
  const normalizedLocation = normalizeIdentityPart(entity.address || entity.region) || `${entity.lat.toFixed(5)},${entity.lng.toFixed(5)}`;
  return `${entity.kind}::${normalizedName}::${normalizedLocation}`;
}

function entityCompletenessScore(entity: EntityRecord): number {
  let score = 0;
  if (entity.id) score += 4;
  if (entity.slug) score += 3;
  if (entity.url) score += 2;
  if (entity.address) score += 2;
  if (entity.region) score += 1;
  if (entity.aliases?.length) score += 1;
  if (entity.categoryIds?.length) score += 1;
  if (entity.categories?.length) score += 1;
  return score;
}

function mergeEntityRecords(preferred: EntityRecord, incoming: EntityRecord): EntityRecord {
  const preferredCategories = preferred.categoryIds ?? [];
  const incomingCategories = incoming.categoryIds ?? [];
  const mergedCategoryIds = Array.from(new Set([...preferredCategories, ...incomingCategories]));

  const preferredLabels = preferred.categories ?? [];
  const incomingLabels = incoming.categories ?? [];
  const mergedLabels = Array.from(new Set([...preferredLabels, ...incomingLabels]));

  const preferredAliases = preferred.aliases ?? [];
  const incomingAliases = incoming.aliases ?? [];
  const mergedAliases = Array.from(new Set([...preferredAliases, ...incomingAliases]));

  const legacySlugSet = new Set<string>();
  if (preferred.legacySlugs?.length) {
    preferred.legacySlugs.forEach((slug) => {
      if (slug) legacySlugSet.add(slug);
    });
  }
  if (incoming.legacySlugs?.length) {
    incoming.legacySlugs.forEach((slug) => {
      if (slug) legacySlugSet.add(slug);
    });
  }

  if (preferred.slug && incoming.slug && preferred.slug !== incoming.slug) {
    legacySlugSet.add(incoming.slug);
  }

  if (preferred.slug) {
    legacySlugSet.delete(preferred.slug);
  }

  return {
    ...preferred,
    categoryIds: mergedCategoryIds.length ? mergedCategoryIds : undefined,
    categories: mergedLabels.length ? mergedLabels : undefined,
    aliases: mergedAliases.length ? mergedAliases : undefined,
    legacySlugs: legacySlugSet.size > 0 ? Array.from(legacySlugSet).sort((a, b) => a.localeCompare(b)) : undefined,
  };
}

function dedupeEntities(entities: EntityRecord[]): EntityRecord[] {
  const byIdentity = new Map<string, EntityRecord>();

  for (const entity of entities) {
    const key = buildEntityIdentityKey(entity);
    const existing = byIdentity.get(key);

    if (!existing) {
      byIdentity.set(key, entity);
      continue;
    }

    const existingScore = entityCompletenessScore(existing);
    const currentScore = entityCompletenessScore(entity);

    const preferred = currentScore > existingScore ? entity : existing;
    const incoming = preferred === entity ? existing : entity;

    byIdentity.set(key, mergeEntityRecords(preferred, incoming));
  }

  return Array.from(byIdentity.values());
}

/**
 * Project a canonical location to the controlled entity schema.
 * Includes only fields relevant for AI discovery, omits internal fields.
 */
function projectEntity(location: DiscoverableLocation, injectCategoryId?: string): EntityRecord {
  const base: EntityRecord = {
    id: location.id,
    slug: location.slug,
    kind: location.kind,
    name: location.name,
    lat: location.lat,
    lng: location.lng,
    aliases: location.aliases,
    url: location.url,
  };

  // Add kind-specific fields
  if (location.kind === 'restaurant') {
    base.address = location.address;
    // Merge injected category with any existing categoryIds on the source record
    const sourceIds = location.categoryIds ?? [];
    const allIds = injectCategoryId
      ? Array.from(new Set([injectCategoryId, ...sourceIds]))
      : sourceIds;
    if (allIds.length) {
      base.categoryIds = allIds;
      const labels = allIds
        .map((id) => CATEGORY_LABEL.get(id))
        .filter((label): label is string => label !== undefined);
      if (labels.length) base.categories = labels;
    }
  }

  if (location.kind === 'municipality') {
    base.region = location.region;
    base.name_en = location.name_en;
    base.region_en = location.region_en;
  }

  return base;
}

// ---------------------------------------------------------------------------
// Main generation logic
// ---------------------------------------------------------------------------

async function generateEntities() {
  try {
    console.log('\n📦  Generating entity index...\n');

    const entities: EntityRecord[] = [];

    // 1. Load all datasets through mappers
    for (const [filename, { mapper, categoryId }] of Object.entries(REGISTRY)) {
      const filePath = join(DATA_DIR, filename);

      try {
        const rawData = JSON.parse(readFileSync(filePath, 'utf8'));

        if (!Array.isArray(rawData)) {
          throw new Error(`Root is not an array`);
        }

        // Run through mapper (already validated during data:validate phase)
        const mapped = mapper(rawData);

        // Project to controlled entity fields, injecting the file's category
        const projected = mapped.map((loc) => projectEntity(loc, categoryId));
        entities.push(...projected);

        console.log(`  ✓ ${filename}: ${mapped.length} records`);
      } catch (err) {
        console.error(
          `  ✗ ${filename}: Failed - ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      }
    }

    // 2. Deduplicate deterministically across all source datasets.
    const dedupedEntities = dedupeEntities(entities);

    // 3. Sort deterministically by id for stable output
    dedupedEntities.sort((a, b) => {
      const aId = a.id || '';
      const bId = b.id || '';
      return aId.localeCompare(bId);
    });

    // 4. Aggregate metadata by kind
    const byKind: Record<string, number> = {};
    for (const entity of dedupedEntities) {
      byKind[entity.kind] = (byKind[entity.kind] || 0) + 1;
    }

    // 5. Build output with metadata header
    const output = {
      meta: {
        generated_at: new Date().toISOString(),
        generator_version: '1.0',
        schema_version: ENTITY_SCHEMA_VERSION,
        canonical_url: ENTITIES_CANONICAL_URL,
        language_coverage: ['el', 'en'],
        record_count: dedupedEntities.length,
        by_kind: byKind,
      },
      entities: dedupedEntities,
    };

    // 6. Write to output file
    writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`\n✅  Generated ${dedupedEntities.length} entities\n`);
    console.log(`  Output: ${OUTPUT_FILE}`);
    console.log(`  Breakdown by kind:`);
    for (const [kind, count] of Object.entries(byKind)) {
      console.log(`    - ${kind}: ${count}`);
    }
    console.log();
  } catch (err) {
    console.error(
      `\n❌  Entity generation failed: ${err instanceof Error ? err.message : String(err)}\n`
    );
    process.exit(1);
  }
}

generateEntities();
