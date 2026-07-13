const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');
const SKIP_FILES = new Set(['index.html', '404.html', '500.html']);

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function createTrailingSlashAlias(htmlFilePath) {
  const relativePath = path.relative(OUT_DIR, htmlFilePath);

  if (SKIP_FILES.has(relativePath)) {
    return false;
  }

  const basename = path.basename(relativePath, '.html');
  const parent = path.dirname(relativePath);
  const aliasDir = path.join(OUT_DIR, parent === '.' ? basename : path.join(parent, basename));
  const aliasFile = path.join(aliasDir, 'index.html');

  if (fs.existsSync(aliasFile)) {
    return false;
  }

  fs.mkdirSync(aliasDir, { recursive: true });
  fs.copyFileSync(htmlFilePath, aliasFile);
  return true;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.warn('[trailing-slash-aliases] Skipping: out directory not found.');
    return;
  }

  const htmlFiles = walk(OUT_DIR);
  let created = 0;

  for (const htmlFilePath of htmlFiles) {
    if (createTrailingSlashAlias(htmlFilePath)) {
      created += 1;
    }
  }

  console.log(`[trailing-slash-aliases] Created ${created} trailing-slash aliases.`);
}

main();
