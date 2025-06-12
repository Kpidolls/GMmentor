// import Link from 'next/link';
import React from 'react';
import About from '../components/About'; 
import AboutUs from '../components/AboutUs';
import Analytics from '../components/Analytics';
import BrevoForm from '../components/BrevoForm';
import Canvas from '../components/Canvas';
import Header from '../components/Header';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import Product from '../components/Product';
import QASection from '../components/QASection';
import BackToTop from '../components/BackToTop';
import IslandList from '../components/IslandList';
import CategoryCards from '../components/CategoryCards';
import ProductShowcase from '../components/ProductShowcase';
import '../i18n';
import GetYourGuideWidget from '../components/GetYourGuideWidget';
import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Reviews from '../components/Reviews';

const App = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-background grid">
      <Head>
        <title>{t('meta.homeTitle')} {new Date().getFullYear()}</title>
        <meta
          name="description"
          content={t('meta.homeDescription')}
        />
        <link rel="canonical" href="https://googlementor.com" />
      </Head>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background">
        <Header />
      </div>
      <div className="relative bg-background overflow-hidden">
        <div className="max-w-full mx-auto">
          <div
            className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32"
          >
            <MainHero />
            <Box mt={10} px={4}>
              <h1 className="text-4xl font-primary font-bold mb-4">
                {t('navigation.getyourguide')}
              </h1>
              <GetYourGuideWidget />
            </Box>
            <Box mt={10} px={4}>
               <Reviews />
            </Box>

            <Box mt={10} px={4}>
            <h2 className="text-4xl font-primary font-bold mb-4">
               {t('mainHero.subtitle')} {new Date().getFullYear()}
            </h2>
            </Box>
            <CategoryCards />
          </div>
        </div>
      </div>
      <>
      <Box mt={10} px={4}>
          <h2 className="text-4xl font-primary font-bold mb-4">
            {t('islands.title')}
          </h2>
      <IslandList />
      </Box>

        <Canvas />
        <Box mt={10} px={4}>
            <h2 className="text-4xl font-primary font-bold mb-4">
              {t('productShowcaseTitle')}
            </h2>
        <ProductShowcase />
        </Box>
        <Canvas />
        <Box mt={10} px={4}>
          <h2 className="text-4xl font-primary font-bold mb-4">
              {t('product.title')}
          </h2>
        <Product />
        </Box>
        <Canvas />
      </>
      <AboutUs />
      <QASection />
      <BrevoForm />
      <LazyShow>
        <>
          <Canvas />
          <About />
        </>
      </LazyShow>
      <Analytics />
      <BackToTop />
    </div>
  );
};

export default App;
