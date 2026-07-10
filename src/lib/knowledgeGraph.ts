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

const GUIDE_ENTITY_SEEDS: Record<string, string[]> = {
  'acropolis-complete-guide': ['acropolis', 'acropolis museum', 'parthenon', 'plaka', 'monastiraki', 'ancient agora', 'odeon of herodes atticus'],
  'athens-airport-to-city-guide': ['athens international airport', 'syntagma', 'monastiraki', 'piraeus', 'acropoli'],
  'athens-day-trips-guide': ['meteora', 'delphi', 'nafplio', 'aegina', 'epidaurus', 'mycenae'],
  'athens-hop-on-hop-off-guide': ['acropolis', 'syntagma', 'monastiraki', 'plaka', 'panathenaic stadium', 'lycabettus'],
  'athens-layover-6-hours-guide': ['athens international airport', 'acropolis', 'plaka', 'syntagma', 'monastiraki'],
  'athens-live-greek-music-guide': ['psyrri', 'plaka', 'gkazi', 'monastiraki', 'thiseio'],
  'best-greek-souvenirs-athens': ['monastiraki', 'plaka', 'syntagma', 'ermou', 'kolonaki'],
  'choose-perfect-greek-island': ['santorini', 'mykonos', 'paros', 'naxos', 'milos', 'crete', 'corfu'],
  'greece-weather-swimming-ferry-guide': ['santorini', 'mykonos', 'paros', 'naxos', 'crete', 'rhodes', 'piraeus'],
  'greek-bakeries-brunch-coffee-guide': ['psyrri', 'kolonaki', 'pangrati', 'thessaloniki', 'chania', 'santorini', 'mykonos'],
  'luxury-rooftop-restaurants-athens': ['syntagma', 'acropolis', 'monastiraki', 'kolonaki', 'lycabettus'],
  'meteora-complete-guide': ['meteora', 'kalampaka', 'trikala'],
  'tap-water-safe-greece': ['athens', 'thessaloniki', 'santorini', 'mykonos', 'crete', 'rhodes'],
  'traveling-to-greece-on-a-budget': ['athens', 'thessaloniki', 'piraeus', 'crete', 'naxos', 'paros'],
};

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
let cachedPriorityPosts: Post[] | null = null;
const entityTermsCache = new Map<string, string[]>();
const mentionedGuidesCache = new Map<string, Post[]>();
const normalizedPostCache = new Map<string, { title: string; summary: string; combined: string }>();
const guideTargetIdSetCache = new Map<string, Set<string>>();

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

function getPriorityCachedPosts(): Post[] {
  if (!cachedPriorityPosts) {
    cachedPriorityPosts = getAllCachedPosts().filter(isPriorityGuide);
  }
  return cachedPriorityPosts;
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
  const cached = entityTermsCache.get(entity.id);
  if (cached) {
    return cached;
  }

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

  const resolved = Array.from(terms);
  entityTermsCache.set(entity.id, resolved);
  return resolved;
}

function getGuideSeeds(post: Post): string[] {
  return GUIDE_ENTITY_SEEDS[getGuideSlug(post)] || [];
}

function getGuideTargetEntityIds(post: Post): string[] {
  return Array.isArray(post.entity_targets) ? post.entity_targets : [];
}

function getGuideTargetEntityIdSet(post: Post): Set<string> {
  const cacheKey = post.slug;
  const cached = guideTargetIdSetCache.get(cacheKey);
  if (cached) return cached;

  const idSet = new Set(getGuideTargetEntityIds(post));
  guideTargetIdSetCache.set(cacheKey, idSet);
  return idSet;
}

function getNormalizedPostParts(post: Post): { title: string; summary: string; combined: string } {
  const cacheKey = post.slug;
  const cached = normalizedPostCache.get(cacheKey);
  if (cached) return cached;

  const title = normalizeForMatching(post.title);
  const summary = normalizeForMatching(post.summary);
  const content = normalizeForMatching(post.content);
  const resolved = {
    title,
    summary,
    combined: `${title} ${summary} ${content}`,
  };

  normalizedPostCache.set(cacheKey, resolved);
  return resolved;
}

