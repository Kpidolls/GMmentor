import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import Script from 'next/script';

import { GA_ADS_ID } from '../lib/googleAds';
import * as gtag from '../lib/gtag';

type ConsentState = 'granted' | 'denied';
const LOCAL_CONSENT_KEY = 'googlementor_analytics_consent';

const App = () => {
  const router = useRouter();
  const analyticsInitializedRef = useRef(false);
  const initialPageviewSentRef = useRef(false);
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
      CookieYes?: {
        consent?: Record<string, unknown>;
      };
      ckyConsent?: {
        categories?: Record<string, unknown>;
      };
    };

    const getCookieValue = (cookieName: string) => {
      const encodedName = encodeURIComponent(cookieName);
      const match = document.cookie.match(new RegExp(`(?:^|; )${encodedName}=([^;]*)`));
      const cookieValue = match?.[1];
      return cookieValue ? decodeURIComponent(cookieValue) : '';
    };

    const normalizeConsentValue = (value: unknown): ConsentState | null => {
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

    const extractConsentFromCategoryList = (value: unknown): ConsentState | null => {
      if (!Array.isArray(value)) {
        return null;
      }

      const normalizedEntries = value
        .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
        .filter(Boolean);

      if (normalizedEntries.includes('analytics')) {
        return 'granted';
      }

      return null;
    };

    const getAnalyticsConsentFromCookieYes = (): ConsentState | null => {
      const cookieYesConsent = analyticsWindow.CookieYes?.consent as Record<string, unknown> | undefined;
      const cookieYesApiValue = normalizeConsentValue(cookieYesConsent?.analytics);
      if (cookieYesApiValue) {
        return cookieYesApiValue;
      }

      const ckyConsentCategories = analyticsWindow.ckyConsent?.categories as Record<string, unknown> | undefined;
      const ckyApiValue = normalizeConsentValue(ckyConsentCategories?.analytics);
      if (ckyApiValue) {
        return ckyApiValue;
      }

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

    const getAnalyticsConsentFromEvent = (event?: Event): ConsentState | null => {
      if (!event) {
        return null;
      }

      const detail = (event as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== 'object') {
        return null;
      }

      const detailRecord = detail as Record<string, unknown>;

      const directCandidates = [
        detailRecord.analytics,
        detailRecord.analytics_storage,
        detailRecord.value,
        detailRecord.status,
      ];

      for (const candidate of directCandidates) {
        const normalizedCandidate = normalizeConsentValue(candidate);
        if (normalizedCandidate) {
          return normalizedCandidate;
        }
      }

      const acceptedCategories =
        extractConsentFromCategoryList(detailRecord.accepted) ||
        extractConsentFromCategoryList(detailRecord.acceptedCategories) ||
        extractConsentFromCategoryList(detailRecord.categoriesAllowed);

      if (acceptedCategories) {
        return acceptedCategories;
      }

      const rejectedCandidates = [detailRecord.rejected, detailRecord.rejectedCategories, detailRecord.categoriesDisallowed];
      for (const candidate of rejectedCandidates) {
        if (Array.isArray(candidate)) {
          const normalizedEntries = candidate
            .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
            .filter(Boolean);

          if (normalizedEntries.includes('analytics')) {
            return 'denied';
          }
        }
      }

      const categoriesValue = detailRecord.categories as Record<string, unknown> | undefined;
      const categoryConsent = normalizeConsentValue(categoriesValue?.analytics);
      if (categoryConsent) {
        return categoryConsent;
      }

      const consentValue = detailRecord.consent as Record<string, unknown> | undefined;
      const consentAnalytics = normalizeConsentValue(consentValue?.analytics);
      if (consentAnalytics) {
        return consentAnalytics;
      }

      return null;
    };

    const readPersistedConsentState = (): ConsentState | null => {
      if (typeof window === 'undefined') {
        return null;
      }

      try {
        const storedValue = window.localStorage.getItem(LOCAL_CONSENT_KEY);
        return normalizeConsentValue(storedValue);
      } catch {
        return null;
      }
    };

    const persistConsentState = (consentState: ConsentState) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        window.localStorage.setItem(LOCAL_CONSENT_KEY, consentState);
      } catch {
      }
    };

    const applyConsentState = (consentState: ConsentState, reason: string) => {
      gtag.updateConsent(consentState);
      consentResolvedRef.current = true;
      persistConsentState(consentState);

      if (process.env.NODE_ENV === 'development') {
        console.info(`[Analytics] Consent ${consentState} (${reason})`);
      }

      if (typeof window.gtag === 'function') {
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
    sendInitialPageview();

    const syncConsent = (event?: Event) => {
      const consentState = getAnalyticsConsentFromEvent(event) || getAnalyticsConsentFromCookieYes();
      if (!consentState) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Analytics] No CookieYes analytics consent found yet; GA remains denied.');
        }
        return;
      }

      applyConsentState(consentState, 'cookieyes_event_or_cookie_update');
    };

    const applyPersistedFallbackConsent = () => {
      if (consentResolvedRef.current || process.env.NODE_ENV !== 'production') {
        return;
      }

      const persistedConsent = readPersistedConsentState();
      if (!persistedConsent) {
        return;
      }

      applyConsentState(persistedConsent, 'persisted_consent_fallback');

      if (process.env.NODE_ENV === 'production') {
        console.warn('[Analytics] CookieYes signal missing; restored previously saved analytics consent.');
      }
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
    const consentFallbackTimeout = window.setTimeout(applyPersistedFallbackConsent, 5000);

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
