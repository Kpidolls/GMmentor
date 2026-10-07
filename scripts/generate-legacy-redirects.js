const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');
const SITE_URL = 'https://googlementor.com';

// Retired URLs -> current target. GitHub Pages has no server redirects, so emit meta-refresh pages.
const REDIRECTS = {
  '/burgers/kastella': '/area/kastella',
};

function html(target) {
  const url = `${SITE_URL}${target}`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><meta name="robots" content="noindex"><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${target}"></head><body><a href="${target}">Continue</a><script>location.replace(${JSON.stringify(target)});</script></body></html>`;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.warn('[legacy-redirects] Skipping: out directory not found.');
    return;
  }

  for (const [from, to] of Object.entries(REDIRECTS)) {
    if (!fs.existsSync(path.join(OUT_DIR, to, 'index.html')) && !fs.existsSync(path.join(OUT_DIR, `${to}.html`))) {
      console.warn(`[legacy-redirects] Target missing, skipped: ${from} -> ${to}`);
      continue;
    }

    const base = path.join(OUT_DIR, from);
    if (fs.existsSync(`${base}.html`)) continue;

    fs.mkdirSync(path.dirname(base), { recursive: true });
    fs.writeFileSync(`${base}.html`, html(to));
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, 'index.html'), html(to));
    console.log(`[legacy-redirects] ${from} -> ${to}`);
  }
}

main();
