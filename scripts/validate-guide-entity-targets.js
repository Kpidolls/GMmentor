const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const ENTITIES_FILE = path.join(ROOT, 'public', 'data', 'entities.json');
const BLOG_DIR = path.join(ROOT, 'src', 'blog');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function getTargets(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function main() {
  if (!fs.existsSync(ENTITIES_FILE)) {
    fail(`Missing entities file: ${path.relative(ROOT, ENTITIES_FILE)}`);
  }

  if (!fs.existsSync(BLOG_DIR)) {
    fail(`Missing blog directory: ${path.relative(ROOT, BLOG_DIR)}`);
  }

  const entities = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf8'));
  const entityIds = new Set((Array.isArray(entities?.entities) ? entities.entities : []).map((entity) => entity?.id).filter(Boolean));

  const files = fs.readdirSync(BLOG_DIR).filter((name) => /\.mdx?$/.test(name));
  const invalid = [];
  let guidesWithTargets = 0;
  let totalTargets = 0;

  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);
    const targets = getTargets(parsed.data?.entity_targets);

    if (!targets.length) {
      continue;
    }

    guidesWithTargets += 1;
    totalTargets += targets.length;

    for (const id of targets) {
      if (!entityIds.has(id)) {
        invalid.push({ file, id });
      }
    }
  }

  if (invalid.length) {
    const sample = invalid.slice(0, 20).map((entry) => `${entry.file}: ${entry.id}`).join('\n');
    fail(`Invalid entity_targets IDs found:\n${sample}${invalid.length > 20 ? '\n...' : ''}`);
  }

  console.log(`✅ Guide entity targets validation passed (${guidesWithTargets} guides, ${totalTargets} targets).`);
}

main();
