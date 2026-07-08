import i18n from '../../i18n';
import { Itinerary } from './useItinerary';

export function exportJson(itinerary: Itinerary): string {
  return JSON.stringify(itinerary, null, 2);
}

const TYPE_LABELS: Record<string, string> = {
  place: 'Place',
  area: 'Area',
  guide: 'Guide',
  custom: 'Custom',
};

const GREEK_TYPE_LABELS: Record<string, string> = {
  place: 'Τοποθεσία',
  area: 'Περιοχή',
  guide: 'Οδηγός',
  custom: 'Προσαρμοσμένο',
};

const isGreekLanguage = (language?: string): boolean => String(language || '').toLowerCase().startsWith('el');

const getExportCopy = (language = i18n.language) => {
  const greek = isGreekLanguage(language);

  return {
    title: greek ? 'ΤΟ ΠΡΟΓΡΑΜΜΑ ΜΟΥ ΣΤΗΝ ΕΛΛΑΔΑ' : 'MY GREECE ITINERARY',
    created: greek ? 'Δημιουργήθηκε:' : 'Created:',
    updated: greek ? 'Τελευταία ενημέρωση:' : 'Last Updated:',
    day: greek ? 'ΗΜΕΡΑ' : 'DAY',
    noItems: greek ? 'Δεν έχουν προστεθεί ακόμη σημεία.' : 'No items added yet.',
    summary: greek ? 'Σύνοψη:' : 'Summary:',
    notes: greek ? 'Σημειώσεις:' : 'Notes:',
    places: greek ? 'Μέρη & Δραστηριότητες:' : 'Places & Activities:',
    type: greek ? 'Τύπος:' : 'Type:',
    time: greek ? 'Ώρα:' : 'Time:',
    map: greek ? 'Χάρτης:' : 'Map:',
    itemNotes: greek ? 'Σημειώσεις:' : 'Notes:',
    tips: greek ? 'Συμβουλές:' : 'Tips:',
    tripEnd: greek ? 'Καλό ταξίδι!' : 'Have a great trip!',
    groupNearby: greek ? 'Ομαδοποιήστε κοντινά σημεία.' : 'Group nearby locations together.',
    checkHours: greek ? 'Ελέγξτε το ωράριο πριν την επίσκεψη.' : 'Check opening hours before visiting.',
    museumTip: greek
      ? 'Συμβουλή: Κλείστε εισιτήρια για τα μουσεία online και ελέγξτε την τελευταία ώρα εισόδου.'
      : 'Tip: Book museum tickets online and check the last entry time.',
    diningTip: greek
      ? 'Συμβουλή: Κάντε κράτηση σε δημοφιλή εστιατόρια, ειδικά για βράδια Σαββατοκύριακου.'
      : 'Tip: Reserve popular dining spots in advance, especially for weekend evenings.',
    beachTip: greek
      ? 'Συμβουλή: Πάρτε αντηλιακό και νερό και ελέγξτε τον καιρό ή τα δρομολόγια των πλοίων πριν φύγετε.'
      : 'Tip: Carry sun protection and water, and check ferry or wind conditions before departure.',
    hikeTip: greek
      ? 'Συμβουλή: Φορέστε κατάλληλα παπούτσια και πάρτε αρκετό νερό για διαδρομές στη φύση.'
      : 'Tip: Wear proper walking shoes and bring enough water for outdoor routes.',
    busyDayTip: greek
      ? 'Συμβουλή: Σκεφτείτε να χωρίσετε αυτή την ημέρα σε δύο πιο ελαφριές ημέρες.'
      : 'Tip: Consider splitting this day into two lighter days.',
    religiousTip: greek
      ? 'Συμβουλή: Ντυθείτε σεμνά όταν επισκέπτεστε μοναστήρια και εκκλησίες.'
      : 'Tip: Dress modestly when visiting monasteries and churches.',
    religiousSite: greek ? 'Θρησκευτικός χώρος' : 'Religious Site',
    museum: greek ? 'Μουσείο' : 'Museum',
    daySummaryStop: greek ? 'στάση' : 'stop',
    daySummaryStops: greek ? 'στάσεις' : 'stops',
    daySummaryPlanned: greek ? 'προγραμματισμένη' : 'planned',
    daySummaryPlannedPlural: greek ? 'προγραμματισμένες' : 'planned',
    dateLocale: greek ? 'el-GR' : 'en-GB',
  };
};

const toItemText = (item: { name: string; notes?: string; url?: string }): string =>
  `${item.name} ${item.notes || ''} ${item.url || ''}`.toLowerCase();

