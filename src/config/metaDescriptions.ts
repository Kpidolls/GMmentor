export type MetaDescriptionLanguage = 'en' | 'el';

export type StaticMetaDescriptionKey =
  | 'home'
  | 'search'
  | 'store'
  | 'blog'
  | 'insurance'
  | 'airalo'
  | 'login'
  | 'signup'
  | 'terms'
  | 'privacyPolicy';

type NormalizeMetaDescriptionOptions = {
  maxLength?: number;
};

type DestinationMetaInput = {
  destinationName: string;
  summary?: string;
  language?: string;
};

type AreaMetaInput = {
  areaName: string;
  regionName?: string;
  count?: number;
  language?: string;
};

type CategoryAreaMetaInput = {
  categoryName: string;
  areaName: string;
  regionName?: string;
  count?: number;
  language?: string;
};

type PlaceMetaInput = {
  placeName: string;
  context?: string;
  typeLabel?: string;
  categoryLabel?: string;
  language?: string;
};

const DEFAULT_MAX_META_DESCRIPTION_LENGTH = 165;
const BLOG_MIN_DETAIL_LENGTH = 110;

const staticMetaDescriptions: Record<MetaDescriptionLanguage, Record<StaticMetaDescriptionKey, string>> = {
  en: {
    home: 'Googlementor helps you discover Greece with curated maps, local guides, restaurants, attractions, islands, and practical travel tools for smarter trip planning.',
    search: 'Search Googlementor\'s curated Greece maps, local restaurants, attractions, islands, and themed travel lists to find the right places faster.',
    store: 'Browse travel gear and Greece trip essentials recommended for island hopping, city walks, and practical packing before your next itinerary.',
    blog: 'Read Googlementor\'s Greece travel blog for local guides, restaurant tips, island planning advice, and map-backed ideas for Athens and beyond.',
    insurance: 'Compare travel insurance options for Greece with coverage for medical issues, cancellations, and luggage so you can plan island and city trips with confidence.',
    airalo: 'Find Airalo eSIM guidance for Greece, including mobile data setup, instant activation, and a practical travel connection option for arrivals and island transfers.',
    login: 'Sign in to your Googlementor account to access saved maps, favorites, and travel planning tools connected to your Greece trip research.',
    signup: 'Create a Googlementor account to save curated Greece maps, organize favorites, and use planning tools for restaurants, destinations, and local discoveries.',
    terms: 'Read Googlementor\'s terms and conditions covering site usage, purchases, account responsibilities, and the rules that apply when using our travel guides and tools.',
    privacyPolicy: 'Review Googlementor\'s privacy policy to understand how we handle personal data, cookies, analytics, and third-party travel services across the site.',
  },
  el: {
    home: 'Το Googlementor σας βοηθά να ανακαλύψετε την Ελλάδα με επιμελημένους χάρτες, τοπικούς οδηγούς, εστιατόρια, αξιοθέατα, νησιά και χρήσιμα ταξιδιωτικά εργαλεία.',
    search: 'Αναζητήστε στους επιμελημένους χάρτες του Googlementor για ελληνικούς προορισμούς, εστιατόρια, αξιοθέατα, νησιά και θεματικές λίστες ταξιδιού.',
    store: 'Δείτε επιλεγμένο ταξιδιωτικό εξοπλισμό και πρακτικά αξεσουάρ για island hopping, βόλτες στην πόλη και καλύτερη οργάνωση για το ταξίδι σας στην Ελλάδα.',
    blog: 'Διαβάστε το ταξιδιωτικό blog του Googlementor με τοπικούς οδηγούς, προτάσεις φαγητού, ιδέες για νησιά και άρθρα με χάρτες για Αθήνα και υπόλοιπη Ελλάδα.',
    insurance: 'Συγκρίνετε ταξιδιωτική ασφάλεια για την Ελλάδα με κάλυψη για ιατρικά περιστατικά, ακυρώσεις και αποσκευές ώστε να ταξιδεύετε με περισσότερη σιγουριά.',
    airalo: 'Βρείτε πρακτικές πληροφορίες για Airalo eSIM στην Ελλάδα, με οδηγίες για mobile data, άμεση ενεργοποίηση και εύκολη σύνδεση σε πόλεις και νησιά.',
    login: 'Συνδεθείτε στον λογαριασμό σας στο Googlementor για να δείτε αποθηκευμένους χάρτες, αγαπημένα και εργαλεία οργάνωσης για το ταξίδι σας στην Ελλάδα.',
    signup: 'Δημιουργήστε λογαριασμό στο Googlementor για να αποθηκεύετε επιμελημένους χάρτες Ελλάδας, αγαπημένα και χρήσιμα εργαλεία σχεδιασμού ταξιδιού.',
    terms: 'Διαβάστε τους όρους και τις προϋποθέσεις του Googlementor για τη χρήση της ιστοσελίδας, αγορές, λογαριασμούς και τις βασικές νομικές υποχρεώσεις.',
    privacyPolicy: 'Δείτε την πολιτική απορρήτου του Googlementor για να κατανοήσετε πώς διαχειριζόμαστε προσωπικά δεδομένα, cookies, analytics και τρίτες υπηρεσίες.',
  },
};

