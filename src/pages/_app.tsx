import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/main.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Google Mentor - Enhance Your Travel Experience with custom maps</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
