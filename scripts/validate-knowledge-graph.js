const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE_URL = 'https://googlementor.com';
const ENTITIES_FILE = path.join(ROOT, 'public', 'data', 'entities.json');
const OUT_PLACE_DIR = path.join(ROOT, 'out', 'place');
const SITEMAP_FILE = path.join(ROOT, 'out', 'sitemap.xml');
const SITEMAP_SHARD_FILE = path.join(ROOT, 'out', 'sitemap-0.xml');

function fail(message) {
  console.error(`❌  ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

  if (!fs.existsSync(SITEMAP_SHARD_FILE)) {
    fail(`Missing sitemap shard: ${path.relative(ROOT, SITEMAP_SHARD_FILE)}`);
  }

  const entitiesIndex = readJson(ENTITIES_FILE);
  const entities = Array.isArray(entitiesIndex?.entities) ? entitiesIndex.entities : [];
  const expectedCount = entities.length;
  const actualFiles = fs.readdirSync(OUT_PLACE_DIR).filter((file) => file.endsWith('.html'));

  if (actualFiles.length !== expectedCount) {
    fail(`Place page count mismatch: expected ${expectedCount}, found ${actualFiles.length}`);
  }

  const sitemapPaths = parseSitemapPaths(fs.readFileSync(SITEMAP_FILE, 'utf8'));
  const missingFromSitemap = [];
  const missingFiles = [];
  const invalidCanonical = [];
  const missingJsonLd = [];

  for (const entity of entities) {
    if (!entity?.slug) continue;

    const expectedPath = `/place/${entity.slug}`;
    const htmlPath = getPlaceHtmlPath(entity.slug);

    if (!fs.existsSync(htmlPath)) {
      missingFiles.push(expectedPath);
      continue;
    }

    if (!sitemapPaths.has(expectedPath)) {
      missingFromSitemap.push(expectedPath);
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const canonicalSnippet = `<link rel="canonical" href="${SITE_URL}${expectedPath}"`;

    if (!html.includes(canonicalSnippet)) {
      invalidCanonical.push(expectedPath);
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

  console.log(`✅  Knowledge graph checks passed for ${expectedCount} place pages.`);
}

main();