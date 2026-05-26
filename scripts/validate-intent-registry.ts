import { loadEntitiesIndex, type EntityRecord } from '../src/lib/entities';
import { normalizeForLookup } from '../src/lib/intent/normalize';
import { buildAreaRegistry, buildCategoryRegistry } from '../src/lib/intent/registry';

type Issue = {
  code:
    | 'duplicate_category_slug'
    | 'duplicate_area_slug'
    | 'duplicate_category_alias'
    | 'duplicate_area_alias'
    | 'ambiguous_category_match'
    | 'ambiguous_area_match'
    | 'orphan_category'
    | 'orphan_area';
  detail: string;
};

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function buildAmbiguityMap(entries: Array<{ id: string; tokens: string[] }>): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const entry of entries) {
    for (const token of entry.tokens) {
      const normalized = normalizeForLookup(token);
      if (!normalized) continue;
      const existing = map.get(normalized) ?? new Set<string>();
      existing.add(entry.id);
      map.set(normalized, existing);
    }
  }
  return map;
}

function buildAliasOwnershipMap(entries: Array<{ id: string; aliases: string[] }>): Map<string, Set<string>> {
  const ownership = new Map<string, Set<string>>();
  for (const entry of entries) {
    const uniqueNormalized = new Set(entry.aliases.map((alias) => normalizeForLookup(alias)).filter(Boolean));
    for (const alias of uniqueNormalized) {
      const owners = ownership.get(alias) ?? new Set<string>();
      owners.add(entry.id);
      ownership.set(alias, owners);
    }
  }
  return ownership;
}

function collectIssues(): Issue[] {
  const issues: Issue[] = [];
  const categories = buildCategoryRegistry();
  const areas = buildAreaRegistry();
  const entities = loadEntitiesIndex().entities;

  const categorySlugDuplicates = buildAmbiguityMap(
    categories.records.map((record) => ({ id: record.id, tokens: [record.urlSlug] }))
  );
  for (const [slug, ids] of categorySlugDuplicates.entries()) {
    if (ids.size <= 1) continue;
    issues.push({ code: 'duplicate_category_slug', detail: `Duplicate category slug: ${slug}` });
  }

  const areaSlugDuplicates = buildAmbiguityMap(
    areas.records.map((record) => ({ id: record.id, tokens: [record.urlSlug] }))
  );
  for (const [slug, ids] of areaSlugDuplicates.entries()) {
    if (ids.size <= 1) continue;
    issues.push({ code: 'duplicate_area_slug', detail: `Duplicate area slug: ${slug}` });
  }

  const categoryAliasOwners = buildAliasOwnershipMap(
    categories.records.map((record) => ({ id: record.id, aliases: record.aliases }))
  );
  for (const [alias, ids] of categoryAliasOwners.entries()) {
    if (ids.size <= 1) continue;
    issues.push({
      code: 'duplicate_category_alias',
      detail: `Duplicate category alias '${alias}' used by: ${Array.from(ids).sort().join(', ')}`,
    });
  }

  const areaAliasOwners = buildAliasOwnershipMap(
    areas.records.map((record) => ({ id: record.id, aliases: record.aliases }))
  );
  for (const [alias, ids] of areaAliasOwners.entries()) {
    if (ids.size <= 1) continue;
    issues.push({
      code: 'duplicate_area_alias',
      detail: `Duplicate area alias '${alias}' used by: ${Array.from(ids).sort().join(', ')}`,
    });
  }

  const categoryAmbiguity = buildAmbiguityMap(
    categories.records.map((record) => ({
      id: record.id,
      tokens: [record.urlSlug, record.id, ...record.aliases],
    }))
  );
  for (const [token, ids] of categoryAmbiguity.entries()) {
    if (ids.size > 1) {
      issues.push({
        code: 'ambiguous_category_match',
        detail: `Ambiguous category token '${token}' maps to: ${Array.from(ids).sort().join(', ')}`,
      });
    }
  }

  const areaAmbiguity = buildAmbiguityMap(
    areas.records.map((record) => ({
      id: record.id,
      tokens: [record.urlSlug, record.id, ...record.aliases],
    }))
  );
  for (const [token, ids] of areaAmbiguity.entries()) {
    if (ids.size > 1) {
      issues.push({
        code: 'ambiguous_area_match',
        detail: `Ambiguous area token '${token}' maps to: ${Array.from(ids).sort().join(', ')}`,
      });
    }
  }

  const categoryUseCount = new Map<string, number>();
  for (const entity of entities) {
    for (const categoryId of entity.categoryIds ?? []) {
      categoryUseCount.set(categoryId, (categoryUseCount.get(categoryId) ?? 0) + 1);
    }
  }

  for (const record of categories.records) {
    if ((categoryUseCount.get(record.id) ?? 0) === 0) {
      issues.push({
        code: 'orphan_category',
        detail: `Orphan category '${record.id}' has no mapped entities`,
      });
    }
  }

  const discoverableEntities = entities.filter((entity) => entity.kind !== 'municipality');
  const orphanRadiusKm = 3.5;

  const isInActiveAreaScope = (area: { region: string; regionEn?: string }): boolean => {
    const region = normalizeForLookup(area.region);
    const regionEn = normalizeForLookup(area.regionEn ?? '');
    return (
      region.includes('athina') ||
      region.includes('athens') ||
      regionEn.includes('athens')
    );
  };

  for (const area of areas.records) {
    if (!isInActiveAreaScope({ region: area.region, regionEn: area.regionEn })) {
      continue;
    }

    const hasNearby = discoverableEntities.some(
      (entity: EntityRecord) =>
        calculateDistanceKm(area.lat, area.lng, entity.lat, entity.lng) <= orphanRadiusKm
    );

    if (!hasNearby) {
      issues.push({
        code: 'orphan_area',
        detail: `Orphan area '${area.urlSlug}' (${area.name}) has no entities within ${orphanRadiusKm}km`,
      });
    }
  }

  return issues;
}

function main(): void {
  console.log('\n🔎 Validating intent registry...\n');
  const issues = collectIssues();

  if (issues.length === 0) {
    console.log('✅ Intent registry validation passed.\n');
    return;
  }

  const grouped = new Map<Issue['code'], string[]>();
  for (const issue of issues) {
    const bucket = grouped.get(issue.code) ?? [];
    bucket.push(issue.detail);
    grouped.set(issue.code, bucket);
  }

  for (const [code, details] of grouped.entries()) {
    console.error(`❌ ${code}: ${details.length}`);
    for (const detail of details) {
      console.error(`   - ${detail}`);
    }
  }

  console.error(`\nIntent registry validation failed with ${issues.length} issue(s).\n`);
  process.exitCode = 1;
}

main();
