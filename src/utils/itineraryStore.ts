/**
 * Single source of truth for the "My Route" itinerary persisted in localStorage.
 *
 * Every read/write of the `gm:itinerary:v1` key must go through this module. Previously
 * `useItinerary.ts` (via a generic `useLocalStorage` hook) and `itineraryEvents.ts` (via ad hoc
 * `JSON.parse`/`JSON.stringify` calls) both wrote to the same key independently, which could
 * silently drop or duplicate items when multiple components (e.g. the header badge and the
 * itinerary page) were mounted at once. Centralizing storage access here removes that race and
 * gives future schema changes one place to add a migration.
 */

export type ItineraryItemType = 'place' | 'area' | 'guide' | 'custom';

export type ItineraryItem = {
  id: string;
  name: string;
  type: ItineraryItemType;
  gmId?: string;
  url?: string;
  time?: string;
  notes?: string;
};

export type ItineraryDay = {
  date: string | null;
  title: string;
  notes: string;
  items: ItineraryItem[];
};

export type Itinerary = {
  version: 1;
  createdAt: string;
  updatedAt: string;
  days: ItineraryDay[];
};

export type QuickAddPayload = {
  id?: string;
  name: string;
  type?: ItineraryItemType;
  url?: string;
  notes?: string;
};

const STORAGE_KEY = 'gm:itinerary:v1';
const CURRENT_VERSION = 1 as const;

const nowIso = () => new Date().toISOString();

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createDefaultDay = (): ItineraryDay => ({ date: null, title: '', notes: '', items: [] });

export const createEmptyItinerary = (): Itinerary => {
  const timestamp = nowIso();
  return { version: CURRENT_VERSION, createdAt: timestamp, updatedAt: timestamp, days: [] };
};

const isItineraryItem = (value: unknown): value is ItineraryItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ItineraryItem).id === 'string' &&
  typeof (value as ItineraryItem).name === 'string';

const sanitizeDay = (value: unknown): ItineraryDay => {
  const day = (value && typeof value === 'object' ? value : {}) as Partial<ItineraryDay>;
  return {
    date: typeof day.date === 'string' ? day.date : null,
    title: typeof day.title === 'string' ? day.title : '',
    notes: typeof day.notes === 'string' ? day.notes : '',
    items: Array.isArray(day.items) ? day.items.filter(isItineraryItem) : [],
  };
};

/**
 * Converts any raw parsed localStorage value (an older schema version, or garbage) into the
 * current `Itinerary` shape. When the schema changes, bump `CURRENT_VERSION` and add a
 * `value.version === <old version>` branch here to transform old data instead of discarding it.
 */
const migrate = (raw: unknown): Itinerary => {
  if (!raw || typeof raw !== 'object') {
    return createEmptyItinerary();
  }

  const value = raw as Partial<Itinerary> & { version?: number };
  const timestamp = nowIso();

  return {
    version: CURRENT_VERSION,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : timestamp,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : timestamp,
    days: Array.isArray(value.days) ? value.days.map(sanitizeDay) : [],
  };
};

let snapshot: Itinerary = createEmptyItinerary();
let hydrated = false;
const listeners = new Set<() => void>();

const readFromStorage = (): Itinerary => {
  if (typeof window === 'undefined') {
    return createEmptyItinerary();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? migrate(JSON.parse(raw)) : createEmptyItinerary();
  } catch {
    return createEmptyItinerary();
  }
};

const ensureHydrated = () => {
  if (hydrated || typeof window === 'undefined') {
    return;
  }

  snapshot = readFromStorage();
  hydrated = true;
};

const notify = () => listeners.forEach((listener) => listener());

const persist = (next: Itinerary) => {
  snapshot = next;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota/serialization failures; the in-memory snapshot still updates for this tab.
    }
  }

  notify();
};

/** Returns the current in-memory itinerary snapshot, hydrating from localStorage on first access. */
export function getItinerarySnapshot(): Itinerary {
  ensureHydrated();
  return snapshot;
}

/**
 * Subscribes to itinerary changes made anywhere (this tab or another). Intended for use with
 * React's `useSyncExternalStore` so every component reads the same state.
 */
export function subscribeToItinerary(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    snapshot = event.newValue ? migrate(JSON.parse(event.newValue)) : createEmptyItinerary();
    listener();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function writeItinerary(next: Itinerary): void {
  persist({ ...next, version: CURRENT_VERSION, updatedAt: nowIso() });
}

export function updateItinerary(updater: (prev: Itinerary) => Itinerary): void {
  ensureHydrated();
  writeItinerary(updater(snapshot));
}

const appendToDayOne = (prev: Itinerary, item: ItineraryItem): Itinerary => {
  const nextDays =
    prev.days.length > 0
      ? prev.days.map((day, index) => (index === 0 ? { ...day, items: [...day.items, item] } : day))
      : [{ ...createDefaultDay(), items: [item] }];

  return { ...prev, days: nextDays };
};

/** Appends a quick-add item (from a "save to itinerary" CTA) to Day 1, creating it if needed. */
export function addItemToDayOne(payload: QuickAddPayload): void {
  const name = payload.name.trim();
  if (!name) {
    return;
  }

  const item: ItineraryItem = {
    id: createId(),
    name,
    type: payload.type || 'custom',
    gmId: payload.id,
    url: payload.url,
    notes: payload.notes,
  };

  ensureHydrated();
  writeItinerary(appendToDayOne(snapshot, item));
}

export { STORAGE_KEY };
