import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import Script from 'next/script';

import { GA_ADS_ID } from '../lib/googleAds';
import * as gtag from '../lib/gtag';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID || typeof window === 'undefined') {
      return;
    }

    const analyticsSrc = `https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`;
    const analyticsWindow = window as Window & {
      dataLayer?: unknown[][];
    };

    const getCookieValue = (cookieName: string) => {
      const encodedName = encodeURIComponent(cookieName);
      const match = document.cookie.match(new RegExp(`(?:^|; )${encodedName}=([^;]*)`));
      const cookieValue = match?.[1];
      return cookieValue ? decodeURIComponent(cookieValue) : '';
    };

    const getAnalyticsConsentFromCookieYes = (): 'granted' | 'denied' | null => {
      const consentCookie = getCookieValue('cookieyes-consent') || getCookieValue('cky-consent');
      if (!consentCookie) {
        return null;
      }

      const grantedPattern = /analytics\s*[:=]\s*(yes|true|1|allow|allowed|accept|accepted|granted)/i;
      const deniedPattern = /analytics\s*[:=]\s*(no|false|0|deny|denied|reject|rejected)/i;

      if (grantedPattern.test(consentCookie)) {
        return 'granted';
      }

      if (deniedPattern.test(consentCookie)) {
        return 'denied';
      }

      return null;
    };

    const initializeGtag = () => {
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];

      function gtagInit(...args: unknown[]) {
        analyticsWindow.dataLayer?.push(args);
      }

      window.gtag = gtagInit as typeof window.gtag;

      window.gtag?.('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });

      window.gtag?.('js', new Date());
      window.gtag?.('config', gtag.GA_TRACKING_ID, {
        send_page_view: false,
      });

      const consentState = getAnalyticsConsentFromCookieYes();
      if (consentState) {
        gtag.updateConsent(consentState);
      }

      gtag.pageview(`${window.location.pathname}${window.location.search}`);
    };

    const existingScript = document.querySelector(`script[src="${analyticsSrc}"]`) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = analyticsSrc;
      script.async = true;
      script.onload = initializeGtag;
      document.head.appendChild(script);
    } else if (typeof window.gtag !== 'function') {
      existingScript.addEventListener('load', initializeGtag, { once: true });
    }

    const syncConsent = () => {
      const consentState = getAnalyticsConsentFromCookieYes();
      if (!consentState) {
        return;
      }

      gtag.updateConsent(consentState);
    };

    const consentEvents = [
      'cookieyes_consent_update',
      'cookieyes_consent_accept',
      'cookieyes_consent_reject',
      'cookieyes_banner_close',
    ];

    consentEvents.forEach((eventName) => {
      window.addEventListener(eventName, syncConsent as EventListener);
    });

    const consentPolling = window.setInterval(syncConsent, 2000);
    const stopPollingTimer = window.setTimeout(() => window.clearInterval(consentPolling), 30000);

    return () => {
      consentEvents.forEach((eventName) => {
        window.removeEventListener(eventName, syncConsent as EventListener);
      });
      window.clearInterval(consentPolling);
      window.clearTimeout(stopPollingTimer);
    };
  }, []);

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID) {
      return;
    }

    const handleRouteChange = (url: string) => {
      if (typeof window.gtag !== 'function') {
        return;
      }
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {GA_ADS_ID && <Script strategy="lazyOnload" async src={GA_ADS_ID} crossOrigin="anonymous" />}
    </>
  );
};

export default App;
