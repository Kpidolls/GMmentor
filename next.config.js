/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { readFileSync } = require('fs');
const { join } = require('path');
const featureFlags = require('./src/config/featureFlags.json');
const isDevelopment = process.env.NODE_ENV === 'development';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in development to avoid fetch errors
  navigationPreload: false, // Disable navigation preload to avoid preloadResponse cancellation warning
  buildExcludes: [
    /middleware-manifest\.json$/, 
    /routes-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  workboxOptions: {
    manifestTransforms: [
      async (entries) => {
        const manifest = entries.filter((entry) => {
          const url = entry.url || '';
          return !(
            /\/(_next\/)?dynamic-css-manifest\.json(\?.*)?$/i.test(url) ||
            /\/(_next\/)?_?buildManifest\.js(\?.*)?$/i.test(url) ||
            /\/(_next\/)?_?ssgManifest\.js(\?.*)?$/i.test(url)
          );
        });
        return { manifest, warnings: [] };
      },
    ],
  },
  fallbacks: {
    document: '/offline.html',
  },
  runtimeCaching: [
    // Enhanced Font Caching
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },

    // Enhanced JSON Data Caching (Critical for offline restaurant finder)
    {
      urlPattern: /\/data\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'json-data-v2',
        expiration: {
          maxEntries: 50, // Increased for all restaurant categories
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              // Create consistent cache keys for JSON files
              return request.url.replace(/\?.*$/, '');
            },
            cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
              // Return cached response even if stale for offline usage
              return cachedResponse;
            }
          }
        ]
      }
    },

    // Restaurant Data Specific Caching
    {
      urlPattern: /\/(greekRestaurants|municipalities|restaurantCategories|islands|mapOptions|products)\.json$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'core-data-v2',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days - longer for core data
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Cache valid JSON responses
              return response.status === 200 && response.type === 'basic';
            }
          }
        ]
      }
    },

    // Enhanced Image Caching (Including map images)
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets-v2',
        expiration: {
          maxEntries: 100, // Increased for map images
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              // Normalize image URLs
              const url = new URL(request.url);
              url.search = ''; // Remove query parameters for consistent caching
              return url.href;
            }
          }
        ]
      }
    },

    // Map Image Specific Caching (For offline maps)
    {
      urlPattern: /\/assets\/images\/.+\.(jpg|jpeg|png|webp|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-images-v2',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200;
            },
            cachedResponseWillBeUsed: async ({ cachedResponse }) => {
              // Always return cached images for offline use
              return cachedResponse;
            }
          }
        ]
      }
    },

    // Google Maps API Caching (For map tiles and API responses)
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-maps-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },

    // Static Assets Caching
    {
      urlPattern: /\/_next\/static.+\.js$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-js-v2',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year (hashed immutable assets)
        }
      }
    },

    // CSS Caching
    {
      urlPattern: /\/_next\/static.+\.css$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-css',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year (hashed immutable assets)
        }
      }
    },

    // External APIs that can be cached
    {
      urlPattern: /^https:\/\/api\.(mapbox|openstreetmap)\..*$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'external-maps-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 12 * 60 * 60 // 12 hours
        }
      }
    },

    // Font Assets
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },

    // Fallback for all other requests
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others-v2',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const redirects = async () => [
  {
    source: '/:path*/',
    destination: '/:path*',
    permanent: true,
    has: [{ type: 'host', value: 'googlementor.com' }],
  },
  {
    source: '/:path*',
    destination: 'https://googlementor.com/:path*',
    permanent: true,
    has: [{ type: 'host', value: 'www.googlementor.com' }],
  },
  // Add more rules as needed
];

