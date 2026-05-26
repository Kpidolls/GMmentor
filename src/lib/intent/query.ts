import type { EntityRecord } from '../entities';
import { calculateDistance } from '../../utils/locationUtils';
import type {
  AreaAuthorityPayload,
  AreaRegistry,
  CategoryAreaPayload,
  CategoryRegistry,
  IntentResultsPayload,
  RankedEntity,
} from './types';

export interface IntentQueryThresholds {
  minAreaEntityCount: number;
  minCategoryAreaCount: number;
  categoryMinMatches: Record<string, number>;
}

export interface IntentQueryService {
  getAreaAuthorityPayload(input: { areaId: string; radiusKm?: number; limit?: number }): AreaAuthorityPayload | null;
  getCategoryAreaPayload(input: {
    categoryId: string;
    areaId: string;
    radiusKm?: number;
    limit?: number;
  }): CategoryAreaPayload | null;
  getIntentResults(input: {
    areaId: string;
    categoryId?: string;
    radiusKm?: number;
    limit?: number;
    relatedLimit?: number;
  }): IntentResultsPayload | null;
  getEffectiveCategoryThreshold(categoryId: string): number;
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

function isCategoryEntity(entity: EntityRecord, categoryId: string): boolean {
  return (
    entity.kind === 'restaurant' &&
    Array.isArray(entity.categoryIds) &&
    entity.categoryIds.includes(categoryId)
  );
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
    categoryMinMatches: deps.thresholds?.categoryMinMatches ?? {},
  };

  const getEffectiveCategoryThreshold = (categoryId: string): number =>
    thresholds.categoryMinMatches[categoryId] ?? thresholds.minCategoryAreaCount;

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

    const categoryEntities = deps.entities.filter((entity) => isCategoryEntity(entity, categoryId));

    const ranked = rankByDistance(categoryEntities, { lat: area.lat, lng: area.lng }, radiusKm);

    return {
      category,
      area,
      totalMatches: ranked.length,
      topEntities: ranked.slice(0, limit),
      passesThreshold: ranked.length >= getEffectiveCategoryThreshold(categoryId),
    };
  };

  const getIntentResults: IntentQueryService['getIntentResults'] = ({
    areaId,
    categoryId,
    radiusKm = DEFAULT_RADIUS_KM,
    limit = 24,
    relatedLimit = 8,
  }) => {
    const area = deps.areas.byId.get(areaId);
    if (!area) return null;

    const category = categoryId ? deps.categories.byId.get(categoryId) : undefined;
    if (categoryId && !category) return null;

    const discoverable = deps.entities.filter(isDiscoverableEntity);
    const inArea = rankByDistance(discoverable, { lat: area.lat, lng: area.lng }, radiusKm);
    const categoryUniverse = categoryId
      ? deps.entities.filter((entity) => isCategoryEntity(entity, categoryId))
      : [];
    const categoryInArea = categoryId
      ? rankByDistance(categoryUniverse, { lat: area.lat, lng: area.lng }, radiusKm)
      : [];

    const selectedEntities = categoryId ? categoryInArea : inArea;

    const categoryCounter = new Map<string, number>();
    for (const item of inArea) {
      for (const id of item.entity.categoryIds ?? []) {
        categoryCounter.set(id, (categoryCounter.get(id) ?? 0) + 1);
      }
    }

    const relatedCategories = Array.from(categoryCounter.entries())
      .map(([id, count]) => ({
        categoryId: id,
        categorySlug: deps.categories.byId.get(id)?.urlSlug ?? id,
        categoryName: deps.categories.byId.get(id)?.name ?? id,
        count,
        passesThreshold: count >= getEffectiveCategoryThreshold(id),
      }))
      .filter((item) => item.count > 0 && (!categoryId || item.categoryId !== categoryId))
      .sort((left, right) => right.count - left.count)
      .slice(0, relatedLimit);

    const relatedAreas = deps.areas.records
      .filter((candidate) => candidate.id !== area.id)
      .map((candidate) => {
        const ranked = categoryId
          ? rankByDistance(categoryUniverse, { lat: candidate.lat, lng: candidate.lng }, radiusKm)
          : rankByDistance(discoverable, { lat: candidate.lat, lng: candidate.lng }, radiusKm);

        return {
          areaId: candidate.id,
          areaName: candidate.name,
          areaSlug: candidate.urlSlug,
          count: ranked.length,
          nearestDistanceKm:
            ranked.length > 0
              ? ranked[0]!.distanceKm
              : calculateDistance(area.lat, area.lng, candidate.lat, candidate.lng),
        };
      })
      .filter((candidate) => candidate.count > 0)
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return left.nearestDistanceKm - right.nearestDistanceKm;
      })
      .slice(0, relatedLimit);

    return {
      area,
      category: category ?? null,
      entities: selectedEntities.slice(0, limit),
      counts: {
        totalEntities: deps.entities.length,
        totalInArea: inArea.length,
        totalInCategory: categoryId ? categoryUniverse.length : 0,
        totalCategoryArea: categoryId ? categoryInArea.length : inArea.length,
      },
      relatedCategories,
      relatedAreas,
      passesThreshold: categoryId
        ? categoryInArea.length >= getEffectiveCategoryThreshold(categoryId)
        : inArea.length >= thresholds.minAreaEntityCount,
    };
  };

  return {
    getAreaAuthorityPayload,
    getCategoryAreaPayload,
    getIntentResults,
    getEffectiveCategoryThreshold,
  };
}
