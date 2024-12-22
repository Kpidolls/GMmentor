import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AppConfig } from '../utils/AppConfig';

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
        <style>
            {`
              @font-face {
                font-display: block;
                font-family: Roboto;
                src: url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/7529907e9eaf8ebb5220c5f9850e3811.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/25c678feafdc175a70922a116c9be3e7.woff) format("woff");
              }
              @font-face {
                font-display: fallback;
                font-family: Roboto;
                font-weight: 600;
                src: url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/6e9caeeafb1f3491be3e32744bc30440.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/71501f0d8d5aa95960f6475d5487d4c2.woff) format("woff");
              }
              @font-face {
                font-display: fallback;
                font-family: Roboto;
                font-weight: 700;
                src: url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/3ef7cf158f310cf752d5ad08cd0e7e60.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/ece3a1d82f18b60bcce0211725c476aa.woff) format("woff");
              }
              #sib-container input:-ms-input-placeholder {
                text-align: left;
                font-family: Helvetica, sans-serif;
                color: #c0ccda;
              }
              #sib-container input::placeholder {
                text-align: left;
                font-family: Helvetica, sans-serif;
                color: #c0ccda;
              }
              #sib-container textarea::placeholder {
                text-align: left;
                font-family: Helvetica, sans-serif;
                color: #c0ccda;
              }
              #sib-container a {
                text-decoration: underline;
                color: #2BB2FC;
              }
            `}
          </style>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-7KYV8QK51B"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7KYV8QK51B');
            `,
          }}
        ></script>
        <link rel="canonical" href={AppConfig.baseUrl} />
        <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css" />
        <script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/ee33fb975210e925edf22c27/script.js"></script>
        <meta name="google-site-verification" content="cUimG9-WnVYYDC8Tk1Dr6Ieh4ARJp-HzYxrbKTzYxpI" />
        <meta name="description" content="Travel like a pro with location suggestions for your maps." />
        <meta name="keywords" content="travel insurance, mobile data e-sim, mapping services, Google Maps, tourist guides, what to do" />
        <meta name="author" content="Travel Tips" />
        <meta property="og:title" content="Google Mentor - Location suggestions" />
        <meta property="og:description" content="Travel like a pro with location suggestions for your maps." />
        <meta property="og:image" content="/assets/images/newlogo1.png" />
        <meta property="og:url" content="https://www.googlementor.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Mentor - Travel like a pro" />
        <meta name="twitter:description" content="Location suggestions for your maps." />
        <meta name="twitter:image" content="/assets/images/newlogo1.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script>
            {`
              window.REQUIRED_CODE_ERROR_MESSAGE = 'Please choose a country code';
              window.LOCALE = 'en';
              window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
              window.REQUIRED_ERROR_MESSAGE = "This field cannot be left blank.";
              window.GENERIC_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
              window.translation = {
                common: {
                  selectedList: '{quantity} list selected',
                  selectedLists: '{quantity} lists selected'
                }
              };
              var autoHide = Boolean(1);
            `}
          </script>
          <script defer src="https://sibforms.com/forms/end-form/build/main.js"></script>
          <script src="https://www.google.com/recaptcha/api.js?hl=en"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
