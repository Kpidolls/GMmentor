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
        {/* Embedded GetYourGuide city widget configured per request */}
        <div
          data-gyg-href="https://widget.getyourguide.com/default/city.frame"
          data-gyg-location-id="169010"
          data-gyg-locale-code="en-US"
          data-gyg-widget="city"
          data-gyg-partner-id="V2LLO22"
        ></div>
      </div>
      {/* GetYourGuide Analytics script is injected via useEffect above */}
    </div>
  );
};

export default GetYourGuideWidget;