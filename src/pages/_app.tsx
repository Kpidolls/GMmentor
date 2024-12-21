import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/main.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
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
