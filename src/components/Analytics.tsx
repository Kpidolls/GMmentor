import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import Script from 'next/script';

import * as gtag from '../lib/gtag';

const App = () => {
  const router = useRouter();
  const pageviewSent = useRef(false);

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID || typeof window === 'undefined') return;

    console.log('GA ID:', gtag.GA_TRACKING_ID);

    const analyticsWindow = window as Window & {
      dataLayer?: unknown[][];
    };

    analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
    function gtagInit(...args: unknown[]) {
      analyticsWindow.dataLayer?.push(args);
    }
    window.gtag = window.gtag || gtagInit;

    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });

    window.gtag('js', new Date());

    window.gtag('config', gtag.GA_TRACKING_ID, {
      send_page_view: false,
    });

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });

    gtag.pageview(window.location.pathname + window.location.search);

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

      if (isGranted) {
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted',
        });

        if (!pageviewSent.current) {
          gtag.pageview(window.location.pathname + window.location.search);
          pageviewSent.current = true;
        }
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
        <Script
          id="ga4-tag"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        />
      )}
    </>
  );
};

export default App;
