export type LocationKind = 'restaurant' | 'municipality' | 'attraction' | 'poi';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocalizedText {
  en?: string;
  el?: string;
}

export interface LocationBase extends Coordinates {
  id?: string;
  slug?: string;
  kind: LocationKind;
  name: string;
  aliases?: string[];
  url?: string;
}

export interface RestaurantLocation extends LocationBase {
  kind: 'restaurant';
  address: string;
  categoryIds?: string[];
}

export interface MunicipalityLocation extends LocationBase {
  kind: 'municipality';
  region: string;
  name_en?: string;
  region_en?: string;
}

export interface AttractionLocation extends LocationBase {
  kind: 'attraction' | 'poi';
  address?: string;
  region?: string;
}

export type DiscoverableLocation =
  | RestaurantLocation
  | MunicipalityLocation
  | AttractionLocation;

export interface LocationEnrichment {
  record_id: string;
  summary_en?: string;
  summary_el?: string;
  semantic_tags?: string[];
  related_record_ids?: string[];
  confidence?: number;
  provenance?: string;
}

// Transitional aliases for existing consumer code.
export type Position = Coordinates;
export type RestaurantRecord = RestaurantLocation;
export type MunicipalityRecord = MunicipalityLocation;