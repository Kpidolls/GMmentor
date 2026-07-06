import { readFileSync } from 'fs';
import { join } from 'path';

import { calculateDistance } from '../utils/locationUtils';

export interface EntityRecord {
  id: string;
  slug: string;
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

export function loadEntitiesIndex(): EntitiesIndex {
  const raw = readFileSync(ENTITIES_INDEX_PATH, 'utf8');
  return JSON.parse(raw) as EntitiesIndex;
}

export function findEntityBySlug(entities: EntityRecord[], slug: string): EntityRecord | undefined {
  return entities.find((entity) => entity.slug === slug);
}

export function buildEntitySeoSignature(entity: EntityRecord): string {
  const normalizedName = entity.name.trim().toLowerCase();
  const normalizedLocation = (entity.address || entity.region || `${entity.lat.toFixed(5)},${entity.lng.toFixed(5)}`)
    .trim()
    .toLowerCase();

  return `${entity.kind}::${normalizedName}::${normalizedLocation}`;
}

function intersectCount(left: string[], right: string[]): number {
  const set = new Set(left);
  return right.reduce((count, value) => (set.has(value) ? count + 1 : count), 0);
}

export function getSameCategoryEntities(current: EntityRecord, entities: EntityRecord[], limit = 8): EntityRecord[] {
  if (current.kind !== 'restaurant' || !current.categoryIds?.length) {
    return [];
  }

  return entities
    .filter((entity) => entity.id !== current.id && entity.kind === 'restaurant' && (entity.categoryIds?.length ?? 0) > 0)
    .map((entity) => ({
      entity,
      overlap: intersectCount(current.categoryIds || [], entity.categoryIds || []),
      distance: calculateDistance(current.lat, current.lng, entity.lat, entity.lng),
    }))
    .filter((item) => item.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) {
        return b.overlap - a.overlap;
      }
      return a.distance - b.distance;
    })
    .slice(0, limit)
    .map((item) => item.entity);
}

export function getNearbyEntities(current: EntityRecord, entities: EntityRecord[], limit = 8): EntityRecord[] {
  return entities
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

  return entities
    .filter(
      (entity) =>
        entity.id !== current.id &&
        entity.region?.trim().toLowerCase() === currentRegion
    )
    .slice(0, limit);
}
