import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import Script from 'next/script';

import * as gtag from '../lib/gtag';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID || typeof window === 'undefined') return;

    const handleConsent = () => {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('cookieyes-consent='));

      if (!cookie) return;

      const value = decodeURIComponent(cookie.split('=')[1] ?? '');

      const analyticsMatch = value.match(/analytics:([^,]*)/);
      const analyticsValue = analyticsMatch?.[1]?.trim();

      const isGranted =
        analyticsValue === 'yes' ||
        analyticsValue === 'true' ||
        analyticsValue === '1';

      if (isGranted && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });

        window.gtag('config', gtag.GA_TRACKING_ID);
      }
    };

    window.addEventListener('cookieyes_consent_update', handleConsent);

    handleConsent();

    return () => {
      window.removeEventListener('cookieyes_consent_update', handleConsent);
    };
  }, []);

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID) {
      return;
    }

    const handleRouteChange = (url: string) => {
      if (typeof window.gtag === 'function') {
        gtag.pageview(url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {gtag.GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
          />

          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;

              gtag('consent', 'default', {
                analytics_storage: 'denied'
              });

              gtag('js', new Date());
            `}
          </Script>
        </>
      )}
    </>
  );
};

export default App;
