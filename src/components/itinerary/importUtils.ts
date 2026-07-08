import { Itinerary, ItineraryDay, ItineraryItem, ItineraryItemType } from './useItinerary';

const VALID_TYPES: ItineraryItemType[] = ['place', 'area', 'guide', 'custom'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const ensureString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  return fallback;
};

const ensureOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

const validateItem = (value: unknown): ItineraryItem => {
  if (!isObject(value)) {
    throw new Error('Invalid item');
  }

  const id = ensureString(value.id).trim();
  const name = ensureString(value.name).trim();
  const type = ensureString(value.type) as ItineraryItemType;

  if (!id || !name || !VALID_TYPES.includes(type)) {
    throw new Error('Invalid item fields');
  }

  return {
    id,
    name,
    type,
    gmId: ensureOptionalString(value.gmId),
    url: ensureOptionalString(value.url),
    time: ensureOptionalString(value.time),
    notes: ensureOptionalString(value.notes),
  };
};

const validateDay = (value: unknown): ItineraryDay => {
  if (!isObject(value)) {
    throw new Error('Invalid day');
  }

  const dateRaw = value.date;
  if (dateRaw !== null && typeof dateRaw !== 'string') {
    throw new Error('Invalid day date');
  }
  const date = dateRaw === null ? null : dateRaw;

  const title = ensureString(value.title);
  const notes = ensureString(value.notes);
  const itemsRaw = value.items;

  if (!Array.isArray(itemsRaw)) {
    throw new Error('Invalid day items');
  }

  return {
    date,
    title,
    notes,
    items: itemsRaw.map(validateItem),
  };
};

export function importJson(fileContent: string): Itinerary {
  const parsed = JSON.parse(fileContent) as unknown;

  if (!isObject(parsed)) {
    throw new Error('Invalid itinerary format');
  }

  if (parsed.version !== 1) {
    throw new Error('Unsupported itinerary version');
  }

  const createdAt = ensureString(parsed.createdAt).trim();
  const updatedAt = ensureString(parsed.updatedAt).trim();
  const daysRaw = parsed.days;

  if (!createdAt || !updatedAt || !Array.isArray(daysRaw)) {
    throw new Error('Invalid itinerary fields');
  }

  return {
    version: 1,
    createdAt,
    updatedAt,
    days: daysRaw.map(validateDay),
  };
}
