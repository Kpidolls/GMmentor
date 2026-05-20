// ---------------------------------------------------------------------------
// Zod schemas for canonical location types
//
// These mirror src/types/location.ts exactly.
// They validate the OUTPUT of mappers (src/utils/mappers.ts), not raw JSON.
// Mappers handle coercion; schemas enforce the trusted runtime contract.
// ---------------------------------------------------------------------------

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared base schemas
// ---------------------------------------------------------------------------

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const locationBaseSchema = coordinatesSchema.extend({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  url: z.url().optional(),
});

// ---------------------------------------------------------------------------
// Dataset-specific schemas (one per LocationKind)
// ---------------------------------------------------------------------------

export const RestaurantLocationSchema = locationBaseSchema.extend({
  kind: z.literal('restaurant'),
  address: z.string(),
  categoryIds: z.array(z.string()).optional(),
});

export const MunicipalityLocationSchema = locationBaseSchema.extend({
  kind: z.literal('municipality'),
  region: z.string().min(1),
  name_en: z.string().optional(),
  region_en: z.string().optional(),
});

// Mapper currently only produces 'attraction'; 'poi' reserved for future use.
export const AttractionLocationSchema = locationBaseSchema.extend({
  kind: z.literal('attraction'),
  address: z.string().optional(),
  region: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Discriminated union — usable for mixed-kind lists
// ---------------------------------------------------------------------------

export const DiscoverableLocationSchema = z.discriminatedUnion('kind', [
  RestaurantLocationSchema,
  MunicipalityLocationSchema,
  AttractionLocationSchema,
]);
