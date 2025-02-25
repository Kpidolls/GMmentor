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
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix:  process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/' },
      '/terms': { page: '/terms' },
      '/privacy-policy': { page: '/privacy-policy' },
      '/login': { page: '/login' },
      // Add other paths here if you have additional pages
    };
  }
});

module.exports = nextConfig;