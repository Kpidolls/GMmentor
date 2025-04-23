import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/main.css';

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
        <title>Googlementor - Tools for travelers</title>
        <meta name="googlementor" content="Lists on Google Maps for travel and everyday life" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
