/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
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
const nextConfig = withBundleAnalyzer({
  poweredByHeader: false,
  trailingSlash: true,
  reactStrictMode: true,


  compiler: {
    styledComponents: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
    qualities: [75, 90, 95, 100],
  },

  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/terms': { page: '/terms' },
      '/privacy-policy': { page: '/privacy-policy' },
      '/login': { page: '/login' },
      '/store': { page: '/store' },
      '/airalo': { page: '/airalo' },
      '/insurance': { page: '/insurance' },
      '/search': { page: '/search' },
      '/signup': { page: '/signup' },
    };
  },
});

module.exports = nextConfig;
