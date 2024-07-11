/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  poweredByHeader: false,
  trailingSlash: true,
  output: "export",
  // The starter code load resources from `public` folder with `router.basePath` in React components.
  // So, the source code is "basePath-ready".
  // You can remove `basePath` if you don't need it.
  reactStrictMode: true,
  i18n: {
    locales: ["en", "fr", "es"], // Add your supported locales here
    defaultLocale: "en",
  },
  async exportPathMap(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    const paths = {
      "/": {
        page: "/",
        query: { __nextDefaultLocale: "en", __nextLocale: "en" },
      },
      "/terms": {
        page: "/terms",
        query: { __nextDefaultLocale: "en", __nextLocale: "en" },
      },
      "/privacy-policy": {
        page: "/privacy-policy",
        query: { __nextDefaultLocale: "en", __nextLocale: "en" },
      },
      // Add other paths here if you have additional pages
    };

    // Add localized versions for each locale
    const locales = ["en", "fr", "es"];
    for (const locale of locales) {
      paths[`/${locale}`] = {
        page: "/",
        query: { __nextDefaultLocale: "en", __nextLocale: locale },
      };
      paths[`/${locale}/terms`] = {
        page: "/terms",
        query: { __nextDefaultLocale: "en", __nextLocale: locale },
      };
      paths[`/${locale}/privacy-policy`] = {
        page: "/privacy-policy",
        query: { __nextDefaultLocale: "en", __nextLocale: locale },
      };
    }

    return paths;
  },
});

module.exports = nextConfig;
