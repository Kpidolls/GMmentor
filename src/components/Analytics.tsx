import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import Script from 'next/script';

import { GA_ADS_ID } from '../lib/googleAds';
import * as gtag from '../lib/gtag';

const App = () => {
  const router = useRouter();
  const analyticsInitializedRef = useRef(false);
  const initialPageviewSentRef = useRef(false);
  const analyticsConsentGrantedRef = useRef(false);
  const consentResolvedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && gtag.USING_GA_FALLBACK) {
      console.warn(
        '[Analytics] Enforcing GA measurement ID G-7KYV8QK51B for production tracking.'
      );
    }

    if (!gtag.GA_TRACKING_ID || typeof window === 'undefined') {
      if (process.env.NODE_ENV === 'development' && !gtag.GA_TRACKING_ID) {
        console.warn(
          '[Analytics] Missing GA measurement ID. Set NEXT_PUBLIC_GOOGLE_ANALYTICS (or NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GA_TRACKING_ID).'
        );
      }
      return;
    }

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

    const applyConsentState = (consentState: 'granted' | 'denied', reason: string) => {
      gtag.updateConsent(consentState);
      consentResolvedRef.current = true;
      analyticsConsentGrantedRef.current = consentState === 'granted';

      if (process.env.NODE_ENV === 'development') {
        console.info(`[Analytics] Consent ${consentState} (${reason})`);
      }

      if (consentState === 'granted' && typeof window.gtag === 'function') {
        sendInitialPageview();
      }
    };

    const sendInitialPageview = () => {
      if (initialPageviewSentRef.current) {
        return;
      }

      initialPageviewSentRef.current = true;
      gtag.pageview(`${window.location.pathname}${window.location.search}`);
    };

    const initializeGtag = () => {
      if (analyticsInitializedRef.current) {
        return;
      }

      analyticsInitializedRef.current = true;
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];

      function gtagInit(...args: unknown[]) {
        analyticsWindow.dataLayer?.push(args);
      }

      if (typeof window.gtag !== 'function') {
        window.gtag = gtagInit;
      }

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
        applyConsentState(consentState, 'cookieyes_cookie_initial');
      }
    };

    const initializeAnalytics = () => {
      initializeGtag();
    };

    initializeAnalytics();

    const syncConsent = () => {
      const consentState = getAnalyticsConsentFromCookieYes();
      if (!consentState) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Analytics] No CookieYes analytics consent found yet; GA remains denied.');
        }
        return;
      }

      applyConsentState(consentState, 'cookieyes_event_or_cookie_update');
    };

    const enableAnalyticsFallbackIfUnresolved = () => {
      if (consentResolvedRef.current) {
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      applyConsentState('granted', 'fallback_no_cookieyes_signal');
      console.warn('[Analytics] CookieYes consent signal missing; applied fallback analytics consent to restore tracking.');
    };

    const consentEvents = [
      'cookieyes_consent_update',
      'cookieyes_consent_updated',
      'cookieyes_consent_accept',
      'cookieyes_consent_reject',
      'cookieyes_banner_close',
      'cookieyes_banner_loaded',
      'cky_consent_update',
    ];

    consentEvents.forEach((eventName) => {
      window.addEventListener(eventName, syncConsent as EventListener);
    });
    syncConsent();
    const delayedConsentSyncOne = window.setTimeout(syncConsent, 1500);
    const delayedConsentSyncTwo = window.setTimeout(syncConsent, 4000);
    const consentFallbackTimeout = window.setTimeout(enableAnalyticsFallbackIfUnresolved, 6000);

    return () => {
      consentEvents.forEach((eventName) => {
        window.removeEventListener(eventName, syncConsent as EventListener);
      });
      window.clearTimeout(delayedConsentSyncOne);
      window.clearTimeout(delayedConsentSyncTwo);
      window.clearTimeout(consentFallbackTimeout);
    };
  }, []);

  useEffect(() => {
    if (!gtag.GA_TRACKING_ID) {
      return;
    }

    const handleRouteChange = (url: string) => {
      if (typeof window.gtag !== 'function' || !analyticsConsentGrantedRef.current) {
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
      {gtag.GA_TRACKING_ID && (
        <Script
          id="ga4-tag"
          strategy="afterInteractive"
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
          crossOrigin="anonymous"
        />
      )}
      {GA_ADS_ID && (
        <Script
          id="ga-ads-tag"
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
