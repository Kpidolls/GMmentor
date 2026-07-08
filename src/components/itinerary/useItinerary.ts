import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

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

type AddToItineraryEventDetail = {
  eventId?: string;
  id?: string;
  name?: string;
  type?: ItineraryItemType;
  url?: string;
  notes?: string;
};

const STORAGE_KEY = 'gm:itinerary:v1';

const nowIso = () => new Date().toISOString();

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createEmptyItinerary = (): Itinerary => {
  const timestamp = nowIso();
  return {
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    days: [],
  };
};

const createDefaultDay = (): ItineraryDay => ({
  date: null,
  title: '',
  notes: '',
  items: [],
});

const appendToDayOne = (prev: Itinerary, item: ItineraryItem): Itinerary => {
  const hasDayOne = prev.days.length > 0;
  const nextDays = hasDayOne
    ? prev.days.map((day, index) => (index === 0 ? { ...day, items: [...day.items, item] } : day))
    : [{ ...createDefaultDay(), items: [item] }];

  return {
    ...prev,
    updatedAt: nowIso(),
    days: nextDays,
  };
};

const toItineraryItem = (detail: {
  id?: string;
  name: string;
  type?: ItineraryItemType;
  url?: string;
  notes?: string;
}): ItineraryItem => ({
  // Always generate a unique internal id to avoid duplicate React keys
  // when the same location is added multiple times from external CTAs.
  id: createId(),
  name: detail.name,
  type: detail.type || 'custom',
  gmId: detail.id,
  url: detail.url,
  notes: detail.notes,
});

export function useItinerary() {
  const [itinerary, setItinerary] = useLocalStorage<Itinerary>(STORAGE_KEY, createEmptyItinerary());

  const addDay = useCallback(() => {
    setItinerary((prev) => ({
      ...prev,
      updatedAt: nowIso(),
      days: [...prev.days, createDefaultDay()],
    }));
  }, [setItinerary]);

  const updateDay = useCallback(
    (dayIndex: number, updates: Partial<ItineraryDay>) => {
      setItinerary((prev) => {
        if (!prev.days[dayIndex]) {
          return prev;
        }

        const nextDays = prev.days.map((day, index) => (index === dayIndex ? { ...day, ...updates } : day));
        return {
          ...prev,
          updatedAt: nowIso(),
          days: nextDays,
        };
      });
    },
    [setItinerary]
  );

  const deleteDay = useCallback(
    (dayIndex: number) => {
      setItinerary((prev) => {
        if (!prev.days[dayIndex]) {
          return prev;
        }

        return {
          ...prev,
          updatedAt: nowIso(),
          days: prev.days.filter((_, index) => index !== dayIndex),
        };
      });
    },
    [setItinerary]
  );

  const addItem = useCallback(
    (dayIndex: number, item: Omit<ItineraryItem, 'id'> & { id?: string }) => {
      setItinerary((prev) => {
        if (!prev.days[dayIndex]) {
          return prev;
        }

        const nextItem: ItineraryItem = {
          id: item.id || createId(),
          name: item.name,
          type: item.type,
          gmId: item.gmId,
          url: item.url,
          time: item.time,
          notes: item.notes,
        };

        const nextDays = prev.days.map((day, index) =>
          index === dayIndex ? { ...day, items: [...day.items, nextItem] } : day
        );

        return {
          ...prev,
          updatedAt: nowIso(),
          days: nextDays,
        };
      });
    },
    [setItinerary]
  );

  const updateItem = useCallback(
    (dayIndex: number, itemId: string, updates: Partial<ItineraryItem>) => {
      setItinerary((prev) => {
        if (!prev.days[dayIndex]) {
          return prev;
        }

        const nextDays = prev.days.map((day, index) => {
          if (index !== dayIndex) {
            return day;
          }

          return {
            ...day,
            items: day.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
          };
        });

        return {
          ...prev,
          updatedAt: nowIso(),
          days: nextDays,
        };
      });
    },
    [setItinerary]
  );

  const deleteItem = useCallback(
    (dayIndex: number, itemId: string) => {
      setItinerary((prev) => {
        if (!prev.days[dayIndex]) {
          return prev;
        }

        const nextDays = prev.days.map((day, index) =>
          index === dayIndex ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day
        );

        return {
          ...prev,
          updatedAt: nowIso(),
          days: nextDays,
        };
      });
    },
    [setItinerary]
  );

  const moveItemToDay = useCallback(
    (fromDayIndex: number, itemId: string, toDayIndex: number) => {
      setItinerary((prev) => {
        if (!prev.days[fromDayIndex] || !prev.days[toDayIndex] || fromDayIndex === toDayIndex) {
          return prev;
        }

        const sourceDay = prev.days[fromDayIndex];
        const itemToMove = sourceDay.items.find((item) => item.id === itemId);
        if (!itemToMove) {
          return prev;
        }

        const nextDays = prev.days.map((day, index) => {
          if (index === fromDayIndex) {
            return {
              ...day,
              items: day.items.filter((item) => item.id !== itemId),
            };
          }

          if (index === toDayIndex) {
            return {
              ...day,
              items: [...day.items, itemToMove],
            };
          }

          return day;
        });

        return {
          ...prev,
          updatedAt: nowIso(),
          days: nextDays,
        };
      });
    },
    [setItinerary]
  );

  const resetItinerary = useCallback(() => {
    setItinerary(createEmptyItinerary());
  }, [setItinerary]);

  const replaceItinerary = useCallback(
    (nextItinerary: Itinerary) => {
      setItinerary({
        ...nextItinerary,
        version: 1,
        updatedAt: nowIso(),
      });
    },
    [setItinerary]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onAddToItinerary = (event: Event) => {
      const customEvent = event as CustomEvent<AddToItineraryEventDetail>;
      const detail = customEvent.detail || {};
      const name = (detail.name || '').trim();
      if (!name) {
        return;
      }
      setItinerary((prev) => {
        return appendToDayOne(
          prev,
          toItineraryItem({
            id: detail.id,
            name,
            type: detail.type,
            url: detail.url,
            notes: detail.notes,
          })
        );
      });
    };

    window.addEventListener('gm:addToItinerary', onAddToItinerary as EventListener);
    return () => window.removeEventListener('gm:addToItinerary', onAddToItinerary as EventListener);
  }, [setItinerary]);

  return {
    itinerary,
    addDay,
    updateDay,
    deleteDay,
    addItem,
    updateItem,
    deleteItem,
    moveItemToDay,
    resetItinerary,
    replaceItinerary,
  };
}
