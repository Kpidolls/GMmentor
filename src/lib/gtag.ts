const REQUIRED_GA_TRACKING_ID = 'G-7KYV8QK51B';

const ENV_TRACKING_ID_CANDIDATES = [
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  process.env.NEXT_PUBLIC_GA_ID,
  process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
].filter(Boolean) as string[];

const configuredTrackingId = ENV_TRACKING_ID_CANDIDATES[0]?.trim().toUpperCase();
const gaIdPattern = /^G-[A-Z0-9]+$/;

if (
  process.env.NODE_ENV === 'production' &&
  configuredTrackingId &&
  configuredTrackingId !== REQUIRED_GA_TRACKING_ID
) {
  console.warn(
    `[Analytics] Ignoring mismatched GA ID "${configuredTrackingId}". Using required property ID "${REQUIRED_GA_TRACKING_ID}".`
  );
}

export const GA_TRACKING_ID =
  configuredTrackingId && gaIdPattern.test(configuredTrackingId) && configuredTrackingId === REQUIRED_GA_TRACKING_ID
    ? configuredTrackingId
    : REQUIRED_GA_TRACKING_ID;
export const USING_GA_FALLBACK = !configuredTrackingId;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentState = 'granted' | 'denied';

const canUseGtag = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function' && !!GA_TRACKING_ID;
};

export const updateConsent = (analyticsStorage: ConsentState) => {
  if (!canUseGtag()) {
    return;
  }

  window.gtag?.('consent', 'update', {
    analytics_storage: analyticsStorage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!canUseGtag()) {
    return;
  }

  window.gtag?.('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: any;
  category: any;
  label: any;
  value: any;
}) => {
  if (!canUseGtag()) {
    return;
  }

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};
