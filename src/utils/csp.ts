const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com https://widget.getyourguide.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://cdn-cookieyes.com https://maps.googleapis.com https://maps.gstatic.com https://api.mapbox.com https://*.openstreetmap.org https://widget.getyourguide.com https://www.getyourguide.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://www.youtube.com https://widget.getyourguide.com https://www.getyourguide.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
];

export const contentSecurityPolicy = cspDirectives.join('; ');