const blogMetaDescriptionBySlug: Record<string, string> = {
  'athens-live-greek-music-guide': 'Live Greek music in Athens guide: trusted bouzoukia and tavernas, real costs, flower traditions, and practical tips for a great night out.',
  'athens-live-greek-music-guide-el': 'Οδηγός ζωντανής ελληνικής μουσικής στην Αθήνα: αξιόπιστα μπουζούκια και ταβέρνες, πραγματικό κόστος, λουλούδια και πρακτικές συμβουλές για τη βραδιά σας.',
  'best-greek-souvenirs-athens': 'Best Greek souvenirs in Athens: authentic spices, coffee, honey, leather sandals, designer brands, and where to buy trusted local products.',
  'best-greek-souvenirs-athens-el': 'Τα καλύτερα ελληνικά σουβενίρ στην Αθήνα: αυθεντικά μπαχαρικά, καφές, μέλι, δερμάτινα σανδάλια, ελληνικές μάρκες και σημεία για ποιοτικές αγορές.',
  'tap-water-safe-greece': 'Is tap water safe in Greece? Practical guide for cities and islands, bottled water prices, and daily tips for families and sensitive travelers.',
  'tap-water-safe-greece-el': 'Είναι ασφαλές το νερό βρύσης στην Ελλάδα; Πρακτικός οδηγός για πόλεις και νησιά, τιμές εμφιαλωμένου και χρήσιμες καθημερινές συμβουλές.',
};

function trimTrailingPunctuation(text: string): string {
  return text.replace(/[\s,;:.-]+$/g, '').trim();
}

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace >= Math.floor(maxLength * 0.7)) {
    return trimTrailingPunctuation(sliced.slice(0, lastSpace));
  }

  return trimTrailingPunctuation(text.slice(0, maxLength));
}

function cleanMetaText(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[\uFFFD]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s([,.;:!?])/g, '$1')
    .trim();
}

function compactSummary(summary: string | undefined, maxLength: number): string | undefined {
  if (!summary) {
    return undefined;
  }

  const cleaned = normalizeMetaDescription(summary, { maxLength });
  if (!cleaned) {
    return undefined;
  }

  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function appendDetailIfShort(text: string, detail: string): string {
  if (text.length >= BLOG_MIN_DETAIL_LENGTH) {
    return text;
  }

  return normalizeMetaDescription(`${trimTrailingPunctuation(text)} ${detail}`);
}

export function resolveMetaDescriptionLanguage(language?: string): MetaDescriptionLanguage {
  return language?.toLowerCase().startsWith('el') ? 'el' : 'en';
}

export function normalizeMetaDescription(
  text: string,
  options: NormalizeMetaDescriptionOptions = {}
): string {
  const maxLength = options.maxLength ?? DEFAULT_MAX_META_DESCRIPTION_LENGTH;
  const cleaned = cleanMetaText(text);
  if (!cleaned) {
    return '';
  }

  const normalized = truncateAtWordBoundary(cleaned, maxLength);
  return trimTrailingPunctuation(normalized).replace(/\s+/g, ' ').trim();
}

export function getStaticMetaDescription(key: StaticMetaDescriptionKey, language?: string): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);
  return normalizeMetaDescription(staticMetaDescriptions[resolvedLanguage][key]);
}

export function buildDestinationMetaDescription({ destinationName, summary, language }: DestinationMetaInput): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);
  const shortSummary = compactSummary(summary, 72);

  if (resolvedLanguage === 'el') {
    return normalizeMetaDescription(
      `${destinationName}: ${shortSummary ?? ''} Επιμελημένοι χάρτες, τοπικά εστιατόρια, αξιοθέατα και πρακτικές ιδέες για να ανακαλύψετε αυτόν τον ελληνικό προορισμό.`
    );
  }

  return normalizeMetaDescription(
    `${destinationName}: ${shortSummary ?? ''} Explore curated maps, local restaurants, highlights, and practical tips for discovering this Greece destination.`
  );
}

