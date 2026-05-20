// ---------------------------------------------------------------------------
// validate-data.ts
//
// Validates all registered src/data JSON files through their canonical mapper
// then Zod schema. Must be run before build. Exits with non-zero code on any
// schema violation; also warns when the mapper silently drops records.
//
// Usage: tsx scripts/validate-data.ts
// ---------------------------------------------------------------------------

import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { toRestaurantList, toMunicipalityList } from '../src/utils/mappers';
import {
  RestaurantLocationSchema,
  MunicipalityLocationSchema,
} from '../src/schemas/location';

const DATA_DIR = join(process.cwd(), 'src', 'data');

// ---------------------------------------------------------------------------
// Dataset registry
//
// Maps each filename to the mapper that the app uses at runtime + the schema
// that validates the mapper's canonical output. Files without a canonical type
// (islands.json, products.json, etc.) are intentionally excluded.
// ---------------------------------------------------------------------------

type MappedRecord = { id?: string; name: string };
type DatasetMapper = (raw: unknown[]) => MappedRecord[];

interface DatasetConfig {
  mapper: DatasetMapper;
  schema: z.ZodTypeAny;
}

// All of these are consumed via toRestaurantList at runtime (MainHero.tsx).
// mustSeeAttractions / familyFriendly / wineries / monasteries share the same
// url+name+address+coords shape and go through the restaurant pathway.
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
    schema: RestaurantLocationSchema,
  };
}

REGISTRY['municipalities.json'] = {
  mapper: toMunicipalityList as unknown as DatasetMapper,
  schema: MunicipalityLocationSchema,
};

// ---------------------------------------------------------------------------
// Validation loop
// ---------------------------------------------------------------------------

let totalRaw = 0;
let totalMapped = 0;
let errorCount = 0;

console.log('\n🔍  Validating location data...\n');

for (const [filename, { mapper, schema }] of Object.entries(REGISTRY)) {
  const filePath = join(DATA_DIR, filename);

  let rawData: unknown;
  try {
    rawData = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    console.error(`[${filename}] ❌  Failed to read or parse file`);
    errorCount++;
    continue;
  }

  if (!Array.isArray(rawData)) {
    console.error(`[${filename}] ❌  Root value is not an array`);
    errorCount++;
    continue;
  }

  const rawCount = rawData.length;
  const mapped = mapper(rawData);
  const skipped = rawCount - mapped.length;

  totalRaw += rawCount;
  totalMapped += mapped.length;

  if (skipped > 0) {
    console.warn(
      `[${filename}] ⚠️   ${skipped}/${rawCount} records skipped by mapper ` +
        `(missing required fields or coordinates outside Greece bounds)`
    );
  }

  for (let i = 0; i < mapped.length; i++) {
    const record = mapped[i] as MappedRecord;
    const result = schema.safeParse(record);

    if (!result.success) {
      errorCount++;
      const id = record.id ?? `index-${i}`;
      const name = record.name ?? '(unknown)';

      console.error(`\n[${filename}] Record #${i} (id: ${id}, name: "${name}"):`);

      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
        console.error(`  ✗ ${path}: ${issue.message}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Final report
// ---------------------------------------------------------------------------

const validCount = totalMapped;
const skippedTotal = totalRaw - totalMapped;

console.log(
  `\nRecords: ${totalRaw} raw → ${validCount} mapped` +
    (skippedTotal > 0 ? ` (${skippedTotal} skipped by mapper)` : '')
);

if (errorCount > 0) {
  console.error(
    `\n❌  Validation failed: ${errorCount} error(s) in src/data/. ` +
      `Fix before building.\n`
  );
  process.exit(1);
} else {
  console.log(`✅  All ${validCount} records satisfy their canonical schema.\n`);
}
