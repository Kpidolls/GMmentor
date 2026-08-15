const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');
const SITEMAP_FILES = [
  path.join(ROOT, 'public', 'sitemap.xml'),
  path.join(ROOT, 'public', 'sitemap-0.xml'),
  path.join(ROOT, 'public', 'sitemap-1.xml'),
  path.join(ROOT, 'public', 'sitemap-recent.xml'),
  path.join(ROOT, 'out', 'sitemap.xml'),
  path.join(ROOT, 'out', 'sitemap-0.xml'),
  path.join(ROOT, 'out', 'sitemap-1.xml'),
  path.join(ROOT, 'out', 'sitemap-recent.xml'),
];
const PLACEHOLDER_PATTERN = /\[(?:id|slug|category|area)\]/i;

function routeOutputCandidates(pathname) {
  const decodedPathname = decodeURIComponent(pathname);
  const normalized = decodedPathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') {
    return [path.join(OUT_DIR, 'index.html')];
  }

  const relative = normalized.replace(/^\//, '');
  return [
    path.join(OUT_DIR, `${relative}.html`),
    path.join(OUT_DIR, relative, 'index.html'),
  ];
}

function readSitemapUrls(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return Array.from(content.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1].trim());
}

function main() {
  const issues = [];
  const urls = new Set();

  for (const sitemapFile of SITEMAP_FILES) {
    for (const rawUrl of readSitemapUrls(sitemapFile)) {
      urls.add(rawUrl);
    }
  }

  for (const rawUrl of urls) {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      issues.push(`Invalid sitemap URL: ${rawUrl}`);
      continue;
    }

    if (PLACEHOLDER_PATTERN.test(parsed.pathname)) {
      issues.push(`Literal placeholder URL: ${rawUrl}`);
      continue;
    }

    if (!fs.existsSync(OUT_DIR)) {
      continue;
    }

    const hasOutput = routeOutputCandidates(parsed.pathname).some((candidate) => fs.existsSync(candidate));
    if (!hasOutput) {
      issues.push(`Sitemap URL has no static output: ${rawUrl}`);
    }
  }

  if (issues.length > 0) {
    console.error(`Generated route validation failed with ${issues.length} issue(s):`);
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Generated route validation passed for ${urls.size} sitemap URL(s).`);
}

main();
