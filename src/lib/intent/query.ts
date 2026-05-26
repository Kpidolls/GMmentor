import type { EntityRecord } from '../entities';
import { calculateDistance } from '../../utils/locationUtils';
import type {
  AreaAuthorityPayload,
  AreaRegistry,
  CategoryAreaPayload,
  CategoryRegistry,
  RankedEntity,
} from './types';

export interface IntentQueryThresholds {
  minAreaEntityCount: number;
  minCategoryAreaCount: number;
}

export interface IntentQueryService {
  getAreaAuthorityPayload(input: { areaId: string; radiusKm?: number; limit?: number }): AreaAuthorityPayload | null;
  getCategoryAreaPayload(input: {
    categoryId: string;
    areaId: string;
    radiusKm?: number;
    limit?: number;
  }): CategoryAreaPayload | null;
}

const DEFAULT_RADIUS_KM = 3.5;

function rankByDistance(
  entities: EntityRecord[],
  area: { lat: number; lng: number },
  radiusKm: number
): RankedEntity[] {
  return entities
    .map((entity) => ({
      entity,
      distanceKm: calculateDistance(area.lat, area.lng, entity.lat, entity.lng),
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((left, right) => left.distanceKm - right.distanceKm);
}

function isDiscoverableEntity(entity: EntityRecord): boolean {
  return entity.kind !== 'municipality';
}

export function createIntentQueryService(deps: {
  entities: EntityRecord[];
  categories: CategoryRegistry;
  areas: AreaRegistry;
  thresholds?: Partial<IntentQueryThresholds>;
}): IntentQueryService {
  const thresholds: IntentQueryThresholds = {
    minAreaEntityCount: deps.thresholds?.minAreaEntityCount ?? 8,
    minCategoryAreaCount: deps.thresholds?.minCategoryAreaCount ?? 5,
  };

  const getAreaAuthorityPayload: IntentQueryService['getAreaAuthorityPayload'] = ({
    areaId,
    radiusKm = DEFAULT_RADIUS_KM,
    limit = 24,
  }) => {
    const area = deps.areas.byId.get(areaId);
    if (!area) return null;

    const nearby = rankByDistance(
      deps.entities.filter(isDiscoverableEntity),
      { lat: area.lat, lng: area.lng },
      radiusKm
    );

    const categoryCounter = new Map<string, number>();
    for (const item of nearby) {
      for (const categoryId of item.entity.categoryIds ?? []) {
        categoryCounter.set(categoryId, (categoryCounter.get(categoryId) ?? 0) + 1);
      }
    }

    const topCategories = Array.from(categoryCounter.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([categoryId, count]) => ({ categoryId, count }));

    return {
      area,
      totalNearbyEntities: nearby.length,
      topEntities: nearby.slice(0, limit),
      topCategories,
      passesThreshold: nearby.length >= thresholds.minAreaEntityCount,
    };
  };

  const getCategoryAreaPayload: IntentQueryService['getCategoryAreaPayload'] = ({
    categoryId,
    areaId,
    radiusKm = DEFAULT_RADIUS_KM,
    limit = 24,
  }) => {
    const area = deps.areas.byId.get(areaId);
    const category = deps.categories.byId.get(categoryId);
    if (!area || !category) return null;

    const categoryEntities = deps.entities.filter(
      (entity) =>
        entity.kind === 'restaurant' &&
        Array.isArray(entity.categoryIds) &&
        entity.categoryIds.includes(categoryId)
    );

    const ranked = rankByDistance(categoryEntities, { lat: area.lat, lng: area.lng }, radiusKm);

    return {
      category,
      area,
      totalMatches: ranked.length,
      topEntities: ranked.slice(0, limit),
      passesThreshold: ranked.length >= thresholds.minCategoryAreaCount,
    };
  };

  return {
    getAreaAuthorityPayload,
    getCategoryAreaPayload,
  };
}
