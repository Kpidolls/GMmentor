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
  generatedAreaRoutes: string[];
  generatedCategoryAreaRoutes: Array<{ categorySlug: string; areaSlug: string }>;
  densityAnalysis: {
    areaEntityCounts: {
      min: number;
      max: number;
      avg: number;
      p50: number;
      p75: number;
      p90: number;
    };
    categoryEntityCounts: {
      min: number;
      max: number;
      avg: number;
      p50: number;
      p75: number;
      p90: number;
    };
    categoryAreaCounts: {
      min: number;
      max: number;
      avg: number;
      p50: number;
      p75: number;
      p90: number;
    };
  };
  categoryPerformance: Array<{
    categoryId: string;
    categorySlug: string;
    threshold: number;
    candidates: number;
    generated: number;
    filteredBelowThreshold: number;
  }>;
  highestDensityAreas: DensityEntry[];
  highestDensityCategories: DensityEntry[];
  strongestCategoryAreaCombinations: StrongCombinationEntry[];
}
const TOP_LIMIT = 20;

function percentile(values: number[], pct: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((pct / 100) * (sorted.length - 1))));
  return sorted[index] ?? 0;
}

function summarize(values: number[]) {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, p50: 0, p75: 0, p90: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    min,
    max,
    avg: Number(avg.toFixed(2)),
    p50: percentile(values, 50),
    p75: percentile(values, 75),
    p90: percentile(values, 90),
  };
}

function main(): void {
  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });

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
  const generatedAreaRoutes: string[] = [];
  const areaDensityValues: number[] = [];
  for (const area of engine.areas.records) {
    const payload = engine.query.getIntentResults({ areaId: area.id });
    if (!payload) {
      continue;
    }

    if (payload.passesThreshold) {
      totals.generatedAreaPages += 1;
      generatedAreaRoutes.push(area.urlSlug);
    }

    areaDensityValues.push(payload.counts.totalInArea);
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
  const categoryAreaValues: number[] = [];
  const categoryPerformance = new Map<string, {
    categoryId: string;
    categorySlug: string;
    threshold: number;
    candidates: number;
    generated: number;
    filteredBelowThreshold: number;
  }>();

  for (const area of engine.areas.records) {
    for (const category of engine.categories.records) {
      const categoryBucket = categoryPerformance.get(category.id) ?? {
        categoryId: category.id,
        categorySlug: category.urlSlug,
        threshold: engine.query.getEffectiveCategoryThreshold(category.id),
        candidates: 0,
        generated: 0,
        filteredBelowThreshold: 0,
      };
      categoryBucket.candidates += 1;
      categoryPerformance.set(category.id, categoryBucket);

      const canonicalCategory = category;
      const canonicalArea = area;
      const canonicalKey = `${canonicalCategory.urlSlug}/${canonicalArea.urlSlug}`;

      const payload = engine.query.getIntentResults({
        areaId: canonicalArea.id,
        categoryId: canonicalCategory.id,
      });

      if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
        filteredCombinations.below_threshold += 1;
        categoryBucket.filteredBelowThreshold += 1;
        categoryPerformance.set(category.id, categoryBucket);
        continue;
      }

      totals.generatedCategoryAreaPages += 1;
      categoryBucket.generated += 1;
      categoryPerformance.set(category.id, categoryBucket);
      categoryAreaValues.push(payload.counts.totalCategoryArea);
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
      minAreaEntityCount: engine.thresholds.minAreaEntityCount,
      minCategoryAreaCount: engine.thresholds.minCategoryAreaCount,
    },
    totals,
    filteredCombinations,
    generatedAreaRoutes,
    generatedCategoryAreaRoutes,
    densityAnalysis: {
      areaEntityCounts: summarize(areaDensityValues),
      categoryEntityCounts: summarize(highestDensityCategories.map((item) => item.count)),
      categoryAreaCounts: summarize(categoryAreaValues),
    },
    categoryPerformance: Array.from(categoryPerformance.values()).sort((left, right) => right.generated - left.generated),
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
  console.log(`- Area density p75/p90: ${report.densityAnalysis.areaEntityCounts.p75}/${report.densityAnalysis.areaEntityCounts.p90}`);
  console.log(`- Category×area density p75/p90: ${report.densityAnalysis.categoryAreaCounts.p75}/${report.densityAnalysis.categoryAreaCounts.p90}`);
  console.log(`- Artifact: ${targetFile}\n`);
}

main();
