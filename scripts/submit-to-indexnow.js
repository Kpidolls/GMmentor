const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

// Load IndexNow key from .env.local
function loadEnvKey() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/NEXT_PUBLIC_INDEXNOW_KEY=([a-f0-9]{32})/);
  
  return match ? match[1] : null;
}

const INDEXNOW_KEY = loadEnvKey();
const SITE_URL = 'https://googlementor.com';
const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'api.indexnow.org';
const INDEXNOW_STATE_DIR = path.join(process.cwd(), '.indexnow-state');
const HASH_STATE_FILE = path.join(INDEXNOW_STATE_DIR, 'url-hashes.json');
const QUEUE_STATE_FILE = path.join(INDEXNOW_STATE_DIR, 'pending-queue.json');
const RECENT_STATE_FILE = path.join(INDEXNOW_STATE_DIR, 'recent-updates.json');
const OUT_DIR = path.join(process.cwd(), 'out');
const MAX_URLS_PER_RUN = Number(process.env.INDEXNOW_MAX_URLS_PER_RUN || 1000);
const CHUNK_SIZE = Number(process.env.INDEXNOW_CHUNK_SIZE || 10);
const CHUNK_DELAY_MS = Number(process.env.INDEXNOW_CHUNK_DELAY_MS || 400);
const AUTO_DRAIN_ENABLED = process.env.INDEXNOW_AUTO_DRAIN !== '0';
const AUTO_DRAIN_MAX_PASSES = Number(process.env.INDEXNOW_AUTO_DRAIN_MAX_PASSES || 20);
const RECENT_SITEMAP_LIMIT = Number(process.env.RECENT_SITEMAP_LIMIT || 500);
const RECENT_SITEMAP_RETENTION_DAYS = Number(process.env.RECENT_SITEMAP_RETENTION_DAYS || 14);

function ensureStateDir() {
  if (!fs.existsSync(INDEXNOW_STATE_DIR)) {
    fs.mkdirSync(INDEXNOW_STATE_DIR, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJsonFile(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    return fallbackValue;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallbackValue;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function normalizeRoute(route) {
  if (!route || route === '/index') {
    return '/';
  }

  if (route.endsWith('/index')) {
    return route.slice(0, -'/index'.length) || '/';
  }

  return route;
}

function routeToAbsoluteUrl(route) {
  const normalized = normalizeRoute(route);
  if (normalized === '/') {
    return SITE_URL;
  }
  return `${SITE_URL}${normalized}`;
}

function outHtmlFileToUrl(filePath) {
  const relative = path.relative(OUT_DIR, filePath).replace(/\\/g, '/');
  if (!relative.endsWith('.html')) {
    return null;
  }

  if (relative === '404.html' || relative === '500.html' || relative === 'offline.html') {
    return null;
  }

  let route = relative.replace(/\.html$/, '');
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }
  route = normalizeRoute(route);
  return routeToAbsoluteUrl(route);
}

function walkDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function hashContent(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

function collectCurrentUrlHashes() {
  const allFiles = walkDir(OUT_DIR);
  const hashes = {};

  for (const filePath of allFiles) {
    if (!filePath.endsWith('.html')) {
      continue;
    }

    const url = outHtmlFileToUrl(filePath);
    if (!url) {
      continue;
    }

    const content = fs.readFileSync(filePath);
    hashes[url] = hashContent(content);
  }

  return hashes;
}

function diffHashes(previousHashes, currentHashes) {
  const changedOrNew = [];
  const removed = [];

  for (const [url, hash] of Object.entries(currentHashes)) {
    if (previousHashes[url] !== hash) {
      changedOrNew.push(url);
    }
  }

  for (const oldUrl of Object.keys(previousHashes)) {
    if (!(oldUrl in currentHashes)) {
      removed.push(oldUrl);
    }
  }

  return { changedOrNew, removed };
}

function dedupeUrls(urls) {
  return Array.from(new Set(urls.filter(Boolean)));
}

function chunkArray(items, chunkSize) {
  const size = Math.max(1, chunkSize);
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildRecentSitemapXml(entries) {
  const items = entries
    .map(({ url, lastmod }) => {
      return `<url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`;
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items,
    '</urlset>',
    '',
  ].join('\n');
}

function updateRecentSitemap(changedCurrentUrls) {
  const nowIso = new Date().toISOString();
  const existing = readJsonFile(RECENT_STATE_FILE, []);
  const existingByUrl = new Map(
    existing
      .filter((item) => typeof item?.url === 'string' && typeof item?.lastmod === 'string')
      .map((item) => [item.url, item.lastmod])
  );

  for (const url of changedCurrentUrls) {
    existingByUrl.set(url, nowIso);
  }

  const retentionMs = Math.max(1, RECENT_SITEMAP_RETENTION_DAYS) * 24 * 60 * 60 * 1000;
  const threshold = Date.now() - retentionMs;
  const merged = Array.from(existingByUrl.entries())
    .map(([url, lastmod]) => ({ url, lastmod }))
    .filter((item) => Date.parse(item.lastmod) >= threshold)
    .sort((a, b) => Date.parse(b.lastmod) - Date.parse(a.lastmod))
    .slice(0, Math.max(1, RECENT_SITEMAP_LIMIT));

  writeJsonFile(RECENT_STATE_FILE, merged);

  const xml = buildRecentSitemapXml(merged.length > 0 ? merged : [{ url: SITE_URL, lastmod: nowIso }]);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap-recent.xml'), xml, 'utf-8');
  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap-recent.xml'), xml, 'utf-8');
  }

  return merged.length;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 0, body: data });
        });
      })
      .on('error', reject);
  });
}

