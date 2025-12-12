# Googlementor - AI Coding Agent Instructions

## Project Overview
Next.js 15 static site for Greek travel (Athens, islands) with bilingual support (EN/EL), PWA capabilities, and curated restaurant/location maps. Deployed to GitHub Pages at googlementor.com.

## Architecture & Key Patterns

### Static Export + GitHub Pages
- **Build**: `npm run build` → Next.js static export to `out/` → `postbuild` runs sitemap + IndexNow
- **Deploy**: `npm run deploy` → gh-pages package pushes `out/` to gh-pages branch
- **Critical Files**: 
  - `public/.nojekyll` (prevents GitHub Jekyll processing of `_next/` folder)
  - `public/CNAME` (custom domain config)
  - `next.config.js`: `output: 'export'`, `trailingSlash: false`, `exportPathMap` for all routes

### Data Architecture (No Backend)
- **Restaurant/Location Data**: Static JSON files in `src/data/` (e.g., `greekRestaurants.json`, `islands.json`)
- **Categories**: `restaurantCategories.json` drives UI, separate JSON per category (e.g., `dessertsRestaurants.json`)
- **Geolocation**: Client-side Haversine distance calculations via `src/utils/locationUtils.ts`
- **PWA Offline**: Service worker caches JSON data + critical images via `@ducanh2912/next-pwa`

### Internationalization (i18n)
- **Setup**: `i18next` with browser language detection, localStorage persistence
- **Files**: `src/i18n/locales/{en,el}.json` - flat key structure
- **Usage**: `useTranslation()` hook, `t('key')` function
- **Custom Hook**: `usePersistedLanguage()` syncs language across sessions
- **Blog Posts**: Paired MDX files with `-el` suffix (e.g., `acropolis-complete-guide.mdx` + `-el.mdx`)

### Progressive Web App (PWA)
- **Hook**: `usePWA()` in `src/hooks/usePWA.ts` - install prompts, online/offline detection, share API
- **Components**: `InstallBanner.tsx`, `OfflineNotice.tsx` (conditional rendering)
- **Data Preload**: `src/utils/dataPreloader.ts` - preloads critical JSON + images on install
- **Manifest**: `public/manifest.json` with shortcuts, icons, theme colors

### SEO Strategy
- **Meta Descriptions**: Centralized in `src/config/metaDescriptions.ts` (20+ unique descriptions)
- **H1 Tags**: Exactly one per page (MainHero has `<div><h1>` clickable structure, not button)
- **Sitemap**: `next-sitemap.config.js` - smart priorities (homepage: 1.0, blog: 0.8)
- **IndexNow**: Post-build script (`scripts/submit-to-indexnow.js`) notifies Bing/Yandex instantly
- **Blog Posts**: MDX H1 → H2, H2 → H3 (page title is true H1 at line 158 of `blog/[slug].tsx`)

## Component Patterns

### MainHero.tsx (Homepage)
- **Main State Machine**: 4 views (hero, municipality list, location options, restaurant finder)
- **Search Modes**: Location-based, municipality-based, category-based (experience types)
- **Translation**: Greek ↔ Latin transliteration for search (e.g., "Αθήνα" matches "Athina")
- **Share**: Custom share logic for results (not ShareData.text due to browser support)

### Blog System
- **Static Generation**: `getAllPosts()` in `src/lib/posts.ts` reads MDX from `src/blog/`
- **MDX Components**: Custom heading hierarchy in `blog/[slug].tsx` (h1 → h2 semantic mapping)
- **Language Switching**: `getAlternateLanguagePost()` finds paired translations, button in UI
- **Meta Descriptions**: `generateBlogMetaDescription()` uses summary → content excerpt → generated fallback

### Chakra UI Usage
- **Theme**: Custom extended theme in `_app.tsx` with Roboto font
- **Components**: Mix of Chakra (`Box`, `Heading`, `Link`) and Tailwind CSS classes
- **Search Page**: Pure Chakra UI grid layout with transliteration search

## Critical Workflows

### Build & Deploy
```bash
npm run clean              # Clears .next and out/
npm run build              # Build → sitemap → IndexNow (403 until deployed)
npm run deploy             # Predeploy (clean + build) → gh-pages push
npm run preview            # Serve out/ locally with serve package
```

### Development
```bash
npm run dev                # Next.js dev server on :3000
npm run lint               # ESLint (warnings OK, errors block build)
npm run build-types        # TypeScript type check without emit
npm run build-stats        # Bundle analyzer (ANALYZE=true)
```

### IndexNow Setup (One-time)
```bash
npm run indexnow:generate-key    # Creates public/{key}.txt and .env.local
# Then: INDEXNOW_KEY → NEXT_PUBLIC_INDEXNOW_KEY in .env.local
npm run indexnow:submit          # Manual submission test
```

## Common Gotchas

1. **GitHub Pages 404**: Missing `.nojekyll` or wrong `trailingSlash` setting
2. **PWA Not Installing**: Check manifest.json icons exist, service worker registered
3. **Translation Missing**: Fallback shows key name - add to both `en.json` and `el.json`
4. **Blog 404**: Route must be in `exportPathMap` (blog posts use dynamic `getStaticPaths`)
5. **IndexNow 403**: Expected until key file deployed to live site (not a build error)
6. **Multiple H1 Tags**: MDX content has H1 - must map to H2 in MarkdownComponents
7. **ESLint Circular JSON**: Known Next.js 15 + ESLint 8 warning (non-blocking)

## File Naming Conventions

- **Blog Posts**: `{slug}.mdx` (English), `{slug}-el.mdx` (Greek)
- **Components**: PascalCase (`MainHero.tsx`, `InstallBanner.tsx`)
- **Data Files**: camelCase with `Restaurants.json` suffix
- **Pages**: kebab-case paths (`privacy-policy.tsx`, `pwa-test.tsx`)
- **Hooks**: `use` prefix (`usePWA.ts`, `usePersistedLanguage.ts`)

## External Dependencies

- **Maps**: Google Maps URLs in restaurant data (not embedded maps)
- **Analytics**: Google Tag Manager via `_document.tsx`
- **Widgets**: GetYourGuide embedded widget (`GetYourGuideWidget.tsx`)
- **Insurance**: SafetyWing affiliate link on `/insurance`
- **eSIM**: Airalo affiliate link on `/airalo`

## Testing Checklist Before Deploy

1. `npm run build` exits 0 (IndexNow 403 is OK)
2. `ls out/` shows `.nojekyll`, `CNAME`, `index.html`, `sitemap.xml`
3. Each page HTML has exactly one `<h1>` tag
4. Blog posts have language switcher (if translation exists)
5. PWA manifest validates at https://manifest-validator.appspot.com/
6. Service worker loads in DevTools → Application → Service Workers

## Quick Reference

- **Styles**: Tailwind (`tailwind.config.js`) + Chakra UI theme
- **Fonts**: Roboto (Google Fonts) via `next/font/google`
- **TypeScript**: Strict mode enabled, `skipLibCheck: true` for faster builds
- **Environment**: `.env.local` for keys (gitignored), `NEXT_PUBLIC_*` for client-side
- **Static Assets**: `public/` → copies to `out/` root (icons, CNAME, robots.txt)
