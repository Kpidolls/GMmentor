// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AppConfig } from '../utils/AppConfig';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
          <meta charSet="utf-8" />
          {/* <link
            rel="preload"
            as="image"
            href="/assets/images/cover.webp"
            type="image/webp"
          /> */}
          {/* Preload key assets */}
          <link
            rel="preload"
            as="image"
            href="/assets/images/newlogo1.webp"
            type="image/png"
          />

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


          {/* External form styles (can be removed if inlined) */}
          {/* <link
            rel="stylesheet"
            href="https://sibforms.com/forms/end-form/build/sib-styles.css"
          /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
            {/* Preconnect to external resources for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            {/* Lazy load CookieYes consent script */}
          <Script
            id="cookieyes"
            src="https://cdn-cookieyes.com/client_data/ee33fb975210e925edf22c27/script.js"
            strategy="lazyOnload"
          />
          {/* Lazy load reCAPTCHA */}
          <Script
            id="recaptcha"
            src="https://www.google.com/recaptcha/api.js?hl=en"
            strategy="lazyOnload"
          />
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-7KYV8QK51B"
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7KYV8QK51B');
            `}
          </Script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
