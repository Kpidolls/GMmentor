// pages/_document.tsx
/* eslint-disable @next/next/no-head-element */
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AppConfig } from '../utils/AppConfig';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
          <meta charSet="utf-8" />

          {/* PWA Meta Tags */}
          <meta name="application-name" content="Googlementor" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Googlementor" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#0f172a" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Favicons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          
          {/* Apple PWA Icons */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

          {/* Enhanced SEO meta */}
          <meta
            name="description"
            content="Discover Greece like a local with Googlementor's curated travel maps, authentic restaurant guides, and expert recommendations for Athens, islands, and hidden gems across Greece."
          />
          <meta
            name="keywords"
            content="Greece travel guide, Athens restaurants, Greek islands maps, travel insurance, mobile data eSIM, authentic tavernas, Greek destinations, travel planning tools"
          />
          <meta name="author" content="Googlementor Travel Guides" />
          <meta name="google-site-verification" content="cUimG9-WnVYYDC8Tk1Dr6Ieh4ARJp-HzYxrbKTzYxpI" />

          {/* Open Graph */}
          <meta property="og:title" content="Googlementor" />
          <meta
            property="og:description"
            content="Googlementor – Travel lists for trip planning"
          />
          <meta property="og:image" content="/assets/images/newlogo1.webp" />
          <meta property="og:url" content="https://googlementor.com" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Googlementor - Travel better" />
          <meta name="twitter:description" content="Travel lists for trip planning" />
          <meta name="twitter:image" content="/assets/images/newlogo1.webp" />


        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Lazy load CookieYes consent script (production only) */}
          {process.env.NODE_ENV === 'production' && (
            <Script
              id="cookieyes"
              src="https://cdn-cookieyes.com/client_data/ee33fb975210e925edf22c27/script.js"
              strategy="lazyOnload"
            />
          )}
          {/* Lazy load reCAPTCHA */}
          <Script
            id="recaptcha"
            src="https://www.google.com/recaptcha/api.js?hl=en"
            strategy="lazyOnload"
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

