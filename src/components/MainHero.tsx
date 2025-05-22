'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import MyTicker from '../components/Ticker';

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
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Ticker */}
      <div className="absolute top-0 left-0 w-full z-20">
        <MyTicker />
      </div>

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/device.webp"
          alt="Background Illustration"
          fill
          className="object-cover object-center brightness-75 blur-[1.2px] transition-all duration-700"
          priority
          quality={95}
          sizes="100vw"
          aria-hidden="true"
        />
        {/* Stronger gradient overlay for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 pt-0 py-6 sm:px-8 lg:px-12 max-w-screen-xl w-full text-center flex flex-col items-center">
        <h1 className="text-white font-primary font-extrabold leading-tight tracking-tight text-4xl sm:text-5xl md:text-6xl">
          <span className="block text-[#0878fe] mb-2">
            {t('mainHero.subtitle')}
          </span>
          <span className="block">
            {t('mainHero.title')}
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl max-w-2xl text-white font-secondary leading-relaxed">
          {t('mainHero.description')}
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 sm:justify-center">
          {/* Primary CTA */}
          <a
            href={mainHero.primaryAction.href}
            className="inline-flex min-w-[280px] items-center justify-center px-8 py-4 text-lg font-bold text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-300"
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
            className="inline-flex min-w-[220px] items-center justify-center px-8 py-4 text-lg font-bold text-[#0878fe] bg-white border border-[#0878fe] rounded-xl shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-300"
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
