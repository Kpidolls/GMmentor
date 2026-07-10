export type AddToItineraryPayload = {
  id?: string;
  name: string;
  type?: 'place' | 'area' | 'guide' | 'custom';
  url?: string;
  notes?: string;
};

type PendingItineraryAdd = {
  eventId: string;
  payload: AddToItineraryPayload;
  createdAt: string;
};

const PENDING_ADDS_KEY = 'gm:itinerary:pending:v1';
const ITINERARY_STORAGE_KEY = 'gm:itinerary:v1';

const createEventId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readPendingAdds = (): PendingItineraryAdd[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PENDING_ADDS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is PendingItineraryAdd => {
      return (
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as PendingItineraryAdd).eventId === 'string' &&
        typeof (entry as PendingItineraryAdd).createdAt === 'string' &&
        typeof (entry as PendingItineraryAdd).payload?.name === 'string'
      );
    });
  } catch {
    return [];
  }
};

const writePendingAdds = (adds: PendingItineraryAdd[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(PENDING_ADDS_KEY, JSON.stringify(adds));
  } catch {
    // Ignore storage failures.
  }
};

const readStoredItinerary = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ITINERARY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const writeStoredItinerary = (nextItinerary: Record<string, unknown>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(nextItinerary));
  } catch {
    // Ignore storage failures.
  }
};

const appendItemToDayOne = (payload: AddToItineraryPayload): void => {
  const timestamp = new Date().toISOString();
  const current = readStoredItinerary();
  const days = Array.isArray(current?.days) ? (current.days as Array<Record<string, unknown>>) : [];

  const nextItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: payload.name.trim(),
    type: payload.type || 'custom',
    gmId: payload.id,
    url: payload.url,
    notes: payload.notes,
  };

  const nextDays = days.length > 0
    ? days.map((day, index) => {
        if (index !== 0) {
          return day;
        }

        const items = Array.isArray(day.items) ? day.items : [];
        return {
          ...day,
          items: [...items, nextItem],
        };
      })
    : [{ date: null, title: '', notes: '', items: [nextItem] }];

  writeStoredItinerary({
    ...(current || {}),
    version: 1,
    createdAt: typeof current?.createdAt === 'string' ? current.createdAt : timestamp,
    updatedAt: timestamp,
    days: nextDays,
  });
};

export function consumePendingItineraryAdds(): AddToItineraryPayload[] {
  const pending = readPendingAdds();
  if (pending.length === 0) {
    return [];
  }

  writePendingAdds([]);
  return pending.map((entry) => entry.payload).filter((payload) => Boolean(payload.name?.trim()));
}

export function acknowledgePendingItineraryAdd(eventId?: string): void {
  if (!eventId) {
    return;
  }

  const pending = readPendingAdds();
  if (pending.length === 0) {
    return;
  }

  writePendingAdds(pending.filter((entry) => entry.eventId !== eventId));
}

export function dispatchAddToItinerary(payload: AddToItineraryPayload): void {
  if (typeof window === 'undefined' || !payload.name?.trim()) {
    return;
  }

  const eventId = createEventId();
  const normalizedPayload: AddToItineraryPayload = {
    id: payload.id,
    name: payload.name.trim(),
    type: payload.type || 'custom',
    url: payload.url,
    notes: payload.notes,
  };

  appendItemToDayOne(normalizedPayload);

  // Keep the pending queue only as a fallback for older flows; the storage write above is the source of truth.
  const pending = readPendingAdds();
  pending.push({
    eventId,
    payload: normalizedPayload,
    createdAt: new Date().toISOString(),
  });
  writePendingAdds(pending);

  window.dispatchEvent(
    new CustomEvent('gm:addToItinerary', {
      detail: {
        ...normalizedPayload,
        eventId,
      },
    })
  );
}