const toDisplayDate = (value: string | null, language = i18n.language): string => {
  if (!value) {
    return '';
  }

  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(getExportCopy(language).dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
};

// Heuristic keyword check to detect religious-focused stops for context-aware tips.
const isReligiousItem = (item: { name: string; notes?: string; url?: string }): boolean => {
  const text = toItemText(item);
  const religiousMarkers = [
    'church',
    'monastery',
    'cathedral',
    'chapel',
    'basilica',
    'εκκλησ',
    'μοναστ',
    'ναος',
    'μητροπολ',
  ];

  return religiousMarkers.some((marker) => text.includes(marker));
};

const hasAnyMarker = (items: Array<{ name: string; notes?: string; url?: string }>, markers: string[]): boolean => {
  return items.some((item) => {
    const text = toItemText(item);
    return markers.some((marker) => text.includes(marker));
  });
};

const toDisplayType = (item: { type: string; name: string }, language = i18n.language): string => {
  const copy = getExportCopy(language);
  const name = item.name.toLowerCase();
  if (name.includes('museum') || name.includes('μουσει')) {
    return copy.museum;
  }

  if (isReligiousItem({ name: item.name })) {
    return copy.religiousSite;
  }

  return isGreekLanguage(language) ? (GREEK_TYPE_LABELS[item.type] || 'Προσαρμοσμένο') : (TYPE_LABELS[item.type] || 'Custom');
};

const buildDaySummary = (items: Array<{ type: string }>, language = i18n.language): string => {
  const copy = getExportCopy(language);
  const count = items.length;
  const byType = items.reduce<Record<string, number>>((acc, item) => {
    const key = isGreekLanguage(language)
      ? GREEK_TYPE_LABELS[item.type] || 'Προσαρμοσμένο'
      : TYPE_LABELS[item.type] || 'Custom';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const typeSummary = Object.entries(byType)
    .map(([type, total]) => {
      if (isGreekLanguage(language)) {
        return `${total} ${type}`;
      }

      return `${total} ${type.toLowerCase()}${total > 1 ? 's' : ''}`;
    })
    .join(', ');

  if (isGreekLanguage(language)) {
    const stopWord = count === 1 ? copy.daySummaryStop : copy.daySummaryStops;
    const plannedWord = count === 1 ? copy.daySummaryPlanned : copy.daySummaryPlannedPlural;
    return `${count} ${stopWord} ${plannedWord}${typeSummary ? `: ${typeSummary}.` : '.'}`;
  }

  return `${count} stop${count > 1 ? 's' : ''} planned${typeSummary ? `: ${typeSummary}.` : '.'}`;
};

// Keep tip generation deterministic so any itinerary can export a stable readable plan.
const buildDayTips = (items: Array<{ name: string; notes?: string; url?: string }>, language = i18n.language): string[] => {
  const copy = getExportCopy(language);
  const tips = [copy.groupNearby, copy.checkHours];

  if (hasAnyMarker(items, ['museum', 'μουσει'])) {
    tips.push(copy.museumTip);
  }

  if (hasAnyMarker(items, ['restaurant', 'taverna', 'food', 'dining', 'bar', 'wine', 'ταβερ', 'εστιατορ'])) {
    tips.push(copy.diningTip);
  }

  if (hasAnyMarker(items, ['beach', 'coast', 'island', 'marina', 'boat', 'ferry', 'παραλι', 'νησ', 'λιμαν'])) {
    tips.push(copy.beachTip);
  }

  if (hasAnyMarker(items, ['hike', 'trail', 'mount', 'hill', 'πεζοπορ', 'μονοπατ'])) {
    tips.push(copy.hikeTip);
  }

  if (items.length > 5) {
    tips.push(copy.busyDayTip);
  }

  if (items.length > 0 && items.every((item) => isReligiousItem(item))) {
    tips.push(copy.religiousTip);
  }

  return tips;
};

export function exportReadableTxt(itinerary: Itinerary, language = i18n.language): string {
  const copy = getExportCopy(language);
  const lines: string[] = [];
  const finalTips = new Set<string>();
  lines.push(copy.title);
  lines.push(`${copy.created} ${itinerary.createdAt}`);
  lines.push(`${copy.updated} ${itinerary.updatedAt}`);
  lines.push('');

  if (itinerary.days.length === 0) {
    lines.push(`${copy.day} 1`);
    lines.push(copy.noItems);
    lines.push('');
    lines.push(copy.tripEnd);
    return lines.join('\n');
  }

  itinerary.days.forEach((day, dayIndex) => {
    const dayTitle = day.title?.trim();
    const headingTitle = dayTitle ? ` - ${dayTitle.toUpperCase()}` : '';
    const formattedDate = toDisplayDate(day.date, language);
    const headingDate = formattedDate ? ` (${formattedDate})` : '';
    lines.push(`${copy.day} ${dayIndex + 1}${headingTitle}${headingDate}`);

    if (day.items.length === 0) {
      lines.push(copy.noItems);
      lines.push('');
      return;
    }

    buildDayTips(day.items, language).forEach((tip) => {
      finalTips.add(tip);
    });

    lines.push(`${copy.summary} ${buildDaySummary(day.items, language)}`);
    if (day.notes?.trim()) {
      lines.push(`${copy.notes} ${day.notes.trim()}`);
    }
    lines.push('');
    lines.push(copy.places);

    day.items.forEach((item, itemIndex) => {
      lines.push(`  ${itemIndex + 1}. ${item.name}`);
      lines.push(`     ${copy.type} ${toDisplayType(item, language)}`);
      if (item.time?.trim()) {
        lines.push(`     ${copy.time} ${item.time.trim()}`);
      }
      if (item.url?.trim()) {
        lines.push(`     ${copy.map} ${item.url.trim()}`);
      }
      if (item.notes?.trim()) {
        lines.push(`     ${copy.itemNotes} ${item.notes.trim()}`);
      }
      lines.push('');
    });
    lines.push('');
  });

  if (finalTips.size > 0) {
    lines.push(copy.tips);
    Array.from(finalTips).forEach((tip) => {
      lines.push(`  - ${tip}`);
    });
    lines.push('');
  }

  lines.push(copy.tripEnd);
  return lines.join('\n');
}

export function exportTxt(itinerary: Itinerary, language = i18n.language): string {
  return exportReadableTxt(itinerary, language);
}
