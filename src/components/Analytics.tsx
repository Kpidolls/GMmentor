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

    const normalizeConsentValue = (value: unknown): 'granted' | 'denied' | null => {
      if (typeof value === 'boolean') {
        return value ? 'granted' : 'denied';
      }

      if (typeof value === 'number') {
        if (value === 1) {
          return 'granted';
        }
        if (value === 0) {
          return 'denied';
        }
        return null;
      }

      if (typeof value === 'string') {
        const normalizedValue = value.trim().toLowerCase();
        if (['yes', 'true', '1', 'allow', 'allowed', 'accept', 'accepted', 'granted'].includes(normalizedValue)) {
          return 'granted';
        }

        if (['no', 'false', '0', 'deny', 'denied', 'reject', 'rejected'].includes(normalizedValue)) {
          return 'denied';
        }
      }

      return null;
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

      try {
        const parsedConsent = JSON.parse(consentCookie) as Record<string, unknown>;
        const directValue = normalizeConsentValue(parsedConsent.analytics);
        if (directValue) {
          return directValue;
        }

        const consentGroup = parsedConsent.consent as Record<string, unknown> | undefined;
        const categoryGroup = parsedConsent.categories as Record<string, unknown> | undefined;

        const consentValue = normalizeConsentValue(consentGroup?.analytics);
        if (consentValue) {
          return consentValue;
        }

        const categoryValue = normalizeConsentValue(categoryGroup?.analytics);
        if (categoryValue) {
          return categoryValue;
        }
      } catch {
      }

      const quotedMatch = consentCookie.match(/"analytics"\s*:\s*("?)(true|false|yes|no|1|0)\1/i);
      if (quotedMatch?.[2]) {
        return normalizeConsentValue(quotedMatch[2]);
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

    const loadAnalytics = () => {
      const existingScript = document.querySelector(`script[src="${analyticsSrc}"]`) as HTMLScriptElement | null;

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = analyticsSrc;
        script.async = true;
        script.onload = initializeGtag;
        document.head.appendChild(script);
        return;
      }

      if (typeof window.gtag !== 'function') {
        existingScript.addEventListener('load', initializeGtag, { once: true });
      }
    };

    const analyticsBootDelay = window.setTimeout(loadAnalytics, 1200);

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
    const delayedConsentSync = window.setTimeout(syncConsent, 4000);

    return () => {
      consentEvents.forEach((eventName) => {
        window.removeEventListener(eventName, syncConsent as EventListener);
      });
      window.clearTimeout(analyticsBootDelay);
      window.clearTimeout(delayedConsentSync);
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
      {GA_ADS_ID && (
        <Script
          strategy="lazyOnload"
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
};

export default App;