async function verifyPublicKeyFile(key) {
  const keyUrl = `${SITE_URL}/${key}.txt`;

  try {
    const response = await httpsGet(keyUrl);
    if (response.statusCode !== 200) {
      console.log(`⚠️  Key file check failed: ${keyUrl} returned ${response.statusCode}`);
      return false;
    }

    if (response.body.trim() !== key) {
      console.log(`⚠️  Key file check failed: ${keyUrl} content does not match configured key`);
      return false;
    }

    console.log(`✓ Key file reachable: ${keyUrl}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not verify key file at ${keyUrl}: ${error.message}`);
    return false;
  }
}

function parseSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.log(`⚠️  Sitemap not found at ${sitemapPath}`);
    return [];
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const urlMatches = content.matchAll(/<loc>(.*?)<\/loc>/g);
  const urls = Array.from(urlMatches, match => match[1]);
  
  return urls;
}

function submitToIndexNow(urls, key) {
  return new Promise((resolve, reject) => {
    const keyLocation = `${SITE_URL}/${key}.txt`;
    const payload = JSON.stringify({
      host: 'googlementor.com',
      key: key,
      keyLocation,
      urlList: urls.slice(0, 10000), // IndexNow limit
    });
    
    const options = {
      hostname: INDEXNOW_ENDPOINT,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✅ IndexNow: Successfully submitted ${urls.length} URLs`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Search engines will crawl these URLs within minutes to hours.`);
          resolve({ success: true, status: res.statusCode });
        } else {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch {
            parsed = null;
          }

          if (res.statusCode === 403) {
            console.log('ℹ️  IndexNow authorization not active yet (HTTP 403).');
            if (data) console.log(`   Response: ${data}`);
            console.log('   Next steps:');
            console.log('   1. Verify googlementor.com in Bing Webmaster Tools using the same key file.');
            console.log(`   2. Confirm key URL is publicly reachable: ${keyLocation}`);
            console.log('   3. Submit sitemap.xml in Bing Webmaster Tools and retry after verification propagates.');
            resolve({ success: false, status: res.statusCode, blockedByAuthorization: true, error: parsed });
            return;
          }

          console.log(`⚠️  IndexNow returned status ${res.statusCode}`);
          if (data) console.log(`   Response: ${data}`);
          resolve({ success: false, status: res.statusCode, error: parsed });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ IndexNow submission failed:', error.message);
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

async function streamSubmitQueue(queue, key) {
  const maxPerRun = Math.max(1, MAX_URLS_PER_RUN);
  const toSubmit = queue.slice(0, maxPerRun);
  const deferred = queue.slice(maxPerRun);

  if (toSubmit.length === 0) {
    return { submitted: 0, remainingQueue: queue, blockedByAuthorization: false };
  }

  const chunks = chunkArray(toSubmit, CHUNK_SIZE);
  const failedUrls = [];
  let submittedCount = 0;
  let blockedByAuthorization = false;

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const result = await submitToIndexNow(chunk, key);

    if (result.success) {
      submittedCount += chunk.length;
    } else {
      failedUrls.push(...chunk);
      if (result.blockedByAuthorization) {
        blockedByAuthorization = true;
        const remainingChunks = chunks.slice(i + 1).flat();
        failedUrls.push(...remainingChunks);
        break;
      }
    }

    if (i < chunks.length - 1) {
      await sleep(Math.max(0, CHUNK_DELAY_MS));
    }
  }

  return {
    submitted: submittedCount,
    blockedByAuthorization,
    remainingQueue: dedupeUrls([...failedUrls, ...deferred]),
  };
}

async function main() {
  console.log('\n=================================');
  console.log('📤 IndexNow Streaming Submission');
  console.log('=================================\n');

  ensureStateDir();

  if (!fs.existsSync(OUT_DIR)) {
    console.log('⚠️  out/ folder not found. Run a full build before IndexNow submission.');
    console.log('   Skipping IndexNow submission.\n');
    process.exit(0);
  }
  
  // Check if key is configured
  if (!INDEXNOW_KEY) {
    console.log('⚠️  NEXT_PUBLIC_INDEXNOW_KEY not set');
    console.log('   Run: npm run indexnow:generate-key');
    console.log('   Then add the key to .env.local');
    console.log('   Skipping IndexNow submission.\n');
    process.exit(0);
  }
  
  console.log(`✓ API Key configured: ${INDEXNOW_KEY.substring(0, 8)}...`);

  const keyFileReady = await verifyPublicKeyFile(INDEXNOW_KEY);
  if (!keyFileReady) {
    console.log('   Skipping IndexNow submission until key file check passes.\n');
    process.exit(0);
  }

  const previousHashes = readJsonFile(HASH_STATE_FILE, {});
  const currentHashes = collectCurrentUrlHashes();

  if (Object.keys(currentHashes).length === 0) {
    console.log('⚠️  No exported HTML routes found in out/.');
    console.log('   Skipping IndexNow submission.\n');
    process.exit(0);
  }

  const { changedOrNew, removed } = diffHashes(previousHashes, currentHashes);
  const previousQueue = readJsonFile(QUEUE_STATE_FILE, []);
  const currentChangesForQueue = dedupeUrls([...changedOrNew, ...removed]);
  const queue = dedupeUrls([...previousQueue, ...currentChangesForQueue]);
  const recentCount = updateRecentSitemap(changedOrNew);

  writeJsonFile(HASH_STATE_FILE, currentHashes);

  if (queue.length === 0) {
    console.log('✓ No URL-level changes detected since the previous build.');
    console.log(`✓ Updated sitemap-recent.xml with ${recentCount} recent entries.`);
    console.log('   Skipping IndexNow submission.\n');
    process.exit(0);
  }

  console.log(`✓ URL changes detected: ${changedOrNew.length} new/updated, ${removed.length} removed`);
  console.log(`✓ Queue size: ${queue.length} URL(s)`);
  console.log(`✓ Streaming config: max/run=${Math.max(1, MAX_URLS_PER_RUN)}, chunk=${Math.max(1, CHUNK_SIZE)}, delay=${Math.max(0, CHUNK_DELAY_MS)}ms`);
  console.log(`✓ Updated sitemap-recent.xml with ${recentCount} recent entries.`);
  console.log(`\nStreaming to IndexNow API (${INDEXNOW_ENDPOINT})...`);
  
  try {
    let pendingQueue = queue;
    let totalSubmitted = 0;
    let blockedByAuthorization = false;
    let pass = 0;
    const maxPasses = Math.max(1, AUTO_DRAIN_MAX_PASSES);

    while (pendingQueue.length > 0 && pass < maxPasses) {
      pass += 1;
      if (pass > 1) {
        console.log(`\n↻ Auto-drain pass ${pass}/${maxPasses}...`);
      }

      const beforeCount = pendingQueue.length;
      const streamResult = await streamSubmitQueue(pendingQueue, INDEXNOW_KEY);

      totalSubmitted += streamResult.submitted;
      pendingQueue = streamResult.remainingQueue;
      blockedByAuthorization = blockedByAuthorization || streamResult.blockedByAuthorization;

      const madeProgress = pendingQueue.length < beforeCount;
      if (blockedByAuthorization || !AUTO_DRAIN_ENABLED || !madeProgress) {
        break;
      }
    }

    writeJsonFile(QUEUE_STATE_FILE, pendingQueue);

    console.log(`\n✅ Streamed ${totalSubmitted} URL(s) this run.`);
    if (pendingQueue.length > 0) {
      console.log(`⏳ ${pendingQueue.length} URL(s) remain queued.`);
      if (!AUTO_DRAIN_ENABLED) {
        console.log('   Auto-drain is disabled (set INDEXNOW_AUTO_DRAIN=1 to enable).');
      } else if (pass >= maxPasses) {
        console.log(`   Reached auto-drain pass cap (${maxPasses}).`);
      } else {
        console.log('   Stopped auto-drain because no additional queue progress was detected.');
      }
    } else {
      console.log('✓ Queue fully drained.');
    }

    if (blockedByAuthorization) {
      console.log('ℹ️  Queue retained because IndexNow authorization is not fully active yet.');
    }

    console.log('');
  } catch (error) {
    console.error('\n❌ Submission error:', error.message);
    console.log('This is non-critical. Your site will still build successfully.\n');
    process.exit(0); // Don't fail the build
  }
}

main();
