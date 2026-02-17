"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';

const GetYourGuideWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Install integration analyzer / analytics script if not already present
    if (!document.querySelector('script[data-gyg-partner-id="V2LLO22"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
      script.setAttribute("data-gyg-partner-id", "V2LLO22");
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="gyg-widget-wrapper mb-8" aria-label={t('getyourguide.widgetTitle', 'Top Tours & Activities')}>
      {/* Accessible heading for the widget (visually hidden to avoid repeating section header) */}
      <h3 className="sr-only">{t('getyourguide.widgetTitle', 'Top Tours & Activities')}</h3>
      <p className="sr-only">{t('getyourguide.widgetDescription', 'Discover the best experiences Greece has to offer with our curated selection of tours and activities')}</p>

      <div ref={containerRef} className="gyg-widget-container">
        {/* GetYourGuide Tour CTA Card with Image */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Image Section */}
            <div className="w-full lg:w-2/5 flex-shrink-0">
              <img
                src="/assets/images/meteora1-560.webp"
                srcSet="/assets/images/meteora1-560.webp 560w, /assets/images/meteora1-840.webp 840w"
                sizes="(min-width: 1024px) 320px, 100vw"
                alt={t('getyourguide.meteoraImageAlt', 'Meteora Monasteries - Ancient rock formations with monasteries')}
                className="w-full h-full object-cover min-h-80 lg:min-h-full"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* Content Section */}
            <div className="w-full lg:w-3/5 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {t('getyourguide.meteoraTitle', 'Meteora Monasteries Day Trip')}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('getyourguide.meteoraDescription', 'Explore the ancient monasteries of Meteora, perched atop towering rock pillars. This full-day tour includes visits to caves, stunning views, and a traditional Greek lunch.')}
              </p>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{t('getyourguide.highlights.fullDayFromAthens', 'Full-day guided tour from Athens')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{t('getyourguide.highlights.monasteriesAndCaves', 'Visit ancient monasteries & caves')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{t('getyourguide.highlights.lunchIncluded', 'Traditional Greek lunch included')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{t('getyourguide.highlights.hotelPickup', 'Hotel pickup & drop-off available')}</span>
                </li>
              </ul>
              <a
                href="https://www.getyourguide.com/athens-l91/athens-meteora-monasteries-day-trip-with-caves-and-lunch-t88898/?partner_id=V2LLO22"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t('getyourguide.bookButton', 'Book on GetYourGuide')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetYourGuideWidget;