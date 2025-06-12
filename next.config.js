/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  poweredByHeader: false,
  trailingSlash: true,
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  basePath: '',
  assetPrefix: '',
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
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
      // Add other paths here if you have additional pages 
    };
  }
});

module.exports = nextConfig;