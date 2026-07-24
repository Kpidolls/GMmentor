import { readFileSync } from 'fs';
import { join } from 'path';

import { calculateDistance } from '../utils/locationUtils';

export interface EntityRecord {
  id: string;
  slug: string;
  legacySlugs?: string[];
  kind: 'restaurant' | 'municipality' | 'attraction' | 'poi';
  name: string;
  lat: number;
  lng: number;
  aliases?: string[];
  url?: string | null;
  address?: string;
  region?: string;
  name_en?: string;
  region_en?: string;
  categoryIds?: string[];
  categories?: string[];
}

interface EntitiesIndex {
  meta: {
    generated_at: string;
    generator_version: string;
    schema_version: number;
    canonical_url: string;
    language_coverage: string[];
    record_count: number;
    by_kind: Record<string, number>;
  };
  entities: EntityRecord[];
}

const ENTITIES_INDEX_PATH = join(process.cwd(), 'public', 'data', 'entities.json');

let cachedEntitiesIndex: EntitiesIndex | null = null;

function normalizeIdentityPart(value?: string): string {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function entityCompletenessScore(entity: EntityRecord): number {
  let score = 0;
  if (entity.id) score += 4;
  if (entity.slug) score += 3;
  if (entity.url) score += 2;
  if (entity.address) score += 2;
  if (entity.region) score += 1;
  if (entity.aliases?.length) score += 1;
  if (entity.categoryIds?.length) score += 1;
  return score;
}

export function buildEntityIdentityKey(entity: EntityRecord): string {
  const normalizedName = normalizeIdentityPart(entity.name);
  const normalizedLocation = normalizeIdentityPart(entity.address || entity.region) || `${entity.lat.toFixed(5)},${entity.lng.toFixed(5)}`;
  return `${entity.kind}::${normalizedName}::${normalizedLocation}`;
}

export function dedupeEntitiesByIdentity(entities: EntityRecord[]): EntityRecord[] {
  const byKey = new Map<string, EntityRecord>();

  for (const entity of entities) {
    const key = buildEntityIdentityKey(entity);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, entity);
      continue;
    }

    const currentScore = entityCompletenessScore(entity);
    const existingScore = entityCompletenessScore(existing);

    if (currentScore > existingScore) {
      byKey.set(key, entity);
      continue;
    }

    if (currentScore === existingScore) {
      const existingId = existing.id || '';
      const currentId = entity.id || '';
      if (currentId && (!existingId || currentId.localeCompare(existingId) < 0)) {
        byKey.set(key, entity);
      }
    }
  }

  return Array.from(byKey.values());
}

export function loadEntitiesIndex(): EntitiesIndex {
  if (!cachedEntitiesIndex) {
    const raw = readFileSync(ENTITIES_INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as EntitiesIndex;
    const dedupedEntities = dedupeEntitiesByIdentity(parsed.entities);

    const byKind: Record<string, number> = {};
    for (const entity of dedupedEntities) {
      byKind[entity.kind] = (byKind[entity.kind] || 0) + 1;
    }

    cachedEntitiesIndex = {
      ...parsed,
      meta: {
        ...parsed.meta,
        record_count: dedupedEntities.length,
        by_kind: byKind,
      },
      entities: dedupedEntities,
    };
  }

  return cachedEntitiesIndex;
}

export function findEntityBySlug(entities: EntityRecord[], slug: string): EntityRecord | undefined {
  return entities.find((entity) => entity.slug === slug || entity.legacySlugs?.includes(slug));
}

export function buildEntitySeoSignature(entity: EntityRecord): string {
  const normalizedName = entity.name.trim().toLowerCase();
  const normalizedLocation = (entity.address || entity.region || `${entity.lat.toFixed(5)},${entity.lng.toFixed(5)}`)
    .trim()
    .toLowerCase();

  return `${entity.kind}::${normalizedName}::${normalizedLocation}`;
}

export function getSameCategoryEntities(current: EntityRecord, entities: EntityRecord[], limit = 8): EntityRecord[] {
  const primaryCategoryId = current.categoryIds?.find(Boolean);
  if (!primaryCategoryId) {
    return [];
  }

  return dedupeEntitiesByIdentity(entities)
    .filter((entity) =>
      entity.id !== current.id &&
      entity.kind !== 'municipality' &&
      Array.isArray(entity.categoryIds) &&
      entity.categoryIds.includes(primaryCategoryId)
    )
    .map((entity) => ({
      entity,
      distance: calculateDistance(current.lat, current.lng, entity.lat, entity.lng),
    }))
    .sort((a, b) => {
      const kindScoreA = a.entity.kind === current.kind ? 1 : 0;
      const kindScoreB = b.entity.kind === current.kind ? 1 : 0;

      if (kindScoreA !== kindScoreB) {
        return kindScoreB - kindScoreA;
      }

      return a.distance - b.distance;
    })
    .slice(0, limit)
    .map((item) => item.entity);
}

export function getNearbyEntities(current: EntityRecord, entities: EntityRecord[], limit = 8): EntityRecord[] {
  return dedupeEntitiesByIdentity(entities)
    .filter((entity) => entity.id !== current.id)
    .map((entity) => ({
      entity,
      distance: calculateDistance(current.lat, current.lng, entity.lat, entity.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((item) => item.entity);
}

export function getSameRegionEntities(current: EntityRecord, entities: EntityRecord[], limit = 8): EntityRecord[] {
  const currentRegion = current.region?.trim().toLowerCase();
  if (!currentRegion) {
    return [];
  }

  return dedupeEntitiesByIdentity(entities)
    .filter(
      (entity) =>
        entity.id !== current.id &&
        entity.region?.trim().toLowerCase() === currentRegion
    )
    .slice(0, limit);
}
