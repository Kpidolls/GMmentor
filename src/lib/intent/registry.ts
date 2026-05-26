import categoriesRaw from '../../data/restaurantCategories.json';
import municipalitiesRaw from '../../data/municipalities.json';
import { toMunicipalityList } from '../../utils/mappers';
import { normalizeForLookup, slugifyIntent, stripHashSuffixFromSlug } from './normalize';
import type {
  AreaIntentRecord,
  AreaRegistry,
  CategoryIntentRecord,
  CategoryRegistry,
} from './types';

interface RawCategory {
  id: string;
  name: string;
}

const CATEGORY_URL_OVERRIDES: Record<string, string> = {
  'rooftop-lounges': 'rooftops',
  'coffee-brunch': 'brunch',
  'asian': 'asian-restaurants',
};

const CATEGORY_EXTRA_ALIASES: Record<string, string[]> = {
  'rooftop-lounges': ['rooftop-lounges', 'rooftop', 'roof-top'],
  'coffee-brunch': ['coffee-brunch', 'coffee-and-brunch', 'brunch-spots'],
  'asian': ['asian', 'asian-restaurant', 'asian-restaurants'],
};

function addLookup(record: CategoryIntentRecord, lookup: Map<string, CategoryIntentRecord>): void {
  const tokens = new Set<string>([record.urlSlug, record.id, ...record.aliases]);
  for (const token of tokens) {
    const key = normalizeForLookup(token);
    if (!key || lookup.has(key)) continue;
    lookup.set(key, record);
  }
}

function addAreaLookup(record: AreaIntentRecord, lookup: Map<string, AreaIntentRecord>): void {
  const tokens = new Set<string>([record.urlSlug, record.id, ...record.aliases]);
  for (const token of tokens) {
    const key = normalizeForLookup(token);
    if (!key || lookup.has(key)) continue;
    lookup.set(key, record);
  }
}

export function buildCategoryRegistry(): CategoryRegistry {
  const categories = categoriesRaw as RawCategory[];
  const records: CategoryIntentRecord[] = categories
    .filter((category) => category.id && category.name)
    .map((category) => {
      const urlSlug = CATEGORY_URL_OVERRIDES[category.id] ?? slugifyIntent(category.id);
      const aliases = [
        category.id,
        category.name,
        slugifyIntent(category.name),
        ...(CATEGORY_EXTRA_ALIASES[category.id] ?? []),
      ];

      return {
        id: category.id,
        name: category.name,
        urlSlug,
        aliases: Array.from(new Set(aliases.map((alias) => alias.trim()).filter(Boolean))),
      };
    });

  const byId = new Map<string, CategoryIntentRecord>();
  const lookup = new Map<string, CategoryIntentRecord>();

  for (const record of records) {
    byId.set(record.id, record);
    addLookup(record, lookup);
  }

  return { records, byId, lookup };
}

function canonicalAreaSlug(name: string, nameEn: string | undefined): string {
  const preferred = nameEn && nameEn.trim() ? nameEn : name;
  return slugifyIntent(preferred);
}

function ensureUniqueAreaSlug(baseSlug: string, region: string, used: Set<string>): string {
  if (!used.has(baseSlug)) {
    used.add(baseSlug);
    return baseSlug;
  }

  const withRegion = `${baseSlug}-${slugifyIntent(region)}`;
  if (!used.has(withRegion)) {
    used.add(withRegion);
    return withRegion;
  }

  let index = 2;
  while (used.has(`${withRegion}-${index}`)) {
    index += 1;
  }
  const fallback = `${withRegion}-${index}`;
  used.add(fallback);
  return fallback;
}

export function buildAreaRegistry(): AreaRegistry {
  const municipalities = toMunicipalityList(municipalitiesRaw as unknown[]);
  const usedSlugs = new Set<string>();

  const seededRecords: AreaIntentRecord[] = municipalities
    .filter((municipality) => municipality.name && municipality.region)
    .map((municipality) => {
      const baseSlug = canonicalAreaSlug(municipality.name, municipality.name_en);
      const urlSlug = ensureUniqueAreaSlug(baseSlug, municipality.region_en ?? municipality.region, usedSlugs);
      const normalizedSourceSlug = municipality.slug ? stripHashSuffixFromSlug(municipality.slug) : undefined;
      const regionName = municipality.region_en ?? municipality.region;

      const aliases = [
        municipality.name,
        municipality.name_en,
        `${municipality.name} ${regionName}`,
        municipality.name_en ? `${municipality.name_en} ${regionName}` : undefined,
        ...(municipality.aliases ?? []),
        municipality.slug,
        normalizedSourceSlug,
      ].filter((value): value is string => Boolean(value && value.trim()));

      return {
        id: municipality.id ?? `${urlSlug}-area`,
        name: municipality.name,
        nameEn: municipality.name_en,
        region: municipality.region,
        regionEn: municipality.region_en,
        lat: municipality.lat,
        lng: municipality.lng,
        urlSlug,
        aliases: Array.from(new Set(aliases.map((alias) => alias.trim()).filter(Boolean))),
      };
    });

  const aliasFrequency = new Map<string, number>();
  for (const record of seededRecords) {
    const normalizedUnique = new Set(record.aliases.map((alias) => normalizeForLookup(alias)).filter(Boolean));
    for (const alias of normalizedUnique) {
      aliasFrequency.set(alias, (aliasFrequency.get(alias) ?? 0) + 1);
    }
  }

  const records: AreaIntentRecord[] = seededRecords.map((record) => ({
    ...record,
    // Keep only globally unique aliases; canonical urlSlug and id remain unique lookup keys.
    aliases: record.aliases.filter((alias) => {
      const normalized = normalizeForLookup(alias);
      if (!normalized) return false;
      return (aliasFrequency.get(normalized) ?? 0) === 1;
    }),
  }));

  const byId = new Map<string, AreaIntentRecord>();
  const lookup = new Map<string, AreaIntentRecord>();

  for (const record of records) {
    byId.set(record.id, record);
    addAreaLookup(record, lookup);
  }

  return { records, byId, lookup };
}
