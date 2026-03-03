const REQUIRED_GA_TRACKING_ID = 'G-7KYV8QK51B';

const ENV_TRACKING_ID_CANDIDATES = [
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  process.env.NEXT_PUBLIC_GA_ID,
  process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
].filter(Boolean) as string[];

const configuredTrackingId = ENV_TRACKING_ID_CANDIDATES[0]?.trim().toUpperCase();
const gaIdPattern = /^G-[A-Z0-9]+$/;
const hasValidConfiguredTrackingId = !!configuredTrackingId && gaIdPattern.test(configuredTrackingId);

if (process.env.NODE_ENV === 'production' && configuredTrackingId && !gaIdPattern.test(configuredTrackingId)) {
  console.warn(
    `[Analytics] Invalid GA ID "${configuredTrackingId}". Falling back to "${REQUIRED_GA_TRACKING_ID}".`
  );
}

export const GA_TRACKING_ID = hasValidConfiguredTrackingId
  ? configuredTrackingId
  : REQUIRED_GA_TRACKING_ID;
export const USING_GA_FALLBACK = !hasValidConfiguredTrackingId;

const hasGaDebugQueryFlag = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('ga_debug') === '1';
};

export const isGaDebugModeEnabled = () => {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true' ||
    hasGaDebugQueryFlag()
  );
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentState = 'granted' | 'denied';

const normalizePagePath = (rawUrl: string) => {
  const sanitizedRawUrl = typeof rawUrl === 'string' ? rawUrl : '/';
  const [urlWithoutHash = '/'] = sanitizedRawUrl.split('#');
  const [pathname = '/', search = ''] = urlWithoutHash.split('?');

  let normalizedPathname: string = pathname;

  if (normalizedPathname.startsWith('http://') || normalizedPathname.startsWith('https://')) {
    try {
      const parsedUrl = new URL(normalizedPathname);
      normalizedPathname = parsedUrl.pathname;
    } catch {
      normalizedPathname = '/';
    }
  }

  if (!normalizedPathname.startsWith('/')) {
    normalizedPathname = `/${normalizedPathname}`;
  }

  if (normalizedPathname.length > 1 && normalizedPathname.endsWith('/')) {
    normalizedPathname = normalizedPathname.replace(/\/+$/, '');
  }

  return search ? `${normalizedPathname}?${search}` : normalizedPathname;
};

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

  const normalizedPath = normalizePagePath(url);

  const normalizedLocation = `${window.location.origin}${normalizedPath}`;

  window.gtag?.('config', GA_TRACKING_ID, {
    page_path: normalizedPath,
    debug_mode: isGaDebugModeEnabled(),
  });

  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_location: normalizedLocation,
    page_path: normalizedPath,
    debug_mode: isGaDebugModeEnabled(),
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
