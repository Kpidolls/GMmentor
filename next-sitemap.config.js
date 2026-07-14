/** @type {import('next-sitemap').IConfig} */
const { readFileSync } = require('fs');
const { join } = require('path');
const featureFlags = require('./src/config/featureFlags.json');

const exclude = ['/404', '/500', '/api/*', '/pwa-test', '/pwa-test/'];
if (!featureFlags.storeEnabled) {
  exclude.push('/store');
}

module.exports = {
  siteUrl: 'https://googlementor.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  trailingSlash: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/pwa-test', '/pwa-test/', '/*.html', '/*?*'],
      },
    ],
    additionalSitemaps: [
      'https://googlementor.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority based on page importance
    let priority = 0.7;
    let changefreq = 'weekly';

    // Homepage - highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Blog posts - high priority, updated less frequently
    else if (path.startsWith('/blog/')) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Canonical place pages - important landing pages
    else if (path.startsWith('/place/')) {
      priority = 0.85;
      changefreq = 'weekly';
    }
    // Main navigation pages - high priority
    else if (
      ['/search', '/airalo', '/insurance', ...(featureFlags.storeEnabled ? ['/store'] : [])].includes(path)
    ) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Popular destination pages
    else if (path.includes('santorini') || path.includes('mykonos') || path.includes('athens')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    try {
      const entitiesFile = join(process.cwd(), 'public', 'data', 'entities.json');
      const parsed = JSON.parse(readFileSync(entitiesFile, 'utf8'));
      const entities = Array.isArray(parsed?.entities) ? parsed.entities : [];
      const coverageFile = join(process.cwd(), 'public', 'data', 'intent-coverage.json');

      let generatedAreaRoutes = [];
      let generatedCategoryAreaRoutes = [];
      try {
        const coverage = JSON.parse(readFileSync(coverageFile, 'utf8'));
        generatedAreaRoutes = Array.isArray(coverage?.generatedAreaRoutes) ? coverage.generatedAreaRoutes : [];
        generatedCategoryAreaRoutes = Array.isArray(coverage?.generatedCategoryAreaRoutes)
          ? coverage.generatedCategoryAreaRoutes
          : [];
      } catch {
        generatedAreaRoutes = [];
        generatedCategoryAreaRoutes = [];
      }

      const placePaths = entities
        .filter((entity) => entity?.slug)
        .map((entity) => ({
          loc: `/place/${entity.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString(),
        }));

      const areaPaths = generatedAreaRoutes.map((areaSlug) => ({
        loc: `/area/${areaSlug}`,
        changefreq: 'weekly',
        priority: 0.78,
        lastmod: new Date().toISOString(),
      }));

      const categoryAreaPaths = generatedCategoryAreaRoutes
        .filter((route) => route?.categorySlug && route?.areaSlug)
        .map((route) => ({
          loc: `/${route.categorySlug}/${route.areaSlug}`,
          changefreq: 'weekly',
          priority: 0.82,
          lastmod: new Date().toISOString(),
        }));

      return [...placePaths, ...areaPaths, ...categoryAreaPaths];
    } catch {
      return [];
    }
  },
}