import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { loadEntitiesIndex } from '../src/lib/entities';
import { createIntentEngine } from '../src/lib/intent';

type FilterReason = 'below_threshold' | 'invalid_area' | 'invalid_category' | 'duplicate_intent';

interface DensityEntry {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface StrongCombinationEntry {
  key: string;
  categoryId: string;
  categorySlug: string;
  areaId: string;
  areaSlug: string;
  count: number;
}

interface IntentCoverageReport {
  generatedAt: string;
  thresholds: {
    minAreaEntityCount: number;
    minCategoryAreaCount: number;
  };
  totals: {
    areas: number;
    categories: number;
    candidateCombinations: number;
    generatedAreaPages: number;
    generatedCategoryAreaPages: number;
  };
  filteredCombinations: Record<FilterReason, number>;
  generatedCategoryAreaRoutes: Array<{ categorySlug: string; areaSlug: string }>;
  highestDensityAreas: DensityEntry[];
  highestDensityCategories: DensityEntry[];
  strongestCategoryAreaCombinations: StrongCombinationEntry[];
}

const MIN_AREA_ENTITY_COUNT = 8;
const MIN_CATEGORY_AREA_COUNT = 5;
const TOP_LIMIT = 20;

function main(): void {
  const index = loadEntitiesIndex();
  const engine = createIntentEngine({
    entities: index.entities,
    thresholds: {
      minAreaEntityCount: MIN_AREA_ENTITY_COUNT,
      minCategoryAreaCount: MIN_CATEGORY_AREA_COUNT,
    },
  });

  const totals = {
    areas: engine.areas.records.length,
    categories: engine.categories.records.length,
    candidateCombinations: engine.areas.records.length * engine.categories.records.length,
    generatedAreaPages: 0,
    generatedCategoryAreaPages: 0,
  };

  const filteredCombinations: Record<FilterReason, number> = {
    below_threshold: 0,
    invalid_area: 0,
    invalid_category: 0,
    duplicate_intent: 0,
  };

  const highestDensityAreas: DensityEntry[] = [];
  for (const area of engine.areas.records) {
    const payload = engine.query.getIntentResults({ areaId: area.id });
    if (!payload) {
      continue;
    }

    if (payload.passesThreshold) {
      totals.generatedAreaPages += 1;
    }

    highestDensityAreas.push({
      id: area.id,
      slug: area.urlSlug,
      name: area.name,
      count: payload.counts.totalInArea,
    });
  }

  const categoryCountMap = new Map<string, number>();
  for (const entity of index.entities) {
    for (const categoryId of entity.categoryIds ?? []) {
      categoryCountMap.set(categoryId, (categoryCountMap.get(categoryId) ?? 0) + 1);
    }
  }

  const highestDensityCategories: DensityEntry[] = engine.categories.records.map((category) => ({
    id: category.id,
    slug: category.urlSlug,
    name: category.name,
    count: categoryCountMap.get(category.id) ?? 0,
  }));

  const strongestCombinations: StrongCombinationEntry[] = [];
  const generatedCategoryAreaRoutes: Array<{ categorySlug: string; areaSlug: string }> = [];
  const canonicalIntentKeys = new Set<string>();

  for (const area of engine.areas.records) {
    for (const category of engine.categories.records) {
      const resolution = engine.resolver.resolveIntent(category.urlSlug, area.urlSlug);
      if (!resolution.categoryId) {
        filteredCombinations.invalid_category += 1;
        continue;
      }

      if (!resolution.areaId) {
        filteredCombinations.invalid_area += 1;
        continue;
      }

      const canonicalCategory = engine.categories.byId.get(resolution.categoryId);
      const canonicalArea = engine.areas.byId.get(resolution.areaId);
      if (!canonicalCategory) {
        filteredCombinations.invalid_category += 1;
        continue;
      }

      if (!canonicalArea) {
        filteredCombinations.invalid_area += 1;
        continue;
      }

      const canonicalKey = `${canonicalCategory.urlSlug}/${canonicalArea.urlSlug}`;
      if (canonicalIntentKeys.has(canonicalKey)) {
        filteredCombinations.duplicate_intent += 1;
        continue;
      }
      canonicalIntentKeys.add(canonicalKey);

      const payload = engine.query.getIntentResults({
        areaId: canonicalArea.id,
        categoryId: canonicalCategory.id,
      });

      if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
        filteredCombinations.below_threshold += 1;
        continue;
      }

      totals.generatedCategoryAreaPages += 1;
      generatedCategoryAreaRoutes.push({
        categorySlug: canonicalCategory.urlSlug,
        areaSlug: canonicalArea.urlSlug,
      });
      strongestCombinations.push({
        key: canonicalKey,
        categoryId: canonicalCategory.id,
        categorySlug: canonicalCategory.urlSlug,
        areaId: canonicalArea.id,
        areaSlug: canonicalArea.urlSlug,
        count: payload.counts.totalCategoryArea,
      });
    }
  }

  highestDensityAreas.sort((left, right) => right.count - left.count);
  highestDensityCategories.sort((left, right) => right.count - left.count);
  strongestCombinations.sort((left, right) => right.count - left.count);

  const report: IntentCoverageReport = {
    generatedAt: new Date().toISOString(),
    thresholds: {
      minAreaEntityCount: MIN_AREA_ENTITY_COUNT,
      minCategoryAreaCount: MIN_CATEGORY_AREA_COUNT,
    },
    totals,
    filteredCombinations,
    generatedCategoryAreaRoutes,
    highestDensityAreas: highestDensityAreas.slice(0, TOP_LIMIT),
    highestDensityCategories: highestDensityCategories.slice(0, TOP_LIMIT),
    strongestCategoryAreaCombinations: strongestCombinations.slice(0, TOP_LIMIT),
  };

  const targetDir = join(process.cwd(), 'public', 'data');
  mkdirSync(targetDir, { recursive: true });
  const targetFile = join(targetDir, 'intent-coverage.json');
  writeFileSync(targetFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n📊 Intent coverage summary');
  console.log(`- Areas: ${report.totals.areas}`);
  console.log(`- Categories: ${report.totals.categories}`);
  console.log(`- Candidate combinations: ${report.totals.candidateCombinations}`);
  console.log(`- Generated area pages: ${report.totals.generatedAreaPages}`);
  console.log(`- Generated category×area pages: ${report.totals.generatedCategoryAreaPages}`);
  console.log(`- Filtered below threshold: ${report.filteredCombinations.below_threshold}`);
  console.log(`- Filtered invalid area: ${report.filteredCombinations.invalid_area}`);
  console.log(`- Filtered invalid category: ${report.filteredCombinations.invalid_category}`);
  console.log(`- Filtered duplicate intent: ${report.filteredCombinations.duplicate_intent}`);
  console.log(`- Artifact: ${targetFile}\n`);
}

main();
