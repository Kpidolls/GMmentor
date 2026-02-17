import '../i18n';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '../styles/main.css';
import usePersistedLanguage from '../hooks/usePersistedLanguage';
import Layout from '../components/Layout';
import { Roboto } from 'next/font/google';
import BackToTop from '../components/BackToTop'
import Header from '../components/Header';
import Analytics from '../components/Analytics';

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

