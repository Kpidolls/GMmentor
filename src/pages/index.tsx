import Link from 'next/link';
import React from 'react';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import '../i18n';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticMetaDescription } from '../config/metaDescriptions';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { Post, getAllPosts } from '../lib/posts';
import BlogHighlight from '../components/BlogHighlight';
import featureFlags from '../config/featureFlags.json';
import { loadEntitiesIndex } from '../lib/entities';
import { createIntentEngine } from '../lib/intent';
import { isPriorityGuide } from '../lib/knowledgeGraph';
import { readFileSync } from 'fs';
import { join } from 'path';
// FeaturedCarousel removed — using static blog highlight only

const AboutUs = dynamic(() => import('../components/AboutUs'));
const Canvas = dynamic(() => import('../components/Canvas'));
const Product = dynamic(() => import('../components/Product'));
const QASection = dynamic(() => import('../components/QASection'));
const IslandList = dynamic(() => import('../components/IslandList'));
const ProductShowcase = dynamic(() => import('../components/ProductShowcase'));
const Reviews = dynamic(() => import('../components/Reviews'));
const BrevoForm = dynamic(() => import('../components/BrevoForm'), { ssr: false });
const GetYourGuideWidget = dynamic(() => import('../components/GetYourGuideWidget'), { ssr: false });

type MinimalPost = Pick<Post, 'slug' | 'title' | 'date' | 'summary' | 'language' | 'originalSlug'>

type InternalHubLink = {
  href: string;
  label: string;
  count?: number;
  labelEl?: string;
};

type AreaCoverageEntry = {
  slug: string;
  score: number;
};

type CategoryAreaCoverageEntry = {
  categorySlug: string;
  areaSlug: string;
  score: number;
};

type HomePageProps = {
  allPosts: MinimalPost[];
  topAreaLinks: InternalHubLink[];
  topListLinks: InternalHubLink[];
  topGuideLinks: InternalHubLink[];
};

