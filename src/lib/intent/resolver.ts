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
  resolveIntent(categorySlug?: string, areaSlug?: string): IntentResolution;
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

  const resolveIntent = (categorySlug?: string, areaSlug?: string): IntentResolution => {
    const category = resolveCategory(categorySlug);
    const area = resolveArea(areaSlug);

    if (category && area) {
      return {
        status: 'resolved',
        categoryId: category.id,
        areaId: area.id,
        confidence: 1,
        category,
        area,
        categoryInput: categorySlug,
        areaInput: areaSlug,
      };
    }

    if (category && !areaSlug) {
      return {
        status: 'partial',
        categoryId: category.id,
        confidence: 0.5,
        category,
        categoryInput: categorySlug,
        reason: 'missing_area',
      };
    }

    if (area && !categorySlug) {
      return {
        status: 'partial',
        areaId: area.id,
        confidence: 0.5,
        area,
        areaInput: areaSlug,
        reason: 'missing_category',
      };
    }

    if (categorySlug && !category) {
      return {
        status: areaSlug && area ? 'partial' : 'unresolved',
        areaId: area?.id,
        confidence: area ? 0.25 : 0,
        area,
        categoryInput: categorySlug,
        areaInput: areaSlug,
        reason: 'invalid_category',
      };
    }

    if (areaSlug && !area) {
      return {
        status: categorySlug && category ? 'partial' : 'unresolved',
        categoryId: category?.id,
        confidence: category ? 0.25 : 0,
        category,
        categoryInput: categorySlug,
        areaInput: areaSlug,
        reason: 'invalid_area',
      };
    }

    return {
      status: 'unresolved',
      confidence: 0,
      categoryInput: categorySlug,
      areaInput: areaSlug,
      reason: 'missing_category',
    };
  };

  return {
    resolveCategory,
    resolveArea,
    resolveIntent,
  };
}
