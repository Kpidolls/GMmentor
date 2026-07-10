import { readFileSync } from 'fs';
import { join } from 'path';

export type PlaceEnrichment = {
  entity_id: string;
  effective: {
    summary_en: string;
    summary_el: string;
    vibe_tags: string[];
    best_for: string[];
    visit_moments: string[];
    practical_note: string;
    nearby_walkable_count: number;
    nearby_count_2km: number;
    confidence: number;
  };
};

type PlaceEnrichmentIndex = {
  meta: {
    generated_at: string;
    generator_version: string;
    schema_version: number;
    canonical_url: string;
    total_entities: number;
    override_entities: number;
  };
  enrichments: PlaceEnrichment[];
};

const ENRICHMENT_PATH = join(process.cwd(), 'public', 'data', 'place-enrichment.json');

let cachedIndex: PlaceEnrichmentIndex | null = null;
let cachedByEntityId: Map<string, PlaceEnrichment> | null = null;

export function loadPlaceEnrichmentIndex(): PlaceEnrichmentIndex {
  if (!cachedIndex) {
    const raw = readFileSync(ENRICHMENT_PATH, 'utf8');
    cachedIndex = JSON.parse(raw) as PlaceEnrichmentIndex;
  }

  return cachedIndex;
}

export function getPlaceEnrichmentByEntityId(entityId: string): PlaceEnrichment | undefined {
  if (!cachedByEntityId) {
    const index = loadPlaceEnrichmentIndex();
    cachedByEntityId = new Map(index.enrichments.map((entry) => [entry.entity_id, entry]));
  }

  return cachedByEntityId.get(entityId);
}
