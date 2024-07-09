/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  poweredByHeader: false,
  trailingSlash: true,
  // The starter code loads resources from `public` folder with `router.basePath` in React components.
  // So, the source code is "basePath-ready".
  // You can remove `basePath` if you don't need it.
  reactStrictMode: true,
  output: 'export',
  exportPathMap: async () => ({
    '/': { page: '/' },
    '/terms': { page: '/terms' },
    '/privacy-policy': { page: '/privacy-policy' },
    // Add other paths here if you have additional pages
  }),
});
module.exports = nextConfig;
