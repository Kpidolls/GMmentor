// import Link from 'next/link';
import React from 'react';
import AboutUs from '../components/AboutUs';
import Analytics from '../components/Analytics';
import Canvas from '../components/Canvas';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import Product from '../components/Product';
import QASection from '../components/QASection';
import IslandList from '../components/IslandList';
import ProductShowcase from '../components/ProductShowcase';
import '../i18n';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Reviews from '../components/Reviews';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';

const BrevoForm = dynamic(() => import('../components/BrevoForm'), { ssr: false });
const GetYourGuideWidget = dynamic(() => import('../components/GetYourGuideWidget'), { ssr: false });

const App = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white">
      <Head>
        <title>{t('meta.homeTitle')}</title>
        <meta
          name="description"
          content={t('meta.homeDescription')}
        />
        <link rel="canonical" href="https://googlementor.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={t('meta.homeDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://googlementor.com" />
        <meta property="og:image" content="https://googlementor.com/assets/images/cover.webp" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Hero Section */}
      <section className="relative">
        <MainHero />
      </section>

      {/* Tours & Activities Section */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl transform rotate-1" />
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <GetYourGuideWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Islands/Destinations Section */}
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

      {/* Canvas Divider */}
      <div className="relative h-24">
        <Canvas />
      </div>

      {/* Reviews Section */}
      <Reviews />

      {/* Product Showcase Section */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-pink-50 rounded-3xl transform -rotate-1" />
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <ProductShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Canvas Divider */}
      <div className="relative h-24">
        <Canvas />
      </div>

      {/* Maps & Lists Section */}
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

      {/* Canvas Divider */}
      <div className="relative h-24">
        <Canvas />
      </div>

      {/* About Us Section */}
      <AboutUs />

      {/* FAQ Section */}
      <QASection />

      {/* Newsletter Section */}
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

      {/* Final Section with lazy loading */}
      <LazyShow>
        <div className="relative h-24">
          <Canvas />
        </div>
      </LazyShow>

      {/* Analytics */}
      <Analytics />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default App;
