'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import MyTicker from '../components/Ticker'; // Import your ticker component

const MainHero = () => {
  const { mainHero } = config;
  const { t } = useTranslation();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(
        (prevIndex) =>
          (prevIndex + 1) % Object.keys(mainHero.primaryAction.text).length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [mainHero.primaryAction.text]);

  return (
    <main className="relative min-h-[90vh]">
      {/* Ticker */}
      <div className="absolute top-0 left-0 w-full z-20">
        <MyTicker />
      </div>

      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/Designer.webp"
          alt="Background Illustration"
          fill
          className="object-cover object-center"
          priority
          quality={70}
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-full mx-auto px-6 py-24 sm:px-8 lg:px-12 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-primary font-extrabold tracking-tight text-white leading-tight">
          <span className="block text-[#0878fe] mb-2">{t('mainHero.subtitle')}</span>
          <span className="block text-white">{t('mainHero.title')}</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white font-secondary max-w-2xl leading-relaxed">
          {t('mainHero.description')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-6">
          <a
            href={mainHero.primaryAction.href}
            className="inline-flex min-w-[300px] items-center justify-center px-8 py-4 text-lg font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-300"
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
          <a
            href={mainHero.secondaryAction.href}
            className="inline-flex items-center justify-center min-w-[220px] px-8 py-4 text-lg font-bold text-[#0878fe] border border-[#0878fe] bg-white rounded-lg shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-300"
            aria-label={t('mainHero.secondaryAction.text')}
          >
            {t('mainHero.secondaryAction.text')}
          </a>
        </div>
      </div>
    </main>
  );
};

export default MainHero;
