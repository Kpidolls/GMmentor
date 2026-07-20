import React from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import SearchPage from '../components/SearchPage';
import { getStaticMetaDescription } from '../config/metaDescriptions';
import { loadEntitiesIndex, type EntityRecord } from '../lib/entities';

type SearchPageProps = {
  placeEntities: EntityRecord[];
};

const Search = ({ placeEntities }: SearchPageProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || i18n.resolvedLanguage || 'en').split('-')[0];
  const metaDescription = getStaticMetaDescription('search', currentLang);
  
  return (
    <>
      <Head>
        <title>{t('meta.searchTitle')}</title>
        <meta 
          name="description" 
          content={metaDescription} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/search" />
      </Head>
      <SearchPage placeEntities={placeEntities} />
    </>
  );
};

export default Search;

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  const entities = loadEntitiesIndex().entities.filter((entity) => Boolean(entity.slug));

  return {
    props: {
      placeEntities: entities,
    },
  };
};