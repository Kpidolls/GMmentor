import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import ItineraryPage from '../components/itinerary/ItineraryPage';

const Itinerary = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('meta.itineraryTitle', 'My Greece Itinerary | Googlementor')}</title>
        <meta
          name="description"
          content={t(
            'meta.itineraryDescription',
            'Create and manage your Greece itinerary entirely in your browser. Add days and places, export and import JSON or TXT, and share with a link.'
          )}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/itinerary" />
      </Head>
      <ItineraryPage />
    </>
  );
};

export default Itinerary;
