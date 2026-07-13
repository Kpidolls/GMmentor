const fs = require('fs');
const path = require('path');

const BLOCKED_PATHS = new Set(['/pwa-test', '/pwa-test/']);
const TARGET_FILES = [
  path.join(process.cwd(), 'public', 'sitemap.xml'),
  path.join(process.cwd(), 'public', 'sitemap-0.xml'),
  path.join(process.cwd(), 'public', 'sitemap-1.xml'),
  path.join(process.cwd(), 'out', 'sitemap.xml'),
  path.join(process.cwd(), 'out', 'sitemap-0.xml'),
  path.join(process.cwd(), 'out', 'sitemap-1.xml')
];
const SYNC_FILES = ['robots.txt', 'sitemap.xml', 'sitemap-0.xml', 'sitemap-1.xml'];

function loadLegacyPlacePaths() {
  const entitiesPath = path.join(process.cwd(), 'public', 'data', 'entities.json');
  if (!fs.existsSync(entitiesPath)) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(entitiesPath, 'utf8'));
    const entities = Array.isArray(parsed?.entities) ? parsed.entities : [];
    const legacyPaths = new Set();

    for (const entity of entities) {
      const legacySlugs = Array.isArray(entity?.legacySlugs) ? entity.legacySlugs : [];
      for (const legacySlug of legacySlugs) {
        if (typeof legacySlug === 'string' && legacySlug.trim()) {
          legacyPaths.add(`/place/${legacySlug.trim()}`);
        }
      }
    }

    return legacyPaths;
  } catch {
    return new Set();
  }
}

function sanitizeSitemap(filePath, legacyPlacePaths) {
  if (!fs.existsSync(filePath)) {
    return { filePath, changed: false, removedBlocked: 0, removedLegacy: 0, skipped: true };
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const urlTagRegex = /<url>[\s\S]*?<\/url>/g;
  const matches = original.match(urlTagRegex) || [];

  let removedBlocked = 0;
  let removedLegacy = 0;
  const filtered = matches.filter((entry) => {
    const locMatch = entry.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) {
      return true;
    }

    try {
      const parsed = new URL(locMatch[1]);
      const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
      const isBlocked = BLOCKED_PATHS.has(pathname);
      const isLegacyPlace = legacyPlacePaths.has(pathname);

      if (isBlocked) {
        removedBlocked += 1;
      }
      if (isLegacyPlace) {
        removedLegacy += 1;
      }

      return !(isBlocked || isLegacyPlace);
    } catch {
      return true;
    }
  });

  if (removedBlocked === 0 && removedLegacy === 0) {
    return { filePath, changed: false, removedBlocked: 0, removedLegacy: 0, skipped: false };
  }

  let index = 0;
  const updated = original.replace(urlTagRegex, () => filtered[index++] || '');
  fs.writeFileSync(filePath, updated, 'utf8');

  return { filePath, changed: true, removedBlocked, removedLegacy, skipped: false };
}

function syncPublicFileToOut(fileName) {
  const sourcePath = path.join(process.cwd(), 'public', fileName);
  const destinationPath = path.join(process.cwd(), 'out', fileName);

  if (!fs.existsSync(sourcePath)) {
    return { fileName, copied: false, skipped: true };
  }

  fs.copyFileSync(sourcePath, destinationPath);
  return { fileName, copied: true, skipped: false };
}

function main() {
  const legacyPlacePaths = loadLegacyPlacePaths();
  const results = TARGET_FILES.map((filePath) => sanitizeSitemap(filePath, legacyPlacePaths));
  results.forEach((r) => {
    if (r.skipped) {
      console.log(`${path.relative(process.cwd(), r.filePath)}: skipped (not found)`);
      return;
    }
    if (!r.changed) {
      console.log(`${path.relative(process.cwd(), r.filePath)}: no blocked or legacy place entries found`);
      return;
    }
    console.log(
      `${path.relative(process.cwd(), r.filePath)}: removed ${r.removedBlocked} blocked and ${r.removedLegacy} legacy place entries`
    );
  });

  const syncResults = SYNC_FILES.map(syncPublicFileToOut);
  syncResults.forEach((result) => {
    if (result.skipped) {
      console.log(`${result.fileName}: skipped public source not found`);
      return;
    }
    if (result.copied) {
      console.log(`${result.fileName}: synced public -> out`);
    }
  });
}

main();