export function buildAreaMetaDescription({ areaName, regionName, count, language }: AreaMetaInput): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);
  const areaContext = regionName && regionName !== areaName ? `${areaName}, ${regionName}` : areaName;
  const countText = typeof count === 'number'
    ? resolvedLanguage === 'el'
      ? `${count} επιμελημένα μέρη`
      : `${count} curated places`
    : resolvedLanguage === 'el'
      ? 'επιμελημένα μέρη'
      : 'curated places';

  if (resolvedLanguage === 'el') {
    return normalizeMetaDescription(
      `${areaContext}: ανακαλύψτε ${countText}, τοπικά εστιατόρια, οδηγούς γειτονιάς και χρήσιμες λίστες χαρτών για το ταξίδι σας στην Ελλάδα.`
    );
  }

  return normalizeMetaDescription(
    `${areaContext}: discover ${countText}, local restaurants, neighborhood guides, and curated map lists for planning your Greece trip.`
  );
}

export function buildCategoryAreaMetaDescription({
  categoryName,
  areaName,
  regionName,
  count,
  language,
}: CategoryAreaMetaInput): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);
  const areaContext = regionName && regionName !== areaName ? `${areaName}, ${regionName}` : areaName;
  const countText = typeof count === 'number'
    ? resolvedLanguage === 'el'
      ? `${count} επιλεγμένες προτάσεις`
      : `${count} curated picks`
    : resolvedLanguage === 'el'
      ? 'επιλεγμένες προτάσεις'
      : 'curated picks';

  if (resolvedLanguage === 'el') {
    return normalizeMetaDescription(
      `${categoryName} στην ${areaContext}: βρείτε ${countText}, κοντινές εναλλακτικές και χρήσιμες λίστες χαρτών για πιο στοχευμένη εξερεύνηση στην Ελλάδα.`
    );
  }

  return normalizeMetaDescription(
    `${categoryName} in ${areaContext}: discover ${countText}, nearby alternatives, and curated local map results for smarter Greece travel planning.`
  );
}

export function buildPlaceMetaDescription({
  placeName,
  context,
  typeLabel,
  categoryLabel,
  language,
}: PlaceMetaInput): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);
  const placeContext = context || (resolvedLanguage === 'el' ? 'Ελλάδα' : 'Greece');
  const subject = categoryLabel || typeLabel || (resolvedLanguage === 'el' ? 'τοπικό σημείο' : 'local place');

  if (resolvedLanguage === 'el') {
    return normalizeMetaDescription(
      `${placeName} στη ${placeContext}: δείτε πληροφορίες για ${subject}, κοντινές προτάσεις και άμεσο σύνδεσμο Google Maps μέσα από τον επιμελημένο οδηγό του Googlementor.`
    );
  }

  return normalizeMetaDescription(
    `${placeName} in ${placeContext}: explore this ${subject.toLowerCase()}, nearby picks, and a direct Google Maps link in Googlementor's curated Greece guide.`
  );
}

export function getBlogMetaDescriptionBySlug(slug: string): string | undefined {
  const description = blogMetaDescriptionBySlug[slug];
  return description ? normalizeMetaDescription(description) : undefined;
}

export function generateBlogMetaDescription(
  title: string,
  summary?: string,
  content?: string,
  language?: string
): string {
  const resolvedLanguage = resolveMetaDescriptionLanguage(language);

  if (summary) {
    const normalizedSummary = normalizeMetaDescription(summary);
    if (normalizedSummary) {
      return appendDetailIfShort(
        normalizedSummary,
        resolvedLanguage === 'el'
          ? 'Πρακτικές συμβουλές, χάρτες και τοπικό πλαίσιο για καλύτερο σχεδιασμό ταξιδιού στην Ελλάδα.'
          : 'Practical maps, local context, and planning tips for traveling in Greece.'
      );
    }
  }

  if (content) {
    const firstParagraph = content
      .replace(/^#+\s+.*/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .split(/\n\s*\n/)
      .find((paragraph) => cleanMetaText(paragraph).length > 70);

    if (firstParagraph) {
      return appendDetailIfShort(
        normalizeMetaDescription(firstParagraph),
        resolvedLanguage === 'el'
          ? 'Περισσότερες πρακτικές πληροφορίες και ιδέες για το ταξίδι σας στην Ελλάδα.'
          : 'More practical details and ideas for planning your trip to Greece.'
      );
    }
  }

  if (resolvedLanguage === 'el') {
    return normalizeMetaDescription(
      `${title}: οδηγός του Googlementor με πρακτικές συμβουλές, χάρτες και χρήσιμο τοπικό πλαίσιο για ταξίδι στην Ελλάδα.`
    );
  }

  return normalizeMetaDescription(
    `${title}: a Googlementor guide with practical tips, map-backed planning, and useful local context for traveling in Greece.`
  );
}

export const metaDescriptions = staticMetaDescriptions.en;
