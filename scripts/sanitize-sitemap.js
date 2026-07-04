const fs = require('fs');
const path = require('path');

const BLOCKED_PATHS = new Set(['/pwa-test', '/pwa-test/']);
const TARGET_FILES = [
  path.join(process.cwd(), 'public', 'sitemap-0.xml'),
  path.join(process.cwd(), 'out', 'sitemap-0.xml')
];
const SYNC_FILES = ['robots.txt', 'sitemap.xml', 'sitemap-0.xml', 'sitemap-1.xml'];

function sanitizeSitemap(filePath) {
  if (!fs.existsSync(filePath)) {
    return { filePath, changed: false, removed: 0, skipped: true };
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const urlTagRegex = /<url>[\s\S]*?<\/url>/g;
  const matches = original.match(urlTagRegex) || [];

  let removed = 0;
  const filtered = matches.filter((entry) => {
    const locMatch = entry.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) {
      return true;
    }

    try {
      const parsed = new URL(locMatch[1]);
      const shouldRemove = BLOCKED_PATHS.has(parsed.pathname);
      if (shouldRemove) {
        removed += 1;
      }
      return !shouldRemove;
    } catch {
      return true;
    }
  });

  if (removed === 0) {
    return { filePath, changed: false, removed: 0, skipped: false };
  }

  let index = 0;
  const updated = original.replace(urlTagRegex, () => filtered[index++] || '');
  fs.writeFileSync(filePath, updated, 'utf8');

  return { filePath, changed: true, removed, skipped: false };
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
  const results = TARGET_FILES.map(sanitizeSitemap);
  results.forEach((r) => {
    if (r.skipped) {
      console.log(`${path.relative(process.cwd(), r.filePath)}: skipped (not found)`);
      return;
    }
    if (!r.changed) {
      console.log(`${path.relative(process.cwd(), r.filePath)}: no blocked entries found`);
      return;
    }
    console.log(`${path.relative(process.cwd(), r.filePath)}: removed ${r.removed} blocked entries`);
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
