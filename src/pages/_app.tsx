import '../i18n';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '../styles/main.css';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import usePersistedLanguage from '../hooks/usePersistedLanguage';
import Layout from '../components/Layout';
import { Roboto } from 'next/font/google';
import Header from '../components/Header';

const BackToTop = dynamic(() => import('../components/BackToTop'), { ssr: false });
const Analytics = dynamic(() => import('../components/Analytics'), { ssr: false });

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'optional',
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

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const cleanupDevServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length === 0) return;

        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        }

        if (navigator.serviceWorker.controller && !sessionStorage.getItem('dev-sw-cleaned')) {
          sessionStorage.setItem('dev-sw-cleaned', '1');
          window.location.reload();
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to cleanup service workers in development:', error);
        }
      }
    };

    cleanupDevServiceWorkers();
  }, []);

  return (
    <ChakraProvider theme={customTheme}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Analytics />
      <Header />
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

