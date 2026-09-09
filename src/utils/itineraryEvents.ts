import { addItemToDayOne } from './itineraryStore';

export type AddToItineraryPayload = {
  id?: string;
  name: string;
  type?: 'place' | 'area' | 'guide' | 'custom';
  url?: string;
  notes?: string;
};

const createEventId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Saves an item to the itinerary (via the single `itineraryStore` writer) and broadcasts a
 * `gm:addToItinerary` window event purely for UI notifications (e.g. the toast in
 * `AddToItineraryNotifier`). All persistence goes through `itineraryStore`; nothing else should
 * read/write the `gm:itinerary:v1` localStorage key directly.
 */
export function dispatchAddToItinerary(payload: AddToItineraryPayload): void {
  if (typeof window === 'undefined' || !payload.name?.trim()) {
    return;
  }

  const normalizedPayload: AddToItineraryPayload = {
    id: payload.id,
    name: payload.name.trim(),
    type: payload.type || 'custom',
    url: payload.url,
    notes: payload.notes,
  };

  addItemToDayOne(normalizedPayload);

  window.dispatchEvent(
    new CustomEvent('gm:addToItinerary', {
      detail: {
        ...normalizedPayload,
        eventId: createEventId(),
      },
    })
  );
}

