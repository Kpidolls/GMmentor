// ---------------------------------------------------------------------------
// Location data mappers
//
// Pure, deterministic, synchronous, side-effect free.
// Each function converts an unknown raw record (from JSON) into a canonical
// typed location or returns null when required fields are missing/invalid.
// List variants skip null records silently — callers decide whether to log.
// ---------------------------------------------------------------------------

import type {
  RestaurantLocation,
  MunicipalityLocation,
  AttractionLocation,
} from '../types/location';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type RawRecord = Record<string, unknown>;

/** Return a non-empty trimmed string or undefined. */
function asStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Parse a coord from number or numeric string; return undefined if invalid. */
function asCoord(v: unknown): number | undefined {
  if (typeof v === 'number') return isNaN(v) ? undefined : v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

/** Greece bounding box: 34–42 °N, 19–30 °E. */
function inGreece(lat: number, lng: number): boolean {
  return lat >= 34 && lat <= 42 && lng >= 19 && lng <= 30;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const filtered = v.filter((a): a is string => typeof a === 'string');
  return filtered.length > 0 ? filtered : undefined;
}

// ---------------------------------------------------------------------------
// Public single-record mappers
// ---------------------------------------------------------------------------

export function toRestaurant(raw: RawRecord): RestaurantLocation | null {
  const name = asStr(raw['name']);
  const lat = asCoord(raw['lat']);
  const lng = asCoord(raw['lng']);

  if (!name || lat === undefined || lng === undefined) return null;
  if (!inGreece(lat, lng)) return null;

  return {
    kind: 'restaurant',
    id: asStr(raw['id']),
    slug: asStr(raw['slug']),
    name,
    url: asStr(raw['url']),
    address: asStr(raw['address']) ?? '',
    lat,
    lng,
  };
}

export function toMunicipality(raw: RawRecord): MunicipalityLocation | null {
  const name = asStr(raw['name']);
  const region = asStr(raw['region']);
  const lat = asCoord(raw['lat']);
  const lng = asCoord(raw['lng']);

  if (!name || !region || lat === undefined || lng === undefined) return null;

  return {
    kind: 'municipality',
    id: asStr(raw['id']),
    slug: asStr(raw['slug']),
    name,
    name_en: asStr(raw['name_en']),
    lat,
    lng,
    region,
    region_en: asStr(raw['region_en']),
    aliases: asStringArray(raw['aliases']),
  };
}

export function toAttraction(raw: RawRecord): AttractionLocation | null {
  const name = asStr(raw['name']);
  const lat = asCoord(raw['lat']);
  const lng = asCoord(raw['lng']);

  if (!name || lat === undefined || lng === undefined) return null;

  return {
    kind: 'attraction',
    id: asStr(raw['id']),
    slug: asStr(raw['slug']),
    name,
    url: asStr(raw['url']),
    address: asStr(raw['address']),
    lat,
    lng,
  };
}

// ---------------------------------------------------------------------------
// Public list mappers — skip invalid records silently
// ---------------------------------------------------------------------------

export function toRestaurantList(raw: unknown[]): RestaurantLocation[] {
  const out: RestaurantLocation[] = [];
  for (const item of raw) {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const mapped = toRestaurant(item as RawRecord);
      if (mapped !== null) out.push(mapped);
    }
  }
  return out;
}

export function toMunicipalityList(raw: unknown[]): MunicipalityLocation[] {
  const out: MunicipalityLocation[] = [];
  for (const item of raw) {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const mapped = toMunicipality(item as RawRecord);
      if (mapped !== null) out.push(mapped);
    }
  }
  return out;
}

export function toAttractionList(raw: unknown[]): AttractionLocation[] {
  const out: AttractionLocation[] = [];
  for (const item of raw) {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const mapped = toAttraction(item as RawRecord);
      if (mapped !== null) out.push(mapped);
    }
  }
  return out;
}
