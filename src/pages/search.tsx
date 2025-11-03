import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import SearchPage from '../components/SearchPage';

const Search = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Head>
        <title>{t('meta.searchTitle')}</title>
        <meta 
          name="description" 
          content={t('meta.searchDescriptionShort')} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/search" />
      </Head>
      <SearchPage />
    </>
  );
};

export default Search;