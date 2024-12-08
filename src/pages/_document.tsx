import Document, { Html, Head, Main, NextScript } from 'next/document';

import { AppConfig } from '../utils/AppConfig';

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
        <link rel="canonical" href={AppConfig.baseUrl} />
        <meta name="google-site-verification" content="cUimG9-WnVYYDC8Tk1Dr6Ieh4ARJp-HzYxrbKTzYxpI" />
        <meta name="description" content="Enhance your traveling. From travel insurance to mobile data e-SIMS, we have you covered." />
        <meta name="keywords" content="travel insurance, mobile data e-sim, mapping services, Google Maps, tourist guides" />
        <meta name="author" content="Travel Tips" />
        <meta property="og:title" content="Google Mentor - custom maps" />
        <meta property="og:description" content="Enhance your traveling. From travel insurance to mobile data e-SIMS, we have you covered." />
        <meta property="og:image" content="/assets/images/newlogo1.png" />
        <meta property="og:url" content="https://www.googlementor.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Mentor - Enhance Your Experience with custom maps" />
        <meta name="twitter:description" content="Enhance your traveling. From travel insurance to mobile data e-SIMS, we have you covered." />
        <meta name="twitter:image" content="/assets/images/newlogo1.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
