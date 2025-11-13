// Helper to build a hierarchical regions -> areas -> municipalities structure
// from the flat `municipalities.json` (served from /data/municipalities.json).
//
// Strategy:
// - There are many different `region` values in the source (for Athens these
//   are things like "Κέντρο Αθήνας", "Βόρεια Προάστια" etc.). We treat
//   those as "areas". We keep a small mapping (heuristic) that maps well-known
//   area names to top-level administrative regions (e.g. all Athens areas -> "Αττική").
// - If no mapping exists, the code falls back to grouping by the existing
//   `region` value under a top-level bucket called "Άλλες Περιοχές" so nothing
//   is lost and you can refine the mapping later.

export type Municipality = {
  name: string;
  lat: number;
  lng: number;
  region: string; // area name in the flat file
};

export type Area = {
  name: string;
  municipalities: Municipality[];
};

export type GreeceRegion = {
  region: string; // top-level region (e.g. 'Αττική')
  areas: Area[];
};

// Small heuristics mapping for common Athens area names to top-level 'Αττική'.
// Extend this mapping if you want more precise top-level grouping.
const areaToTopRegionMap: Record<string, string> = {
  // Athens local areas
  'Κέντρο Αθήνας': 'Αττική',
  'Βόρεια Προάστια': 'Αττική',
  'Νότια Προάστια': 'Αττική',
  'Πειραιάς': 'Αττική',
  'Δυτικά Προάστια': 'Αττική',
  'Ανατολικά Προάστια': 'Αττική',
  'Δυτική Αττική': 'Αττική',
  'Βόρεια/Ανατολικά': 'Αττική',
  'Κέντρο': 'Αττική',
  'Κέντρο Αθήνας/Πλατεία': 'Αττική'
};

// Try to infer a top-level region name from a region string.
function inferTopRegion(areaName?: string): string {
  if (!areaName) return 'Άλλες Περιοχές';
  if (areaToTopRegionMap[areaName]) return areaToTopRegionMap[areaName];

  // Heuristics: if the area contains key words, map them
  const lower = areaName.toLowerCase();
  if (lower.includes('αθήνα') || lower.includes('αττική') || lower.includes('προάστια') || lower.includes('αθην')) {
    return 'Αττική';
  }
  if (lower.includes('θεσσαλονίκη') || lower.includes('θεσσαλονικ')) return 'Κεντρική Μακεδονία';
  if (lower.includes('κρήτη') || lower.includes('ηράκλειο') || lower.includes('χανιά') || lower.includes('ρέθυμνο')) return 'Κρήτη';
  if (lower.includes('πελοπόννησο') || lower.includes('πατρα') || lower.includes('καλαμάτα')) return 'Πελοπόννησος';

  // fallback
  return 'Άλλες Περιοχές';
}

export function buildGreeceRegions(flat: Municipality[]): GreeceRegion[] {
  const map: Record<string, Record<string, Municipality[]>> = {};

  for (const m of flat) {
    const area = m.region.trim() || 'Άγνωστο';
    const top = inferTopRegion(area);
    map[top] = map[top] || {};
    map[top][area] = map[top][area] || [];
    map[top][area].push({ name: m.name, lat: m.lat, lng: m.lng, region: area });
  }

  // Convert to array
  const result: GreeceRegion[] = Object.entries(map).map(([region, areasObj]) => ({
    region,
    areas: Object.entries(areasObj).map(([name, municipalities]) => ({ name, municipalities }))
  }));

  // Sort top-level regions alphabetically (Greek locale) and areas by name
  result.sort((a, b) => a.region.localeCompare(b.region, 'el'));
  for (const r of result) r.areas.sort((x, y) => x.name.localeCompare(y.name, 'el'));
  return result;
}

export const DEFAULT_TOP_REGION = 'Άλλες Περιοχές';
