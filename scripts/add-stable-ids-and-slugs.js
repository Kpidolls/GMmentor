const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const GREEK_TO_LATIN = {
  'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
  'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps',
  'ω': 'o', 'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o',
  'ϊ': 'i', 'ΐ': 'i', 'ϋ': 'y', 'ΰ': 'y',
  'Α': 'a', 'Β': 'v', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Ζ': 'z', 'Η': 'i', 'Θ': 'th',
  'Ι': 'i', 'Κ': 'k', 'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o', 'Π': 'p',
  'Ρ': 'r', 'Σ': 's', 'Τ': 't', 'Υ': 'y', 'Φ': 'f', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o',
  'Ά': 'a', 'Έ': 'e', 'Ή': 'i', 'Ί': 'i', 'Ό': 'o', 'Ύ': 'y', 'Ώ': 'o'
};

const IDENTITY_KEYS = [
  'name',
  'title',
  'question',
  'key',
  'region',
  'address',
  'url',
  'link',
  'description'
];

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function transliterate(text) {
  return Array.from(text).map((char) => GREEK_TO_LATIN[char] || char).join('');
}

function slugify(input) {
  const transliterated = transliterate(String(input || '').trim());
  return transliterated
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function firstNonEmptyString(values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function getIdentitySeed(obj, contextPath, fileBase) {
  const pieces = IDENTITY_KEYS
    .map((key) => obj[key])
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim());

  if (typeof obj.lat === 'number' || typeof obj.lat === 'string') {
    pieces.push(String(obj.lat));
  }
  if (typeof obj.lng === 'number' || typeof obj.lng === 'string') {
    pieces.push(String(obj.lng));
  }

  if (pieces.length === 0) {
    return '';
  }

  return `${fileBase}|${contextPath}|${pieces.join('|')}`;
}

function shouldEnrichObject(obj) {
  if (!obj || Array.isArray(obj) || typeof obj !== 'object') {
    return false;
  }

  if (typeof obj.id === 'string' && obj.id.trim()) {
    return true;
  }

  return IDENTITY_KEYS.some((key) => typeof obj[key] === 'string' && obj[key].trim())
    || obj.name_en
    || obj.region_en
    || obj.aliases;
}

function enrichNode(node, context, stats, seenSlugs) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => enrichNode(item, `${context}[${index}]`, stats, seenSlugs));
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  if (shouldEnrichObject(node)) {
    const seed = getIdentitySeed(node, context, stats.fileBase);
    const digest = hash(seed || `${stats.fileBase}|${context}`);

    if (!(typeof node.id === 'string' && node.id.trim())) {
      node.id = `${stats.fileBase}_${digest.slice(0, 12)}`;
      stats.idsAdded += 1;
    }

    if (!(typeof node.slug === 'string' && node.slug.trim())) {
      const sourceLabel = firstNonEmptyString([
        node.name,
        node.title,
        node.question,
        node.key,
        node.region,
        node.address,
        node.id
      ]);
      const readable = slugify(sourceLabel) || 'item';
      let slug = `${readable}-${digest.slice(0, 4)}`;

      // Prevent collisions inside each file while keeping deterministic suffixes.
      if (seenSlugs.has(slug)) {
        slug = `${readable}-${digest.slice(0, 8)}`;
      }
      seenSlugs.add(slug);
      node.slug = slug;
      stats.slugsAdded += 1;
    }
  }

  Object.entries(node).forEach(([key, value]) => {
    if (key === 'id' || key === 'slug') {
      return;
    }
    enrichNode(value, `${context}.${key}`, stats, seenSlugs);
  });
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const fileBase = path.basename(filePath, '.json');
  const stats = {
    fileBase,
    idsAdded: 0,
    slugsAdded: 0
  };

  const seenSlugs = new Set();
  enrichNode(json, '$', stats, seenSlugs);

  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  return stats;
}

function main() {
  const files = fs.readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(DATA_DIR, name))
    .sort((a, b) => a.localeCompare(b));

  let totalIds = 0;
  let totalSlugs = 0;

  files.forEach((filePath) => {
    const stats = processFile(filePath);
    totalIds += stats.idsAdded;
    totalSlugs += stats.slugsAdded;
    console.log(`${path.basename(filePath)}: +${stats.idsAdded} id, +${stats.slugsAdded} slug`);
  });

  console.log(`Done. Added ${totalIds} ids and ${totalSlugs} slugs.`);
}

main();