const App = ({ allPosts, topAreaLinks, topListLinks, topGuideLinks }: HomePageProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];
  const homeMetaDescription = getStaticMetaDescription('home', currentLang);
  const toAbsoluteUrl = (href: string) =>
    href.startsWith('http') ? href : `https://googlementor.com${href.startsWith('/') ? '' : '/'}${href}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('faq.tavernas.question', 'Where can I find authentic Greek tavernas in Athens?'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.tavernas.answer', "Browse our Greek tavernas list for traditional spots favored by locals — curated maps and real reviews help you find the best spots.")
        }
      },
      {
        "@type": "Question",
        "name": t('faq.family.question', 'Are there family-friendly spots near the center of Athens?'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.family.answer', 'Yes — use the Kid Friendly category to find stroller-accessible venues, kid menus, and casual family-friendly restaurants.')
        }
      }
    ]
  } as const;

  const internalHubJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: t('home.linkHub.areas', 'Top areas'),
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: topAreaLinks.length,
        itemListElement: topAreaLinks.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.label,
          url: toAbsoluteUrl(link.href),
        })),
      },
      {
        '@type': 'ItemList',
        name: t('home.linkHub.lists', 'Top lists'),
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: topListLinks.length,
        itemListElement: topListLinks.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.label,
          url: toAbsoluteUrl(link.href),
        })),
      },
      {
        '@type': 'ItemList',
        name: t('home.linkHub.guides', 'Top guides'),
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: topGuideLinks.length,
        itemListElement: topGuideLinks.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.label,
          url: toAbsoluteUrl(link.href),
        })),
      },
    ],
  } as const;
  
  return (
    <div className="bg-white">
      <Head>
        <title>{t('meta.homeTitle')}</title>
        <meta
          name="description"
          content={homeMetaDescription}
        />
        <link rel="canonical" href="https://googlementor.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={homeMetaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://googlementor.com" />
        <meta property="og:image" content="https://googlementor.com/assets/images/cover-627.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* FAQPage JSON-LD for common quick questions on the homepage (localized) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(internalHubJsonLd) }}
        />
      </Head>

      {/* Hero Section */}
      <section className="relative">
        <MainHero />
      </section>

      {/* Compact transition after hero to keep discovery flow as primary */}
      <section className="bg-white py-5 sm:py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="gm-section-title mb-3">{t('home.intro.question', 'Looking for the best places to eat and explore in Greece?')}</h2>
          <p className="gm-section-subtitle text-sm sm:text-base">{t('home.intro.answer', 'These curated maps and local picks highlight authentic tavernas, family-friendly spots and hidden gems, perfect for travelers and locals alike.')}</p>
        </div>
      </section>

      {/* Tours & Activities Section */}
      <LazyShow rootMargin="250px">
      <section className="gm-section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="gm-section-title mb-4">
              <span className="gm-heading-gradient">
                {t('navigation.getyourguide', 'Top Tours & Activities')}
              </span>
            </h2>
            <p className="gm-section-subtitle max-w-3xl mx-auto">
              {t('getyourguide.subtitle', 'Discover the best experiences Greece has to offer with our curated selection of tours and activities')}
            </p>
          </div>
          
          {/* Widget Container */}
          <div className="gm-panel gm-panel-strong overflow-hidden">
            <GetYourGuideWidget />
          </div>
        </div>
      </section>
      </LazyShow>

      {/* Islands/Destinations Section */}
      <LazyShow deferRender rootMargin="200px">
      <section className="gm-section gm-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="gm-section-title mb-4">
              <span className="gm-heading-gradient">
                {t('islands.title', 'Greek Destinations')}
              </span>
            </h2>
            <p className="gm-section-subtitle max-w-3xl mx-auto">
              {t('islands.subtitle', 'Explore the most beautiful islands and destinations across Greece')}
            </p>
          </div>
          
          <IslandList />
        </div>
      </section>
      </LazyShow>

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-14 sm:h-16">
          <Canvas />
        </div>
      </LazyShow>

      {/* Reviews Section */}
      <LazyShow deferRender rootMargin="200px">
      <Reviews />
      </LazyShow>

      {featureFlags.storeEnabled && (
        <LazyShow deferRender rootMargin="200px">
          <section className="gm-section gm-section-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-8">
                <h2 className="gm-section-title mb-4">
                  <span className="gm-heading-gradient">
                    {t('productShowcaseTitle', 'Travel Essentials')}
                  </span>
                </h2>
                <p className="gm-section-subtitle max-w-3xl mx-auto">
                  {t('productShowcase.subtitle', 'Carefully selected travel gear and essentials to enhance your Greek adventure')}
                </p>
              </div>

              {/* Product Showcase Container */}
              <div className="gm-panel p-5 sm:p-7">
                <ProductShowcase />
              </div>
            </div>
          </section>
        </LazyShow>
      )}

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-14 sm:h-16">
          <Canvas />
        </div>
      </LazyShow>

      {/* Maps & Lists Section */}
      <LazyShow deferRender rootMargin="200px">
      <section className="gm-section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="gm-section-title mb-4">
              <span className="gm-heading-gradient">
                {t('product.title', 'Curated Maps & Lists')}
              </span>
            </h2>
            <p className="gm-section-subtitle max-w-3xl mx-auto">
              {t('product.subtitle', 'Discover Greece through our expertly curated collection of maps and location lists')}
            </p>
          </div>
          
          <Product />
        </div>
      </section>
      </LazyShow>

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-14 sm:h-16">
          <Canvas />
        </div>
      </LazyShow>

      {/* Secondary discovery content: quieter visual priority while preserving SEO/internal links */}
      <section className="gm-section bg-slate-50/55 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <div className="gm-panel p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">
              {t('navigation.blog', 'Blog')}
            </p>
            <BlogHighlight allPosts={allPosts} />
          </div>

          <div className="gm-panel p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-800 mb-2 leading-snug">
              {t('home.linkHub.title', 'Explore Greece with static guides and lists')}
            </h2>
            <p className="text-slate-600 mb-5 text-sm sm:text-base">
              {t('home.linkHub.subtitle', 'Browse top area pages, curated category lists, and practical travel guides.')}
            </p>

            <div className="mb-5 flex flex-wrap gap-3">
              <Link href="/areas" className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-100">
                {t('navigation.areasHub', 'All Area Guides')}
              </Link>
              <Link href="/collections" className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-100">
                {t('navigation.collectionsHub', 'All Collections')}
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                  {t('home.linkHub.areas', 'Top areas')}
                </h3>
                <ul className="space-y-1.5">
                  {topAreaLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-cyan-800/90 hover:text-cyan-900 hover:underline focus-visible:rounded-sm">
                        {(currentLang === 'el' && link.labelEl) ? link.labelEl : link.label}
                      </Link>
                      {typeof link.count === 'number' ? (
                        <span className="ml-2 text-xs text-gray-500">({link.count} {t('home.linkHub.locations', 'locations')})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                  {t('home.linkHub.lists', 'Top lists')}
                </h3>
                <ul className="space-y-1.5">
                  {topListLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-cyan-800/90 hover:text-cyan-900 hover:underline focus-visible:rounded-sm">
                        {(currentLang === 'el' && link.labelEl) ? link.labelEl : link.label}
                      </Link>
                      {typeof link.count === 'number' ? (
                        <span className="ml-2 text-xs text-gray-500">({link.count} {t('home.linkHub.locations', 'locations')})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                  {t('home.linkHub.guides', 'Top guides')}
                </h3>
                <ul className="space-y-1.5">
                  {topGuideLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-cyan-800/90 hover:text-cyan-900 hover:underline focus-visible:rounded-sm">
                        {(currentLang === 'el' && link.labelEl) ? link.labelEl : link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <LazyShow deferRender rootMargin="200px">
      <AboutUs />
      </LazyShow>

      {/* FAQ Section */}
      <LazyShow deferRender rootMargin="200px">
      <QASection />
      </LazyShow>

      {/* Newsletter Section */}
      <LazyShow deferRender rootMargin="200px">
      <section className="gm-section" style={{ background: 'linear-gradient(130deg, var(--gm-sea-700) 0%, var(--gm-sea-500) 65%, var(--gm-sun-500) 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="gm-section-title text-white mb-4">
              {t('newsletter.title', 'Stay Updated')}
            </h2>
            <p className="gm-section-subtitle text-cyan-50 max-w-2xl mx-auto">
              {t('newsletter.subtitle', 'Get the latest travel tips, new destinations, and exclusive offers delivered to your inbox')}
            </p>
          </div>
          
          <div className="rounded-[var(--gm-radius-lg)] bg-white/14 backdrop-blur-sm p-8 border border-white/30 shadow-[var(--gm-shadow-2)]">
            <BrevoForm />
          </div>
        </div>
      </section>
      </LazyShow>

      {/* Final Section with lazy loading */}
      <LazyShow>
        <div className="relative h-24">
          <Canvas />
        </div>
      </LazyShow>
    </div>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const posts = getAllPosts()
  const elLocale = JSON.parse(readFileSync(join(process.cwd(), 'src', 'i18n', 'locales', 'el.json'), 'utf8'));
  const elCategoryNames: Record<string, string> = elLocale?.categories ?? {};
  const entitiesIndex = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: entitiesIndex.entities });

  const priorityAreaInputs = [
    'Cape Sounion',
    'Crete',
    'Thessaloniki',
    'Syntagma',
    'Plaka',
    'Psirri',
    'Parthenon',
    'Philopappos Hill',
    'Glyfada',
    'Piraeus',
    'Sepolia',
    'Vouliagmeni',
  ];

  const excludedAreaSlugs = new Set(['vyronas', 'dionysos', 'kamatero']);

  const priorityCategoryAreaInputs = [
    { categorySlug: 'greek-restaurants', areaSlug: 'plaka' },
    { categorySlug: 'coffee-brunch', areaSlug: 'glyfada' },
  ];

  type IntentCoverageArtifact = {
    generatedAreaRoutes?: string[];
    generatedCategoryAreaRoutes?: Array<{ categorySlug: string; areaSlug: string }>;
    highestDensityAreas?: Array<{ slug: string; count: number }>;
    strongestCategoryAreaCombinations?: Array<{ categorySlug: string; areaSlug: string; count: number }>;
  };

  let coverage: IntentCoverageArtifact = {};
  try {
    const coverageFile = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
    coverage = JSON.parse(readFileSync(coverageFile, 'utf8')) as IntentCoverageArtifact;
  } catch {
    coverage = {};
  }

  const generatedAreaRoutes = Array.isArray(coverage.generatedAreaRoutes) ? coverage.generatedAreaRoutes : [];
  const generatedCategoryAreaRoutes = Array.isArray(coverage.generatedCategoryAreaRoutes)
    ? coverage.generatedCategoryAreaRoutes
    : [];
  const highestDensityAreas = Array.isArray(coverage.highestDensityAreas)
    ? coverage.highestDensityAreas
    : [];
  const strongestCategoryAreaCombinations = Array.isArray(coverage.strongestCategoryAreaCombinations)
    ? coverage.strongestCategoryAreaCombinations
    : [];

  const areaCoveragePool: AreaCoverageEntry[] = [
    ...highestDensityAreas.map((item) => ({ slug: item.slug, score: item.count ?? 0 })),
    ...generatedAreaRoutes.map((slug, index) => ({ slug, score: Math.max(0, 10000 - index) })),
  ];

  const priorityAreaLinks: InternalHubLink[] = [];
  for (const input of priorityAreaInputs) {
    const resolvedArea = engine.resolver.resolveArea(input);
    if (!resolvedArea) {
      continue;
    }

    const payload = engine.query.getIntentResults({
      areaId: resolvedArea.id,
      limit: 1,
    });

    if (!payload || !payload.passesThreshold) {
      continue;
    }

    priorityAreaLinks.push({
      href: `/area/${resolvedArea.urlSlug}`,
      label: resolvedArea.nameEn || resolvedArea.name,
      labelEl: resolvedArea.name || undefined,
      count: payload.counts.totalInArea,
    });
  }

  type AreaPoolItem = { href: string; label: string; labelEl: string | undefined; score: number; count: number; region: string };
  const canonicalAreaPool = (areaCoveragePool
    .map((item) => {
      const resolvedArea = engine.resolver.resolveArea(item.slug);
      if (!resolvedArea) {
        return null;
      }

      const payload = engine.query.getIntentResults({
        areaId: resolvedArea.id,
        limit: 1,
      });

      if (!payload || !payload.passesThreshold) {
        return null;
      }

      return {
        href: `/area/${resolvedArea.urlSlug}`,
        label: resolvedArea.nameEn || resolvedArea.name,
        labelEl: resolvedArea.name || undefined,
        score: item.score,
        count: payload.counts.totalInArea,
        region: (resolvedArea.regionEn || resolvedArea.region || 'unknown').toLowerCase(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a as AreaPoolItem | null;
      const right = b as AreaPoolItem | null;
      return (right?.score ?? 0) - (left?.score ?? 0);
    })) as AreaPoolItem[];

  const uniqueAreaByHref = new Map<string, AreaPoolItem>();
  for (const item of canonicalAreaPool) {
    if (!uniqueAreaByHref.has(item.href)) {
      uniqueAreaByHref.set(item.href, item);
    }
  }

  const uniqueAreaCandidates = Array.from(uniqueAreaByHref.values());
  const topAreaLinks: InternalHubLink[] = [];
  const usedRegions = new Set<string>();

  for (const item of priorityAreaLinks) {
    if (topAreaLinks.length >= 12) {
      break;
    }

    if (topAreaLinks.some((existing) => existing.href === item.href)) {
      continue;
    }

    topAreaLinks.push(item);
  }

  for (const area of uniqueAreaCandidates) {
    if (topAreaLinks.length >= 12) {
      break;
    }
    if (usedRegions.has(area.region)) {
      continue;
    }
    if (excludedAreaSlugs.has(area.href.replace('/area/', ''))) continue;
    topAreaLinks.push({ href: area.href, label: area.label, labelEl: area.labelEl, count: area.count });
    usedRegions.add(area.region);
  }

  for (const area of uniqueAreaCandidates) {
    if (topAreaLinks.length >= 12) {
      break;
    }
    if (topAreaLinks.some((existing) => existing.href === area.href)) {
      continue;
    }
    if (excludedAreaSlugs.has(area.href.replace('/area/', ''))) continue;
    topAreaLinks.push({ href: area.href, label: area.label, labelEl: area.labelEl, count: area.count });
  }

  const categoryAreaCoveragePool: CategoryAreaCoverageEntry[] = [
    ...strongestCategoryAreaCombinations.map((item) => ({
      categorySlug: item.categorySlug,
      areaSlug: item.areaSlug,
      score: item.count ?? 0,
    })),
    ...generatedCategoryAreaRoutes.map((item, index) => ({
      categorySlug: item.categorySlug,
      areaSlug: item.areaSlug,
      score: Math.max(0, 10000 - index),
    })),
  ];

  type ListPoolItem = { href: string; label: string; labelEl: string; score: number; count: number; areaSlug: string; categorySlug: string };
  const canonicalListPool = (categoryAreaCoveragePool
    .map((item) => {
      const resolution = engine.resolver.resolveIntent(item.categorySlug, item.areaSlug);
      if (resolution.status !== 'resolved' || !resolution.category || !resolution.area) {
        return null;
      }

       const payload = engine.query.getIntentResults({
         categoryId: resolution.category.id,
         areaId: resolution.area.id,
         limit: 1,
       });

      if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
        return null;
      }

      const categoryLabel = resolution.category.name;
      const areaLabel = resolution.area.nameEn || resolution.area.name;
      const categoryLabelEl = elCategoryNames[resolution.category.id] || categoryLabel;
      const areaLabelEl = resolution.area.name || areaLabel;

      return {
        href: `/${resolution.category.urlSlug}/${resolution.area.urlSlug}`,
        label: `${categoryLabel} in ${areaLabel}`,
        labelEl: `${categoryLabelEl} – ${areaLabelEl}`,
        score: item.score,
        count: payload.counts.totalCategoryArea,
        areaSlug: resolution.area.urlSlug,
        categorySlug: resolution.category.urlSlug,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a as ListPoolItem | null;
      const right = b as ListPoolItem | null;
      return (right?.score ?? 0) - (left?.score ?? 0);
    })) as ListPoolItem[];

  const uniqueListByHref = new Map<string, ListPoolItem>();
  for (const item of canonicalListPool) {
    if (!uniqueListByHref.has(item.href)) {
      uniqueListByHref.set(item.href, item);
    }
  }

  const uniqueListCandidates = Array.from(uniqueListByHref.values());
  const topListLinks: InternalHubLink[] = [];
  const usedListAreas = new Set<string>();
  const usedListCategories = new Set<string>();

  for (const item of priorityCategoryAreaInputs) {
    const resolution = engine.resolver.resolveIntent(item.categorySlug, item.areaSlug);
    if (resolution.status !== 'resolved' || !resolution.category || !resolution.area) {
      continue;
    }

    const payload = engine.query.getIntentResults({
      categoryId: resolution.category.id,
      areaId: resolution.area.id,
      limit: 1,
    });

    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      continue;
    }

    const href = `/${resolution.category.urlSlug}/${resolution.area.urlSlug}`;
    const label = `${resolution.category.name} in ${resolution.area.nameEn || resolution.area.name}`;
    const labelEl = `${elCategoryNames[resolution.category.id] || resolution.category.name} – ${resolution.area.name || resolution.area.nameEn || ''}`;

    if (topListLinks.some((existing) => existing.href === href)) {
      continue;
    }

    topListLinks.push({ href, label, labelEl, count: payload.counts.totalCategoryArea });
    usedListAreas.add(resolution.area.urlSlug);
    usedListCategories.add(resolution.category.urlSlug);
  }

  for (const item of uniqueListCandidates) {
    if (topListLinks.length >= 12) {
      break;
    }
    if (usedListAreas.has(item.areaSlug) || usedListCategories.has(item.categorySlug)) {
      continue;
    }
    topListLinks.push({ href: item.href, label: item.label, labelEl: item.labelEl, count: item.count });
    usedListAreas.add(item.areaSlug);
    usedListCategories.add(item.categorySlug);
  }

  for (const item of uniqueListCandidates) {
    if (topListLinks.length >= 12) {
      break;
    }
    if (topListLinks.some((existing) => existing.href === item.href)) {
      continue;
    }
    if (usedListAreas.has(item.areaSlug)) {
      continue;
    }
    topListLinks.push({ href: item.href, label: item.label, labelEl: item.labelEl, count: item.count });
    usedListAreas.add(item.areaSlug);
    usedListCategories.add(item.categorySlug);
  }

  for (const item of uniqueListCandidates) {
    if (topListLinks.length >= 12) {
      break;
    }
    if (topListLinks.some((existing) => existing.href === item.href)) {
      continue;
    }
    if (usedListCategories.has(item.categorySlug)) {
      continue;
    }
    topListLinks.push({ href: item.href, label: item.label, labelEl: item.labelEl, count: item.count });
    usedListAreas.add(item.areaSlug);
    usedListCategories.add(item.categorySlug);
  }

  for (const item of uniqueListCandidates) {
    if (topListLinks.length >= 12) {
      break;
    }
    if (topListLinks.some((existing) => existing.href === item.href)) {
      continue;
    }
    topListLinks.push({ href: item.href, label: item.label, labelEl: item.labelEl, count: item.count });
  }

  const elGuideTitles = new Map(
    posts
      .filter((p) => p.language === 'el')
      .map((p) => [p.originalSlug || p.slug.replace(/-el$/, ''), p.title])
  );
  const topGuideLinks = posts
    .filter((post) => post.language === 'en' && isPriorityGuide(post))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 10)
    .map((post) => {
      const slug = post.originalSlug || post.slug.replace(/-el$/, '');
      return {
        href: `/blog/${slug}`,
        label: post.title,
        labelEl: elGuideTitles.get(slug),
      };
    });

  // only send minimal fields to reduce page payload
  const minimal = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((p) => ({ slug: p.slug, title: p.title, date: p.date, summary: p.summary, language: p.language, originalSlug: p.originalSlug }))

  return {
    props: {
      allPosts: minimal,
      topAreaLinks,
      topListLinks,
      topGuideLinks,
    },
  };
};

export default App;
