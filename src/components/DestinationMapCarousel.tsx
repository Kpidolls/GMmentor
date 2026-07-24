import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import islands from '../data/islands.json';

type DestinationEntry = {
  id: string;
  title: string;
  img: string;
  locationImg?: string;
};

const ROTATION_MS = 4500;

export default function DestinationMapCarousel() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(
    () =>
      (islands as DestinationEntry[])
        .filter((entry) => Boolean(entry.locationImg || entry.img))
        .map((entry) => ({
          id: entry.id,
          title: entry.title,
          image: entry.locationImg || entry.img,
        })),
    []
  );

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, ROTATION_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex % slides.length]!;

  return (
    <section className="bg-white pb-7 sm:pb-9" aria-label={t('home.mapCarousel.ariaLabel', 'Destination map preview carousel')}>
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/destination/${encodeURIComponent(activeSlide.id)}`}
          className="group block rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          aria-label={t('home.mapCarousel.openDestination', {
            destination: t(activeSlide.title),
            defaultValue: 'Open {{destination}} destination page',
          })}
        >
          <div className="relative h-52 sm:h-72 md:h-80 w-full bg-slate-100">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-[400ms] ease-in-out ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={index !== activeIndex}
              >
                <Image
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover blur-sm scale-105 opacity-35"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 896px"
                  priority={index === 0}
                />
                <Image
                  src={slide.image}
                  alt={t('islands.locationScreenshotAlt', {
                    title: t(slide.title),
                    defaultValue: '{{title}} locations screenshot',
                  })}
                  fill
                  className="object-contain object-center p-1.5 sm:p-2"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 896px"
                  priority={index === 0}
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/68 via-slate-900/18 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-white text-lg sm:text-xl font-semibold tracking-tight leading-tight">
                {t(activeSlide.title)}
              </p>
              <p className="mt-1 text-slate-100/95 text-xs sm:text-sm">
                {t('destination.mapPreview', 'Map preview')}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}