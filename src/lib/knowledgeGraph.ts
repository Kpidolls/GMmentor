import { getAllPosts, type Post } from './posts';
import { loadEntitiesIndex, type EntityRecord } from './entities';

const SITE_URL = 'https://googlementor.com';

const PRIORITY_GUIDE_SLUGS = new Set([
  'acropolis-complete-guide',
  'american-college-of-greece-agia-paraskevi-guide',
  'athens-airport-to-city-guide',
  'athens-day-trips-guide',
  'athens-hop-on-hop-off-guide',
  'athens-layover-6-hours-guide',
  'athens-live-greek-music-guide',
  'best-greek-souvenirs-athens',
  'choose-perfect-greek-island',
  'greece-2026-holidays-guide',
  'greece-weather-swimming-ferry-guide',
  'greek-bakeries-brunch-coffee-guide',
  'luxury-rooftop-restaurants-athens',
  'meteora-complete-guide',
  'tap-water-safe-greece',
  'traveling-to-greece-on-a-budget',
]);

const GREEK_TO_LATIN: Record<string, string> = {
  α: 'a', ά: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', έ: 'e', ζ: 'z', η: 'i', ή: 'i', θ: 'th',
  ι: 'i', ί: 'i', ϊ: 'i', ΐ: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', ό: 'o',
  π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', ύ: 'y', ϋ: 'y', ΰ: 'y', φ: 'f', χ: 'ch',
  ψ: 'ps', ω: 'o', ώ: 'o', Α: 'a', Ά: 'a', Β: 'v', Γ: 'g', Δ: 'd', Ε: 'e', Έ: 'e', Ζ: 'z',
  Η: 'i', Ή: 'i', Θ: 'th', Ι: 'i', Ί: 'i', Κ: 'k', Λ: 'l', Μ: 'm', Ν: 'n', Ξ: 'x', Ο: 'o',
  Ό: 'o', Π: 'p', Ρ: 'r', Σ: 's', Τ: 't', Υ: 'y', Ύ: 'y', Φ: 'f', Χ: 'ch', Ψ: 'ps', Ω: 'o', Ώ: 'o',
};

let cachedPosts: Post[] | null = null;
let cachedEntities: EntityRecord[] | null = null;

function getAllCachedPosts(): Post[] {
  if (!cachedPosts) {
    cachedPosts = getAllPosts();
  }
  return cachedPosts;
}

function getAllCachedEntities(): EntityRecord[] {
  if (!cachedEntities) {
    cachedEntities = loadEntitiesIndex().entities;
  }
  return cachedEntities;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function transliterateGreek(value: string): string {
  return Array.from(value)
    .map((character) => GREEK_TO_LATIN[character] ?? character)
    .join('');
}

function normalizeForMatching(value: string): string {
  return transliterateGreek(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesTerm(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 3) return false;
  const pattern = new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`);
  return pattern.test(haystack);
}

function getTerms(entity: EntityRecord): string[] {
  const terms = new Set<string>();

  const add = (value?: string) => {
    if (!value) return;
    const normalized = normalizeForMatching(value);
    if (normalized.length >= 3) {
      terms.add(normalized);
    }
  };

  add(entity.name);
  add(transliterateGreek(entity.name));

  for (const alias of entity.aliases || []) {
    add(alias);
    add(transliterateGreek(alias));
  }

  return Array.from(terms);
}

function scoreEntityMention(post: Post, entity: EntityRecord): number {
  const title = normalizeForMatching(post.title);
  const summary = normalizeForMatching(post.summary);
  const content = normalizeForMatching(post.content);
  const combined = `${title} ${summary} ${content}`;

  let score = 0;

  for (const term of getTerms(entity)) {
    if (matchesTerm(title, term)) score += 120;
    if (matchesTerm(summary, term)) score += 80;
    if (matchesTerm(combined, term)) score += 30;
  }

  return score;
}

function isPriorityGuideSlug(slug: string): boolean {
  return PRIORITY_GUIDE_SLUGS.has(slug);
}

function getGuideSlug(post: Post): string {
  return post.originalSlug || post.slug;
}

export function isPriorityGuide(post: Post): boolean {
  return isPriorityGuideSlug(getGuideSlug(post));
}

export function getMentionedEntitiesForPost(post: Post, limit = 10): EntityRecord[] {
  if (!isPriorityGuide(post)) {
    return [];
  }

  return getAllCachedEntities()
    .map((entity) => ({ entity, score: scoreEntityMention(post, entity) }))
    .filter((match): match is { entity: EntityRecord; score: number } => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.entity.name.localeCompare(right.entity.name);
    })
    .slice(0, limit)
    .map((match) => match.entity);
}

export function getMentionedGuidesForEntity(entity: EntityRecord, limit = 8): Post[] {
  return getAllCachedPosts()
    .filter(isPriorityGuide)
    .map((post) => ({ post, score: scoreEntityMention(post, entity) }))
    .filter((match): match is { post: Post; score: number } => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return getGuideSlug(left.post).localeCompare(getGuideSlug(right.post));
    })
    .slice(0, limit)
    .map((match) => match.post);
}

export function getEntityCanonicalUrl(slug: string): string {
  return `${SITE_URL}/place/${slug}`;
}

export function getGuideCanonicalUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}