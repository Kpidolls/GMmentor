import { buildAreaRegistry, buildCategoryRegistry } from './registry';
import { createIntentQueryService } from './query';
import { createIntentResolver } from './resolver';
import type { EntityRecord } from '../entities';
import { intentThresholds } from './thresholds';

export * from './types';
export * from './normalize';
export * from './registry';
export * from './resolver';
export * from './query';
export * from './thresholds';

export function createIntentEngine(input: {
  entities: EntityRecord[];
  thresholds?: {
    minAreaEntityCount?: number;
    minCategoryAreaCount?: number;
    categoryMinMatches?: Record<string, number>;
  };
}) {
  const categories = buildCategoryRegistry();
  const areas = buildAreaRegistry();
  const resolver = createIntentResolver({ categories, areas });

  const effectiveThresholds = {
    minAreaEntityCount: input.thresholds?.minAreaEntityCount ?? intentThresholds.minAreaEntityCount,
    minCategoryAreaCount: input.thresholds?.minCategoryAreaCount ?? intentThresholds.minCategoryAreaCount,
    categoryMinMatches: input.thresholds?.categoryMinMatches ?? intentThresholds.categoryMinMatches,
  };

  const query = createIntentQueryService({
    entities: input.entities,
    categories,
    areas,
    thresholds: effectiveThresholds,
  });

  return {
    categories,
    areas,
    resolver,
    query,
    thresholds: effectiveThresholds,
  };
}
