import '../i18n';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '../styles/main.css';
import usePersistedLanguage from '../hooks/usePersistedLanguage';
import Layout from '../components/Layout';
import { Roboto } from 'next/font/google';
import BackToTop from '../components/BackToTop'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontFamily: `'Roboto', sans-serif`,
      },
    },
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  usePersistedLanguage();
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
    <ChakraProvider theme={customTheme}>
      <Head>
        <title>Googlementor - Tools for travelers</title>
        <meta name="description" content="Lists on Google Maps for travel and everyday life" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={roboto.className}>
        <Layout>
          <Component {...pageProps} />
          <BackToTop />
        </Layout>
      </main>
    </ChakraProvider>
  );
};

export default MyApp;