function getTargetedEntitiesForGuide(post: Post, entities: EntityRecord[], limit: number): EntityRecord[] {
  const ids = getGuideTargetEntityIds(post);
  if (!ids.length) {
    return [];
  }

  const byId = new Map<string, EntityRecord>(entities.map((entity) => [entity.id, entity]));
  const targeted: EntityRecord[] = [];

  for (const id of ids) {
    const entity = byId.get(id);
    if (!entity) continue;
    targeted.push(entity);
    if (targeted.length >= limit) break;
  }

  return targeted;
}

function entityMatchesSeed(entity: EntityRecord, seed: string): boolean {
  const normalizedSeed = normalizeForMatching(seed);
  if (!normalizedSeed) return false;

  return getTerms(entity).some((term) => {
    if (term === normalizedSeed) return true;
    return matchesTerm(term, normalizedSeed) || matchesTerm(normalizedSeed, term);
  });
}

function getSeededEntitiesForGuide(post: Post, entities: EntityRecord[], limit: number): EntityRecord[] {
  const seeds = getGuideSeeds(post);
  if (!seeds.length) return [];

  const picked = new Map<string, EntityRecord>();

  for (const seed of seeds) {
    const candidates = entities
      .filter((entity) => entityMatchesSeed(entity, seed))
      .sort((left, right) => {
        const leftName = normalizeForMatching(left.name);
        const rightName = normalizeForMatching(right.name);
        const normalizedSeed = normalizeForMatching(seed);
        const leftExact = leftName === normalizedSeed ? 1 : 0;
        const rightExact = rightName === normalizedSeed ? 1 : 0;
        if (rightExact !== leftExact) return rightExact - leftExact;
        return left.name.localeCompare(right.name);
      });

    for (const candidate of candidates) {
      picked.set(candidate.id, candidate);
      if (picked.size >= limit) {
        return Array.from(picked.values());
      }
    }
  }

  return Array.from(picked.values());
}

function scoreEntityMention(post: Post, entity: EntityRecord): number {
  const { title, summary, combined } = getNormalizedPostParts(post);

  let score = 0;

  for (const term of getTerms(entity)) {
    if (matchesTerm(title, term)) score += 120;
    if (matchesTerm(summary, term)) score += 80;
    if (matchesTerm(combined, term)) score += 30;
  }

  const seedBoost = getGuideSeeds(post).some((seed) => entityMatchesSeed(entity, seed));
  if (seedBoost) {
    score += 250;
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

  const entities = getAllCachedEntities();
  const targeted = getTargetedEntitiesForGuide(post, entities, limit);

  if (targeted.length >= limit) {
    return targeted.slice(0, limit);
  }

  const seeded = getSeededEntitiesForGuide(post, entities, limit);

  if (targeted.length + seeded.length >= limit) {
    const combined = new Map<string, EntityRecord>();
    for (const entity of targeted) {
      combined.set(entity.id, entity);
    }
    for (const entity of seeded) {
      combined.set(entity.id, entity);
      if (combined.size >= limit) break;
    }
    return Array.from(combined.values()).slice(0, limit);
  }

  const scored = entities
    .map((entity) => ({ entity, score: scoreEntityMention(post, entity) }))
    .filter((match): match is { entity: EntityRecord; score: number } => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.entity.name.localeCompare(right.entity.name);
    })
    .map((match) => match.entity);

  const combined = new Map<string, EntityRecord>();
  for (const entity of targeted) {
    combined.set(entity.id, entity);
  }
  for (const entity of seeded) {
    combined.set(entity.id, entity);
  }
  for (const entity of scored) {
    combined.set(entity.id, entity);
    if (combined.size >= limit) break;
  }

  return Array.from(combined.values()).slice(0, limit);
}

export function getMentionedGuidesForEntity(entity: EntityRecord, limit = 8): Post[] {
  const cached = mentionedGuidesCache.get(entity.id);
  if (cached) {
    return cached.slice(0, limit);
  }

  const ranked = getPriorityCachedPosts()
    .map((post) => {
      const explicitTarget = getGuideTargetEntityIdSet(post).has(entity.id);
      const score = scoreEntityMention(post, entity) + (explicitTarget ? 10000 : 0);
      return { post, score };
    })
    .filter((match): match is { post: Post; score: number } => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return getGuideSlug(left.post).localeCompare(getGuideSlug(right.post));
    })
    .map((match) => match.post);

  mentionedGuidesCache.set(entity.id, ranked);
  return ranked.slice(0, limit);
}

export function getEntityCanonicalUrl(slug: string): string {
  return `${SITE_URL}/place/${slug}`;
}

export function getGuideCanonicalUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}