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
const OUTPUT_DIR = join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'entities.json');
const CANONICAL_SITE_URL = 'https://googlementor.com';
const ENTITIES_CANONICAL_URL = `${CANONICAL_SITE_URL}/data/entities.json`;
const ENTITY_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Dataset registry - same as validate-data.ts
// Maps dataset to the mapper that processes it at runtime
// ---------------------------------------------------------------------------

type DatasetMapper = (raw: unknown[]) => DiscoverableLocation[];

interface DatasetConfig {
  mapper: DatasetMapper;
}

const RESTAURANT_FILES: readonly string[] = [
  'asianRestaurants.json',
  'burgersRestaurants.json',
  'cheapEatsRestaurants.json',
  'coffeeBrunchRestaurants.json',
  'dessertsRestaurants.json',
  'familyFriendly.json',
  'fishTavernasRestaurants.json',
  'greekRestaurants.json',
  'gyrosSouvlakiRestaurants.json',
  'italianRestaurants.json',
  'luxuryDiningRestaurants.json',
  'mexicanRestaurants.json',
  'monasteriesChurches.json',
  'mustSeeAttractions.json',
  'rooftopLoungesRestaurants.json',
  'vegetarianRestaurants.json',
  'wineriesVineyards.json',
];

const REGISTRY: Record<string, DatasetConfig> = {};

for (const filename of RESTAURANT_FILES) {
  REGISTRY[filename] = {
    mapper: toRestaurantList as unknown as DatasetMapper,
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
  kind: string;
  name: string;
  lat: number;
  lng: number;
  aliases?: string[];
  url?: string;
  // Restaurant-specific
  address?: string;
  categoryIds?: string[];
  // Municipality-specific
  region?: string;
  name_en?: string;
  region_en?: string;
}

/**
 * Project a canonical location to the controlled entity schema.
 * Includes only fields relevant for AI discovery, omits internal fields.
 */
function projectEntity(location: DiscoverableLocation): EntityRecord {
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
    base.categoryIds = location.categoryIds;
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
    for (const [filename, { mapper }] of Object.entries(REGISTRY)) {
      const filePath = join(DATA_DIR, filename);

      try {
        const rawData = JSON.parse(readFileSync(filePath, 'utf8'));

        if (!Array.isArray(rawData)) {
          throw new Error(`Root is not an array`);
        }

        // Run through mapper (already validated during data:validate phase)
        const mapped = mapper(rawData);

        // Project to controlled entity fields
        const projected = mapped.map(projectEntity);
        entities.push(...projected);

        console.log(`  ✓ ${filename}: ${mapped.length} records`);
      } catch (err) {
        console.error(
          `  ✗ ${filename}: Failed - ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      }
    }

    // 2. Sort deterministically by id for stable output
    entities.sort((a, b) => {
      const aId = a.id || '';
      const bId = b.id || '';
      return aId.localeCompare(bId);
    });

    // 3. Aggregate metadata by kind
    const byKind: Record<string, number> = {};
    for (const entity of entities) {
      byKind[entity.kind] = (byKind[entity.kind] || 0) + 1;
    }

    // 4. Build output with metadata header
    const output = {
      meta: {
        generated_at: new Date().toISOString(),
        generator_version: '1.0',
        schema_version: ENTITY_SCHEMA_VERSION,
        canonical_url: ENTITIES_CANONICAL_URL,
        language_coverage: ['el', 'en'],
        record_count: entities.length,
        by_kind: byKind,
      },
      entities,
    };

    // 5. Write to output file
    writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`\n✅  Generated ${entities.length} entities\n`);
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
