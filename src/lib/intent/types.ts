import type { EntityRecord } from '../entities';

export interface CategoryIntentRecord {
  id: string;
  name: string;
  urlSlug: string;
  aliases: string[];
}

export interface AreaIntentRecord {
  id: string;
  name: string;
  nameEn?: string;
  region: string;
  regionEn?: string;
  lat: number;
  lng: number;
  urlSlug: string;
  aliases: string[];
}

export interface CategoryRegistry {
  records: CategoryIntentRecord[];
  byId: Map<string, CategoryIntentRecord>;
  lookup: Map<string, CategoryIntentRecord>;
}

export interface AreaRegistry {
  records: AreaIntentRecord[];
  byId: Map<string, AreaIntentRecord>;
  lookup: Map<string, AreaIntentRecord>;
}

export type IntentResolutionStatus = 'resolved' | 'partial' | 'unresolved';

export interface IntentResolution {
  status: IntentResolutionStatus;
  category?: CategoryIntentRecord;
  area?: AreaIntentRecord;
  categoryInput?: string;
  areaInput?: string;
  reason?: 'missing_category' | 'missing_area' | 'invalid_category' | 'invalid_area';
}

export interface RankedEntity {
  entity: EntityRecord;
  distanceKm: number;
}

export interface AreaAuthorityPayload {
  area: AreaIntentRecord;
  totalNearbyEntities: number;
  topEntities: RankedEntity[];
  topCategories: Array<{ categoryId: string; count: number }>;
  passesThreshold: boolean;
}

export interface CategoryAreaPayload {
  category: CategoryIntentRecord;
  area: AreaIntentRecord;
  totalMatches: number;
  topEntities: RankedEntity[];
  passesThreshold: boolean;
}
