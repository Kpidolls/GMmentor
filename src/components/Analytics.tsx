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
    let fallbackTimeout: number | undefined;
    let idleCallbackId: number | undefined;
    let hasLoaded = false;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
      dataLayer?: unknown[][];
    };

    const initializeGtag = () => {
      idleWindow.dataLayer = idleWindow.dataLayer || [];
      function gtagInit(...args: unknown[]) {
        idleWindow.dataLayer?.push(args);
      }
      window.gtag = gtagInit as typeof window.gtag;
      window.gtag('js', new Date());
      window.gtag('config', gtag.GA_TRACKING_ID, {
        page_path: window.location.pathname,
      });
    };

    const loadAnalytics = () => {
      if (hasLoaded || document.querySelector(`script[src="${analyticsSrc}"]`)) {
        hasLoaded = true;
        return;
      }

      hasLoaded = true;
      const script = document.createElement('script');
      script.src = analyticsSrc;
      script.async = true;
      script.onload = initializeGtag;
      document.head.appendChild(script);
    };

    const triggerLoad = () => {
      loadAnalytics();
      removeInteractionListeners();
    };

    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

    const addInteractionListeners = () => {
      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, triggerLoad, { passive: true, once: true });
      });
    };

    const removeInteractionListeners = () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, triggerLoad);
      });
    };

    addInteractionListeners();

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleCallbackId = idleWindow.requestIdleCallback(
        () => {
          triggerLoad();
        },
        { timeout: 6000 }
      );
    } else {
      fallbackTimeout = window.setTimeout(() => {
        triggerLoad();
      }, 3500);
    }

    return () => {
      removeInteractionListeners();
      if (typeof idleCallbackId === 'number' && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleCallbackId);
      }
      if (typeof fallbackTimeout === 'number') {
        window.clearTimeout(fallbackTimeout);
      }
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
