/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://googlementor.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  trailingSlash: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/404', '/500', '/api/*', '/pwa-test'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/pwa-test'],
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
    // Main navigation pages - high priority
    else if (['/search', '/store', '/airalo', '/insurance'].includes(path)) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Popular destination pages
    else if (path.includes('santorini') || path.includes('mykonos') || path.includes('athens')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    // Add alternateRefs for blog posts with language variants
    const alternateRefs = [];
    if (path.startsWith('/blog/')) {
      // Determine if this is English or Greek version
      const isGreek = path.endsWith('-el');
      const basePath = isGreek ? path.replace('-el', '') : path;
      const alternatePath = isGreek ? basePath : `${path}-el`;
      
      // Add hreflang for current page
      alternateRefs.push({
        href: `https://googlementor.com${path}`,
        hreflang: isGreek ? 'el' : 'en',
      });
      
      // Add hreflang for alternate language
      alternateRefs.push({
        href: `https://googlementor.com${alternatePath}`,
        hreflang: isGreek ? 'en' : 'el',
      });
      
      // Add x-default (English version)
      alternateRefs.push({
        href: `https://googlementor.com${basePath}`,
        hreflang: 'x-default',
      });
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: alternateRefs.length > 0 ? alternateRefs : undefined,
    };
  },
}