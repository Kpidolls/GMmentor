import Link from 'next/link';
import React from 'react';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import '../i18n';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { metaDescriptions } from '../config/metaDescriptions';
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
  const { t } = useTranslation();
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
          content={metaDescriptions.home}
        />
        <link rel="canonical" href="https://googlementor.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={t('meta.homeDescriptionShort')} />
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

      {/* Make Blog more prominent: place BlogHighlight higher on the page */}
      {/* Blog highlight inserted here (minimal posts passed) */}
      <BlogHighlight allPosts={allPosts} />

      {/* Short AI-friendly intro for the homepage */}
      <section className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.intro.question', 'Looking for the best places to eat and explore in Greece?')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('home.intro.answer', 'These curated maps and local picks highlight authentic tavernas, family-friendly spots and hidden gems, perfect for travelers and locals alike.')}</p>
        </div>
      </section>

      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('home.linkHub.title', 'Explore Greece with static guides and lists')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('home.linkHub.subtitle', 'Browse top area pages, curated category lists, and practical travel guides.')}
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {t('home.linkHub.areas', 'Top areas')}
                </h3>
                <ul className="space-y-2">
                  {topAreaLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-blue-700 hover:text-blue-900 hover:underline">
                        {link.label}
                      </Link>
                      {typeof link.count === 'number' ? (
                        <span className="ml-2 text-sm text-gray-500">({link.count} locations)</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {t('home.linkHub.lists', 'Top lists')}
                </h3>
                <ul className="space-y-2">
                  {topListLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-blue-700 hover:text-blue-900 hover:underline">
                        {link.label}
                      </Link>
                      {typeof link.count === 'number' ? (
                        <span className="ml-2 text-sm text-gray-500">({link.count} locations)</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {t('home.linkHub.guides', 'Top guides')}
                </h3>
                <ul className="space-y-2">
                  {topGuideLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-blue-700 hover:text-blue-900 hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours & Activities Section */}
      <LazyShow rootMargin="250px">
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                {t('navigation.getyourguide', 'Top Tours & Activities')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('getyourguide.subtitle', 'Discover the best experiences Greece has to offer with our curated selection of tours and activities')}
            </p>
            <div className="mt-6 mx-auto w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
          </div>
          
          {/* Widget Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-50 rounded-3xl transform rotate-1" />
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <GetYourGuideWidget />
            </div>
          </div>
        </div>
      </section>
      </LazyShow>

      {/* Islands/Destinations Section */}
      <LazyShow deferRender rootMargin="200px">
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                {t('islands.title', 'Greek Destinations')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('islands.subtitle', 'Explore the most beautiful islands and destinations across Greece')}
            </p>
            <div className="mt-6 mx-auto w-32 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
          </div>
          
          <IslandList />
        </div>
      </section>
      </LazyShow>

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-24">
          <Canvas />
        </div>
      </LazyShow>

      {/* Reviews Section */}
      <LazyShow deferRender rootMargin="200px">
      <Reviews />
      </LazyShow>

      {featureFlags.storeEnabled && (
        <LazyShow deferRender rootMargin="200px">
          <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    {t('productShowcaseTitle', 'Travel Essentials')}
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {t('productShowcase.subtitle', 'Carefully selected travel gear and essentials to enhance your Greek adventure')}
                </p>
                <div className="mt-6 mx-auto w-32 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
              </div>

              {/* Product Showcase Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-50 rounded-3xl transform -rotate-1" />
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <ProductShowcase />
                </div>
              </div>
            </div>
          </section>
        </LazyShow>
      )}

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-24">
          <Canvas />
        </div>
      </LazyShow>

      {/* Maps & Lists Section */}
      <LazyShow deferRender rootMargin="200px">
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t('product.title', 'Curated Maps & Lists')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('product.subtitle', 'Discover Greece through our expertly curated collection of maps and location lists')}
            </p>
            <div className="mt-6 mx-auto w-32 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full" />
          </div>
          
          <Product />
        </div>
      </section>
      </LazyShow>

      {/* Canvas Divider */}
      <LazyShow deferRender rootMargin="200px">
        <div className="relative h-24">
          <Canvas />
        </div>
      </LazyShow>

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
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('newsletter.title', 'Stay Updated')}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('newsletter.subtitle', 'Get the latest travel tips, new destinations, and exclusive offers delivered to your inbox')}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
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
  const entitiesIndex = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: entitiesIndex.entities });

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

  const canonicalAreaPool = areaCoveragePool
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
        score: item.score,
        count: payload.counts.totalInArea,
        region: (resolvedArea.regionEn || resolvedArea.region || 'unknown').toLowerCase(),
      };
    })
    .filter((item): item is { href: string; label: string; score: number; count: number; region: string } => Boolean(item))
    .sort((left, right) => right.score - left.score);

  const uniqueAreaByHref = new Map<string, { href: string; label: string; score: number; count: number; region: string }>();
  for (const item of canonicalAreaPool) {
    if (!uniqueAreaByHref.has(item.href)) {
      uniqueAreaByHref.set(item.href, item);
    }
  }

  const uniqueAreaCandidates = Array.from(uniqueAreaByHref.values());
  const topAreaLinks: InternalHubLink[] = [];
  const usedRegions = new Set<string>();

  for (const area of uniqueAreaCandidates) {
    if (topAreaLinks.length >= 12) {
      break;
    }
    if (usedRegions.has(area.region)) {
      continue;
    }
    topAreaLinks.push({ href: area.href, label: area.label, count: area.count });
    usedRegions.add(area.region);
  }

  for (const area of uniqueAreaCandidates) {
    if (topAreaLinks.length >= 12) {
      break;
    }
    if (topAreaLinks.some((existing) => existing.href === area.href)) {
      continue;
    }
    topAreaLinks.push({ href: area.href, label: area.label, count: area.count });
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

  const canonicalListPool = categoryAreaCoveragePool
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

      return {
        href: `/${resolution.category.urlSlug}/${resolution.area.urlSlug}`,
        label: `${resolution.category.name} in ${resolution.area.name}`,
        score: item.score,
        count: payload.counts.totalCategoryArea,
        areaSlug: resolution.area.urlSlug,
        categorySlug: resolution.category.urlSlug,
      };
    })
    .filter((item): item is { href: string; label: string; score: number; count: number; areaSlug: string; categorySlug: string } => Boolean(item))
    .sort((left, right) => right.score - left.score);

  const uniqueListByHref = new Map<string, { href: string; label: string; score: number; count: number; areaSlug: string; categorySlug: string }>();
  for (const item of canonicalListPool) {
    if (!uniqueListByHref.has(item.href)) {
      uniqueListByHref.set(item.href, item);
    }
  }

  const uniqueListCandidates = Array.from(uniqueListByHref.values());
  const topListLinks: InternalHubLink[] = [];
  const usedListAreas = new Set<string>();
  const usedListCategories = new Set<string>();

  for (const item of uniqueListCandidates) {
    if (topListLinks.length >= 12) {
      break;
    }
    if (usedListAreas.has(item.areaSlug) || usedListCategories.has(item.categorySlug)) {
      continue;
    }
    topListLinks.push({ href: item.href, label: item.label, count: item.count });
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
    topListLinks.push({ href: item.href, label: item.label, count: item.count });
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
    topListLinks.push({ href: item.href, label: item.label, count: item.count });
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
    topListLinks.push({ href: item.href, label: item.label, count: item.count });
  }

  const topGuideLinks = posts
    .filter((post) => post.language === 'en' && isPriorityGuide(post))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 10)
    .map((post) => ({
      href: `/blog/${post.slug}`,
      label: post.title,
    }));

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
