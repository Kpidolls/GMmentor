import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/main.css';
import '../styles/tailwind.css';
import '../styles/global.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'G-7KYV8QK51B', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>Googlementor - Location suggestions</title>
        <meta name="googlementor" content="Travel like a pro with location suggestions for your maps." />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
