const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const SITE_ORIGIN = 'https://googlementor.com';

const LLMS_FILE = path.join(ROOT_DIR, 'public', 'llms.txt');
const LLMS_FULL_FILE = path.join(ROOT_DIR, 'public', 'llms-full.txt');
const ENTITIES_FILE = path.join(ROOT_DIR, 'public', 'data', 'entities.json');

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseKeyValueLines(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const separatorIndex = line.indexOf(':');
    if (separatorIndex <= 0) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    result[key] = value;
  }
  return result;
}

function validateCanonicalUrl(value, key) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid URL in ${key}: ${value}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`URL must be https in ${key}: ${value}`);
  }

  if (`${parsed.origin}` !== SITE_ORIGIN) {
    throw new Error(`URL must use canonical origin ${SITE_ORIGIN} in ${key}: ${value}`);
  }
}

function validateSchemaVersion(value, source) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid schema_version in ${source}: ${value}`);
  }
}

function validateLanguageCoverage(value, source) {
  const normalized = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!normalized.includes('el') || !normalized.includes('en')) {
    throw new Error(`language_coverage in ${source} must include el and en`);
  }
}

function validateLlmsFiles() {
  ensureFileExists(LLMS_FILE);
  ensureFileExists(LLMS_FULL_FILE);
  ensureFileExists(ENTITIES_FILE);

  const llms = parseKeyValueLines(readText(LLMS_FILE));
  const llmsFull = parseKeyValueLines(readText(LLMS_FULL_FILE));

  const llmsRequiredKeys = [
    'canonical_site',
    'canonical_llms',
    'llms_full',
    'entities_index',
    'schema_version',
    'language_coverage',
  ];

  for (const key of llmsRequiredKeys) {
    if (!llms[key]) {
      throw new Error(`Missing key in llms.txt: ${key}`);
    }
  }

  validateCanonicalUrl(llms.canonical_site, 'llms.txt canonical_site');
  validateCanonicalUrl(llms.canonical_llms, 'llms.txt canonical_llms');
  validateCanonicalUrl(llms.llms_full, 'llms.txt llms_full');
  validateCanonicalUrl(llms.entities_index, 'llms.txt entities_index');
  validateSchemaVersion(llms.schema_version, 'llms.txt');
  validateLanguageCoverage(llms.language_coverage, 'llms.txt');

  const llmsFullRequiredKeys = [
    'canonical_site',
    'canonical_llms',
    'canonical_entities_index',
    'schema_version',
    'language_coverage',
  ];

  for (const key of llmsFullRequiredKeys) {
    if (!llmsFull[key]) {
      throw new Error(`Missing key in llms-full.txt: ${key}`);
    }
  }

  validateCanonicalUrl(llmsFull.canonical_site, 'llms-full.txt canonical_site');
  validateCanonicalUrl(llmsFull.canonical_llms, 'llms-full.txt canonical_llms');
  validateCanonicalUrl(llmsFull.canonical_entities_index, 'llms-full.txt canonical_entities_index');
  validateSchemaVersion(llmsFull.schema_version, 'llms-full.txt');
  validateLanguageCoverage(llmsFull.language_coverage, 'llms-full.txt');

  if (llms.entities_index !== llmsFull.canonical_entities_index) {
    throw new Error('entities index URL mismatch between llms.txt and llms-full.txt');
  }
}

function validateEntitiesMetadata() {
  const entitiesContent = JSON.parse(readText(ENTITIES_FILE));
  const meta = entitiesContent && entitiesContent.meta;

  if (!meta || typeof meta !== 'object') {
    throw new Error('public/data/entities.json missing meta object');
  }

  if (!Object.prototype.hasOwnProperty.call(meta, 'schema_version')) {
    throw new Error('public/data/entities.json meta.schema_version is required');
  }

  validateSchemaVersion(meta.schema_version, 'public/data/entities.json');

  if (!meta.canonical_url || typeof meta.canonical_url !== 'string') {
    throw new Error('public/data/entities.json meta.canonical_url is required');
  }
  validateCanonicalUrl(meta.canonical_url, 'public/data/entities.json canonical_url');

  if (!Array.isArray(meta.language_coverage)) {
    throw new Error('public/data/entities.json meta.language_coverage must be an array');
  }

  const languages = meta.language_coverage.map((item) => String(item).toLowerCase());
  if (!languages.includes('el') || !languages.includes('en')) {
    throw new Error('public/data/entities.json meta.language_coverage must include el and en');
  }
}

function main() {
  validateLlmsFiles();
  validateEntitiesMetadata();
  console.log('llms discovery validation passed');
}

main();
