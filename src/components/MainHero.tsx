'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import dynamic from 'next/dynamic';
// import Image from 'next/image';
import Head from 'next/head';

const MyTicker = dynamic(() => import('../components/Ticker'), { ssr: false });

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
    <>
      <Head>
        <title>Googlementor – Travel lists for trip planning</title>
        <meta
          name="description"
          content="Explore curated Google Maps lists that help you travel like a pro with Googlementor."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Googlementor – Travel Better" />
        <meta
          property="og:description"
          content="Curated tools and location suggestions for smarter travel."
        />
        <meta property="og:image" content="/assets/images/cover.webp" />
        <meta property="og:url" content="https://www.googlementor.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Ticker */}
        <div className="absolute top-0 left-0 w-full z-30">
          <MyTicker />
        </div>

        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          {/* <Image
            src="/assets/images/cover.webp"
            alt="Map and travel items on a table"
            fill
            priority
            quality={90}
            placeholder="blur"
            blurDataURL="/assets/images/cover-blur.webp"
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'opacity 0.5s ease-in-out',
              filter: 'brightness(1.15) contrast(1.15) saturate(1.2)',
            }}
          /> */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" /> */}
        </div>

        {/* Hero content */}
        <section
          className="relative z-20 px-6 sm:px-10 lg:px-20 py-14 sm:py-20 lg:py-28 max-w-screen-xl w-full text-center flex flex-col items-center"
          aria-label="Hero: Googlementor Travel Tools"
        >
          <header>
            <h1 className="text-white font-primary font-extrabold leading-tight tracking-tight text-4xl sm:text-5xl md:text-6xl drop-shadow-md mb-6">
              <span className="block text-[#0878fe] mb-2 text-xl sm:text-2xl md:text-3xl tracking-wider uppercase">
                {t('mainHero.subtitle')}
              </span>
              <span className="block">
                {t('mainHero.title')}
              </span>
            </h1>
          </header>

          <p className="mt-2 text-base sm:text-xl md:text-2xl max-w-2xl text-white/90 font-secondary leading-relaxed drop-shadow-sm">
            {t('mainHero.description')}
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-5 sm:gap-8 sm:justify-center w-full max-w-2xl">
            <a
              href={mainHero.primaryAction.href}
              className="inline-flex min-w-[220px] sm:min-w-[260px] items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#0878fe] to-[#0053b8] rounded-xl shadow-xl hover:scale-105 hover:brightness-110 transition duration-300"
              aria-label={t(`mainHero.primaryAction.text.${currentTextIndex}`)}
            >
              {t(`mainHero.primaryAction.text.${currentTextIndex}`)}
            </a>

            <a
              href={mainHero.secondaryAction.href}
              className="inline-flex min-w-[180px] sm:min-w-[220px] items-center justify-center px-8 py-4 text-lg font-semibold text-[#0878fe] bg-white border-2 border-[#0878fe] rounded-xl shadow-lg hover:bg-blue-50 hover:text-[#0053b8] hover:border-[#0053b8] hover:scale-105 transition duration-300"
              aria-label="Buy travel gear from our store"
            >
              {t('mainHero.secondaryAction.text')}
            </a>
          </div>
        </section>
      </main>
    </>
  );
};

export default MainHero;
