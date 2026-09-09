import { useCallback, useSyncExternalStore } from 'react';
import {
  addItemToDayOne,
  createDefaultDay,
  createEmptyItinerary,
  createId,
  getItinerarySnapshot,
  Itinerary,
  ItineraryDay,
  ItineraryItem,
  ItineraryItemType,
  subscribeToItinerary,
  updateItinerary,
  writeItinerary,
} from '../../utils/itineraryStore';

// Re-exported so existing imports from './useItinerary' keep working.
export type { Itinerary, ItineraryDay, ItineraryItem, ItineraryItemType };
export { addItemToDayOne, createEmptyItinerary };

export function useItinerary() {
  const itinerary = useSyncExternalStore(subscribeToItinerary, getItinerarySnapshot, createEmptyItinerary);

  const addDay = useCallback(() => {
    updateItinerary((prev) => ({ ...prev, days: [...prev.days, createDefaultDay()] }));
  }, []);

  const updateDay = useCallback((dayIndex: number, updates: Partial<ItineraryDay>) => {
    updateItinerary((prev) => {
      if (!prev.days[dayIndex]) {
        return prev;
      }

      return {
        ...prev,
        days: prev.days.map((day, index) => (index === dayIndex ? { ...day, ...updates } : day)),
      };
    });
  }, []);

  const deleteDay = useCallback((dayIndex: number) => {
    updateItinerary((prev) => {
      if (!prev.days[dayIndex]) {
        return prev;
      }

      return { ...prev, days: prev.days.filter((_, index) => index !== dayIndex) };
    });
  }, []);

  const addItem = useCallback((dayIndex: number, item: Omit<ItineraryItem, 'id'> & { id?: string }) => {
    updateItinerary((prev) => {
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

      return {
        ...prev,
        days: prev.days.map((day, index) =>
          index === dayIndex ? { ...day, items: [...day.items, nextItem] } : day
        ),
      };
    });
  }, []);

  const updateItem = useCallback((dayIndex: number, itemId: string, updates: Partial<ItineraryItem>) => {
    updateItinerary((prev) => {
      if (!prev.days[dayIndex]) {
        return prev;
      }

      return {
        ...prev,
        days: prev.days.map((day, index) =>
          index === dayIndex
            ? { ...day, items: day.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)) }
            : day
        ),
      };
    });
  }, []);

  const deleteItem = useCallback((dayIndex: number, itemId: string) => {
    updateItinerary((prev) => {
      if (!prev.days[dayIndex]) {
        return prev;
      }

      return {
        ...prev,
        days: prev.days.map((day, index) =>
          index === dayIndex ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day
        ),
      };
    });
  }, []);

  const moveItemToDay = useCallback((fromDayIndex: number, itemId: string, toDayIndex: number) => {
    updateItinerary((prev) => {
      if (!prev.days[fromDayIndex] || !prev.days[toDayIndex] || fromDayIndex === toDayIndex) {
        return prev;
      }

      const itemToMove = prev.days[fromDayIndex].items.find((item) => item.id === itemId);
      if (!itemToMove) {
        return prev;
      }

      return {
        ...prev,
        days: prev.days.map((day, index) => {
          if (index === fromDayIndex) {
            return { ...day, items: day.items.filter((item) => item.id !== itemId) };
          }

          if (index === toDayIndex) {
            return { ...day, items: [...day.items, itemToMove] };
          }

          return day;
        }),
      };
    });
  }, []);

  const resetItinerary = useCallback(() => {
    writeItinerary(createEmptyItinerary());
  }, []);

  const replaceItinerary = useCallback((nextItinerary: Itinerary) => {
    writeItinerary({ ...nextItinerary, version: 1 });
  }, []);

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
