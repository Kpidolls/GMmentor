const fs = require('fs');
const https = require('https');
const path = require('path');

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

async function main() {
  console.log('\n=================================');
  console.log('📤 IndexNow Submission');
  console.log('=================================\n');
  
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
  
  // Try sitemap.xml first (main sitemap), then fall back to sitemap-0.xml
  let sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml');
  let urls = parseSitemap(sitemapPath);
  
  if (urls.length === 0) {
    // Try sitemap-0.xml as fallback
    sitemapPath = path.join(process.cwd(), 'out', 'sitemap-0.xml');
    urls = parseSitemap(sitemapPath);
  }
  
  if (urls.length === 0) {
    console.log('⚠️  No URLs found in sitemap');
    console.log('   Skipping IndexNow submission.\n');
    process.exit(0);
  }
  
  console.log(`✓ Found ${urls.length} URLs in sitemap\n`);
  console.log(`Submitting to IndexNow API (${INDEXNOW_ENDPOINT})...`);
  
  try {
    await submitToIndexNow(urls, INDEXNOW_KEY);
    console.log('');
  } catch (error) {
    console.error('\n❌ Submission error:', error.message);
    console.log('This is non-critical. Your site will still build successfully.\n');
    process.exit(0); // Don't fail the build
  }
}

main();
