import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import Header from '../components/Header';

const TravelInsurance = () => {
  const { t } = useTranslation();

  return (
    <main className="bg-gray-50 min-h-screen">
      <Head>
        <link rel="canonical" href="https://googlementor.com/insurance" />
      </Head>
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            {t('travelInsurance.title', 'Protect Your Travels with Insurance')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
            {t(
              'travelInsurance.subtitle',
              'Affordable and reliable travel insurance for your peace of mind.'
            )}
          </p>
        </div>

        {/* Infographic Section */}
        <div className="flex justify-center mb-12">
          <img
            src="/assets/images/NI-info-2.webp"
            alt={t('travelInsurance.imageAlt', 'Travel Insurance Infographic')}
            className="w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-lg shadow-lg hover:opacity-90 transition"
          />
        </div>

        {/* Call-to-Action Section */}
        <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-xl shadow-lg border border-gray-200 mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 text-center mb-6">
            {t('travelInsurance.ctaTitle', 'Get Covered Today!')}
          </h2>
          <p className="text-center text-gray-600 text-base sm:text-lg lg:text-xl mb-6">
            {t(
              'travelInsurance.ctaDescription',
              'Sign up now and enjoy worry-free travels with comprehensive coverage.'
            )}
          </p>
          <div className="flex justify-center">
            <a
              href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
              target="_self"
              rel="noopener noreferrer"
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition text-base sm:text-lg lg:text-xl"
              aria-label={t('travelInsurance.ctaAriaLabel', 'Sign up for travel insurance')}
            >
              {t('travelInsurance.ctaButton', 'Get Started')}
            </a>
          </div>
        </div>

        {/* Description Section */}
        <div className="text-center text-gray-700 space-y-6">
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
            {t(
              'travelInsurance.description1',
              'Travel insurance provides financial protection and peace of mind during your trips.'
            )}
          </p>
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
            {t(
              'travelInsurance.description2',
              'Whether it’s medical emergencies, trip cancellations, or lost luggage, we’ve got you covered.'
            )}
          </p>
        </div>
      </div>
    </main>
  );
};

export default TravelInsurance;