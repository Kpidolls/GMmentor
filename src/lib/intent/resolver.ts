import { normalizeForLookup } from './normalize';
import type {
  AreaIntentRecord,
  AreaRegistry,
  CategoryIntentRecord,
  CategoryRegistry,
  IntentResolution,
} from './types';

export interface IntentResolver {
  resolveCategory(input?: string): CategoryIntentRecord | undefined;
  resolveArea(input?: string): AreaIntentRecord | undefined;
  resolveIntent(input: { category?: string; area?: string }): IntentResolution;
}

function resolveFromLookup<T>(lookup: Map<string, T>, input?: string): T | undefined {
  if (!input || !input.trim()) return undefined;
  return lookup.get(normalizeForLookup(input));
}

export function createIntentResolver(registries: {
  categories: CategoryRegistry;
  areas: AreaRegistry;
}): IntentResolver {
  const resolveCategory = (input?: string): CategoryIntentRecord | undefined =>
    resolveFromLookup(registries.categories.lookup, input);

  const resolveArea = (input?: string): AreaIntentRecord | undefined =>
    resolveFromLookup(registries.areas.lookup, input);

  const resolveIntent = (input: { category?: string; area?: string }): IntentResolution => {
    const category = resolveCategory(input.category);
    const area = resolveArea(input.area);

    if (category && area) {
      return {
        status: 'resolved',
        category,
        area,
        categoryInput: input.category,
        areaInput: input.area,
      };
    }

    if (category && !input.area) {
      return {
        status: 'partial',
        category,
        categoryInput: input.category,
        reason: 'missing_area',
      };
    }

    if (area && !input.category) {
      return {
        status: 'partial',
        area,
        areaInput: input.area,
        reason: 'missing_category',
      };
    }

    if (input.category && !category) {
      return {
        status: input.area && area ? 'partial' : 'unresolved',
        area,
        categoryInput: input.category,
        areaInput: input.area,
        reason: 'invalid_category',
      };
    }

    if (input.area && !area) {
      return {
        status: input.category && category ? 'partial' : 'unresolved',
        category,
        categoryInput: input.category,
        areaInput: input.area,
        reason: 'invalid_area',
      };
    }

    return {
      status: 'unresolved',
      categoryInput: input.category,
      areaInput: input.area,
      reason: 'missing_category',
    };
  };

  return {
    resolveCategory,
    resolveArea,
    resolveIntent,
  };
}
