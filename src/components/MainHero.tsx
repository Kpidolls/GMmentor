'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import MyTicker from '../components/Ticker';
import products from '../data/products.json';
// import store from '../pages/store';


const MainHero = () => {
  const { mainHero } = config;
  const { t } = useTranslation();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(
        (prevIndex) =>
          (prevIndex + 1) % Object.keys(mainHero.primaryAction.text).length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [mainHero.primaryAction.text]);

  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentProduct = products[currentProductIndex];

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Ticker */}
      <div className="absolute top-0 left-0 w-full z-20">
        <MyTicker />
      </div>

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/cover.webp"
          alt="Background Illustration"
          fill
          className="object-cover object-center brightness-90 blur-[1.1px] transition-all duration-700"
          priority
          quality={95}
          sizes="100vw"
          aria-hidden="true"
        />
        {/* Stronger gradient overlay for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-10 sm:py-16 lg:py-24 max-w-screen-xl w-full text-center flex flex-col items-center">
        <h1 className="text-white font-primary font-extrabold leading-tight tracking-tight text-3xl sm:text-5xl md:text-6xl drop-shadow-lg">
          <span className="block text-[#0878fe] mb-2 text-lg sm:text-2xl md:text-3xl tracking-wider">
            {t('mainHero.subtitle')}
          </span>
          <span className="block">
            {t('mainHero.title')}
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl md:text-2xl max-w-2xl text-white font-secondary leading-relaxed opacity-90 drop-shadow">
          {t('mainHero.description')}
        </p>
        
        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-5 sm:gap-8 sm:justify-center w-full max-w-2xl">
          {/* Primary CTA */}
          <a
            href={mainHero.primaryAction.href}
            className="inline-flex min-w-[220px] sm:min-w-[260px] items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#0878fe] to-[#0053b8] rounded-2xl shadow-xl hover:from-[#0053b8] hover:to-[#0878fe] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#0878fe]/40 transition-all duration-300"
            aria-label={t(`mainHero.primaryAction.text.${currentTextIndex}`)}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTextIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {t(`mainHero.primaryAction.text.${currentTextIndex}`)}
              </motion.span>
            </AnimatePresence>
          </a>

          {/* Secondary CTA */}
          <a
            href={mainHero.secondaryAction.href}
            className="inline-flex min-w-[180px] sm:min-w-[220px] items-center justify-center px-8 py-4 text-lg font-bold text-[#0878fe] bg-white border-2 border-[#0878fe] rounded-2xl shadow-lg hover:bg-blue-50 hover:text-[#0053b8] hover:border-[#0053b8] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#0878fe]/30 transition-all duration-300"
            aria-label={t('mainHero.secondaryAction.text')}
          >
            {t('mainHero.secondaryAction.text')}
          </a>
        </div>

        {/* Product Showcase */}
        {currentProduct && (
          <div className="w-full flex flex-col items-center justify-center mt-10 mb-4">
            <a
              href={currentProduct.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row items-center gap-4 bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg mx-auto transition-all duration-300 hover:scale-105 hover:shadow-blue-200/60 backdrop-blur-md border border-gray-100"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-md bg-gray-50">
                <img
                  src={currentProduct.image}
                  alt='Product Image'
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                  {t(`store.products.${currentProduct.translationKey}.name`)}
                </h3>
                <span className="inline-block mt-2 text-[#0878fe] font-semibold underline underline-offset-2 group-hover:text-[#0053b8] transition-colors">
                  {t('mainHero.viewProduct', { defaultValue: 'View Product' })}
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainHero;
