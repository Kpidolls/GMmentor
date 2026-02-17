// import Link from 'next/link';
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

const App = ({ allPosts }: { allPosts: MinimalPost[] }) => {
  const { t } = useTranslation();
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
        <link
          rel="preload"
          as="image"
          href="/assets/images/cover-627.webp"
          type="image/webp"
          imageSrcSet="/assets/images/cover-480.webp 480w, /assets/images/cover-627.webp 627w"
          imageSizes="100vw"
        />
        {/* FAQPage JSON-LD for common quick questions on the homepage (localized) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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

      {/* Product Showcase Section */}
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

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts()
  // only send minimal fields to reduce page payload
  const minimal = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((p) => ({ slug: p.slug, title: p.title, date: p.date, summary: p.summary, language: p.language, originalSlug: p.originalSlug }))

  return {
    props: { allPosts: minimal },
  };
};

export default App;
