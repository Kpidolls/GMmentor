const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE_URL = 'https://googlementor.com';
const ENTITIES_FILE = path.join(ROOT, 'public', 'data', 'entities.json');
const OUT_PLACE_DIR = path.join(ROOT, 'out', 'place');
const SITEMAP_FILE = path.join(ROOT, 'out', 'sitemap.xml');
const SITEMAP_DIR = path.join(ROOT, 'out');
const BLOG_DIR = path.join(ROOT, 'src', 'blog');
const MAX_TITLE_LENGTH = 70;
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
const GUIDE_ENTITY_SEEDS = {
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
const GREEK_TO_LATIN = {
  'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e', 'ζ': 'z', 'η': 'i', 'ή': 'i', 'θ': 'th',
  'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'ό': 'o',
  'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'ύ': 'y', 'ϋ': 'y', 'ΰ': 'y', 'φ': 'f', 'χ': 'ch',
  'ψ': 'ps', 'ω': 'o', 'ώ': 'o', 'Α': 'a', 'Ά': 'a', 'Β': 'v', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Έ': 'e', 'Ζ': 'z',
  'Η': 'i', 'Ή': 'i', 'Θ': 'th', 'Ι': 'i', 'Ί': 'i', 'Κ': 'k', 'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o',
  'Ό': 'o', 'Π': 'p', 'Ρ': 'r', 'Σ': 's', 'Τ': 't', 'Υ': 'y', 'Ύ': 'y', 'Φ': 'f', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o', 'Ώ': 'o',
};

function fail(message) {
  console.error(`❌  ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon <= 0) continue;

    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function transliterateGreek(value) {
  return Array.from(value).map((character) => GREEK_TO_LATIN[character] || character).join('');
}

function normalizeForMatching(value) {
  return transliterateGreek(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesTerm(haystack, needle) {
  if (!needle || needle.length < 3) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(haystack);
}

function getTerms(entity) {
  const terms = new Set();
  const add = (value) => {
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

function getGuideSeeds(post) {
  return GUIDE_ENTITY_SEEDS[post.originalSlug || post.slug] || [];
}

function entityMatchesSeed(entity, seed) {
  const normalizedSeed = normalizeForMatching(seed);
  if (!normalizedSeed) return false;

  return getTerms(entity).some((term) => {
    if (term === normalizedSeed) return true;
    return matchesTerm(term, normalizedSeed) || matchesTerm(normalizedSeed, term);
  });
}

function scoreEntityMention(post, entity) {
  const title = normalizeForMatching(post.title || '');
  const summary = normalizeForMatching(post.summary || '');
  const content = normalizeForMatching(post.content || '');
  const combined = `${title} ${summary} ${content}`;

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

function getPriorityGuidePosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => /\.mdx?$/.test(file) && !file.includes('-el.'))
    .map((filename) => {
      const content = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
      const meta = parseFrontmatter(content);
      const slug = filename.replace(/\.mdx?$/, '');
      return {
        slug,
        originalSlug: slug,
        title: meta.title || slug,
        summary: meta.summary || '',
        content,
      };
    })
    .filter((post) => PRIORITY_GUIDE_SLUGS.has(post.originalSlug || post.slug));
}

function getPlaceHtmlPath(slug) {
  return path.join(OUT_PLACE_DIR, `${slug}.html`);
}

function parseSitemapPaths(xml) {
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  return new Set(urls.map((value) => {
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }));
}

function getSitemapFiles() {
  if (!fs.existsSync(SITEMAP_DIR)) {
    return [];
  }

  return fs
    .readdirSync(SITEMAP_DIR)
    .filter((name) => /^sitemap(?:-\d+)?\.xml$/.test(name))
    .map((name) => path.join(SITEMAP_DIR, name))
    .sort((left, right) => left.localeCompare(right));
}

function main() {
  if (!fs.existsSync(ENTITIES_FILE)) {
    fail(`Missing entity index: ${path.relative(ROOT, ENTITIES_FILE)}`);
  }

  if (!fs.existsSync(OUT_PLACE_DIR)) {
    fail(`Missing place export directory: ${path.relative(ROOT, OUT_PLACE_DIR)}`);
  }

  if (!fs.existsSync(SITEMAP_FILE)) {
    fail(`Missing sitemap: ${path.relative(ROOT, SITEMAP_FILE)}`);
  }

  const sitemapFiles = getSitemapFiles();
  if (!sitemapFiles.length) {
    fail('Missing sitemap files in out/ (expected sitemap.xml and/or sitemap-*.xml).');
  }

  const entitiesIndex = readJson(ENTITIES_FILE);
  const entities = Array.isArray(entitiesIndex?.entities) ? entitiesIndex.entities : [];
  const slugToCanonical = new Map();
  const expectedPaths = new Set();

  for (const entity of entities) {
    if (!entity?.slug) continue;

    expectedPaths.add(`/place/${entity.slug}`);
    slugToCanonical.set(entity.slug, entity.slug);

    for (const legacySlug of entity.legacySlugs || []) {
      if (!legacySlug) continue;
      expectedPaths.add(`/place/${legacySlug}`);
      slugToCanonical.set(legacySlug, entity.slug);
    }
  }

  const expectedCount = expectedPaths.size;
  const actualFiles = fs.readdirSync(OUT_PLACE_DIR).filter((file) => file.endsWith('.html'));

  if (actualFiles.length !== expectedCount) {
    fail(`Place page count mismatch: expected ${expectedCount}, found ${actualFiles.length}`);
  }

  const sitemapPaths = new Set();
  for (const sitemapFile of sitemapFiles) {
    const paths = parseSitemapPaths(fs.readFileSync(sitemapFile, 'utf8'));
    for (const sitemapPath of paths) {
      sitemapPaths.add(sitemapPath);
    }
  }
  const missingFromSitemap = [];
  const missingFiles = [];
  const invalidCanonical = [];
  const missingJsonLd = [];
  const longTitlePages = [];
  const linkedEntityIds = new Set();
  const priorityPosts = getPriorityGuidePosts();
  const placePathSet = new Set(expectedPaths);

  for (const post of priorityPosts) {
    for (const entity of entities) {
      if (!entity?.id) continue;
      if (scoreEntityMention(post, entity) > 0) {
        linkedEntityIds.add(entity.id);
      }
    }
  }

  for (const expectedPath of Array.from(expectedPaths).sort((a, b) => a.localeCompare(b))) {
    const requestedSlug = expectedPath.replace('/place/', '');
    const htmlPath = getPlaceHtmlPath(requestedSlug);
    const canonicalSlug = slugToCanonical.get(requestedSlug) || requestedSlug;
    const isCanonicalPath = requestedSlug === canonicalSlug;

    if (!fs.existsSync(htmlPath)) {
      missingFiles.push(expectedPath);
      continue;
    }

    // Legacy alias pages are intentionally removed from sitemap entries.
    if (isCanonicalPath && !sitemapPaths.has(expectedPath)) {
      missingFromSitemap.push(expectedPath);
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonicalHref = canonicalMatch ? canonicalMatch[1] : null;
    const expectedCanonicalPath = `/place/${canonicalSlug}`;
    const expectedCanonicalUrl = `${SITE_URL}${expectedCanonicalPath}`;

    if (!canonicalHref || canonicalHref !== expectedCanonicalUrl || !placePathSet.has(expectedCanonicalPath)) {
      invalidCanonical.push(expectedPath);
    }

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : '';
    if (!titleText || titleText.length > MAX_TITLE_LENGTH) {
      longTitlePages.push(expectedPath);
    }

    if (!html.includes('application/ld+json')) {
      missingJsonLd.push(expectedPath);
    }
  }

  if (missingFiles.length) {
    fail(`Missing exported place pages: ${missingFiles.slice(0, 10).join(', ')}${missingFiles.length > 10 ? ' ...' : ''}`);
  }

  if (missingFromSitemap.length) {
    fail(`Missing place URLs in sitemap: ${missingFromSitemap.slice(0, 10).join(', ')}${missingFromSitemap.length > 10 ? ' ...' : ''}`);
  }

  if (invalidCanonical.length) {
    fail(`Invalid canonical URLs on place pages: ${invalidCanonical.slice(0, 10).join(', ')}${invalidCanonical.length > 10 ? ' ...' : ''}`);
  }

  if (missingJsonLd.length) {
    fail(`Missing JSON-LD on place pages: ${missingJsonLd.slice(0, 10).join(', ')}${missingJsonLd.length > 10 ? ' ...' : ''}`);
  }

  if (longTitlePages.length) {
    fail(`Place pages with missing or too-long titles (> ${MAX_TITLE_LENGTH} chars): ${longTitlePages.slice(0, 10).join(', ')}${longTitlePages.length > 10 ? ' ...' : ''}`);
  }


  const orphanCount = entities.filter((entity) => !linkedEntityIds.has(entity.id)).length;
  const canonicalCount = entities.filter((entity) => Boolean(entity?.slug)).length;
  const orphanRate = canonicalCount > 0 ? (orphanCount / canonicalCount) * 100 : 0;

  console.log(`✅  Knowledge graph checks passed for ${expectedCount} place pages.`);
  console.log(`ℹ️  Graph KPI: ${linkedEntityIds.size} entities linked from priority guides, ${orphanCount} orphans (${orphanRate.toFixed(1)}%).`);
}

main();