/** @type {import('next').NextConfig} */
const nextConfig = withPWA(withBundleAnalyzer({
  poweredByHeader: false,
  trailingSlash: false,
  reactStrictMode: true,
  devIndicators: false,
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 600,
  experimental: {
    cpus: 1,
  },

  compiler: {
    styledComponents: true,
  },
  output: isDevelopment ? undefined : 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
    qualities: [75, 90, 95, 100],
  },

  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    if (dev) {
      return defaultPathMap;
    }

    let placePaths = {};
    let areaPaths = {};
    let categoryAreaPaths = {};
    let destinationPaths = {};

    const slugify = (value) =>
      String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');

    const stripHashSuffix = (slug) => String(slug || '').replace(/-[0-9a-f]{4,8}$/i, '');

    const ensureUniqueAreaSlug = (base, region, used) => {
      if (!used.has(base)) {
        used.add(base);
        return base;
      }

      const withRegion = `${base}-${slugify(region)}`;
      if (!used.has(withRegion)) {
        used.add(withRegion);
        return withRegion;
      }

      let index = 2;
      while (used.has(`${withRegion}-${index}`)) {
        index += 1;
      }

      const fallback = `${withRegion}-${index}`;
      used.add(fallback);
      return fallback;
    };

    try {
      const entitiesFile = join(process.cwd(), 'public', 'data', 'entities.json');
      const parsed = JSON.parse(readFileSync(entitiesFile, 'utf8'));
      const entities = Array.isArray(parsed?.entities) ? parsed.entities : [];

      placePaths = entities.reduce((acc, entity) => {
        if (!entity?.slug) {
          return acc;
        }

        acc[`/place/${entity.slug}`] = {
          page: '/place/[slug]',
          query: { slug: entity.slug },
        };

        return acc;
      }, {});
    } catch {
      placePaths = {};
    }

    try {
      const municipalitiesFile = join(process.cwd(), 'public', 'data', 'municipalities.json');
      const parsed = JSON.parse(readFileSync(municipalitiesFile, 'utf8'));
      const municipalities = Array.isArray(parsed) ? parsed : [];
      const used = new Set();

      areaPaths = municipalities
        .filter((item) => item && item.region && item.name)
        .reduce((acc, item) => {
          const preferredBase = slugify(stripHashSuffix(item.slug) || item.name_en || item.name);
          if (!preferredBase) {
            return acc;
          }

          const areaSlug = ensureUniqueAreaSlug(preferredBase, item.region_en || item.region, used);
          acc[`/area/${areaSlug}`] = {
            page: '/area/[area]',
            query: { area: areaSlug },
          };

          return acc;
        }, {});
    } catch {
      areaPaths = {};
    }

    try {
      const coverageFile = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
      const coverage = JSON.parse(readFileSync(coverageFile, 'utf8'));
      const routes = Array.isArray(coverage?.generatedCategoryAreaRoutes)
        ? coverage.generatedCategoryAreaRoutes
        : [];

      categoryAreaPaths = routes.reduce((acc, route) => {
        const categorySlug = route?.categorySlug;
        const areaSlug = route?.areaSlug;
        if (!categorySlug || !areaSlug) {
          return acc;
        }

        acc[`/${categorySlug}/${areaSlug}`] = {
          page: '/[category]/[area]',
          query: {
            category: categorySlug,
            area: areaSlug,
          },
        };
        return acc;
      }, {});
    } catch {
      categoryAreaPaths = {};
    }

    try {
      const destinationsFile = join(process.cwd(), 'public', 'data', 'islands.json');
      const parsed = JSON.parse(readFileSync(destinationsFile, 'utf8'));
      const destinations = Array.isArray(parsed) ? parsed : [];

      destinationPaths = destinations.reduce((acc, destination) => {
        const id = String(destination?.id || '').trim();
        if (!id) {
          return acc;
        }

        acc[`/destination/${id}`] = {
          page: '/destination/[id]',
          query: { id },
        };

        return acc;
      }, {});
    } catch {
      destinationPaths = {};
    }

    const pathMap = {
      '/': { page: '/' },
      '/areas': { page: '/areas' },
      '/collections': { page: '/collections' },
      '/terms': { page: '/terms' },
      '/privacy-policy': { page: '/privacy-policy' },
      '/login': { page: '/login' },
      '/airalo': { page: '/airalo' },
      '/insurance': { page: '/insurance' },
      '/itinerary': { page: '/itinerary' },
      '/search': { page: '/search' },
      '/signup': { page: '/signup' },
      '/blog': { page: '/blog' },
      '/blog/greek-bakeries-brunch-coffee-guide': {
        page: '/blog/[slug]',
        query: { slug: 'greek-bakeries-brunch-coffee-guide' },
      },
      ...destinationPaths,
      ...categoryAreaPaths,
      ...areaPaths,
      ...placePaths,
    };

    if (featureFlags.storeEnabled) {
      pathMap['/store'] = { page: '/store' };
    }

    return pathMap;
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
}));

module.exports = nextConfig;
