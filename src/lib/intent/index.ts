import { buildAreaRegistry, buildCategoryRegistry } from './registry';
import { createIntentQueryService } from './query';
import { createIntentResolver } from './resolver';
import type { EntityRecord } from '../entities';

export * from './types';
export * from './normalize';
export * from './registry';
export * from './resolver';
export * from './query';

export function createIntentEngine(input: {
  entities: EntityRecord[];
  thresholds?: {
    minAreaEntityCount?: number;
    minCategoryAreaCount?: number;
  };
}) {
  const categories = buildCategoryRegistry();
  const areas = buildAreaRegistry();
  const resolver = createIntentResolver({ categories, areas });
  const query = createIntentQueryService({
    entities: input.entities,
    categories,
    areas,
    thresholds: input.thresholds,
  });

  return {
    categories,
    areas,
    resolver,
    query,
  };
}
