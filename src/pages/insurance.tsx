import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link'; // Assuming you're using Next.js

const TravelInsurance = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24" id="travelinsurance">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        {/* Return to Home Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-lg font-medium transition duration-300"
          >
            ← {t('travelInsurance.returnHome', 'Return to Home')}
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-blue-900 font-primary mb-4">
            {t('travelInsurance.title', 'Protect Your Travels with Insurance')}
          </h2>
          <p className="text-lg lg:text-xl xl:text-2xl text-gray-700 font-secondary">
            {t('travelInsurance.subtitle', 'Affordable and reliable travel insurance for your peace of mind.')}
          </p>
        </div>

        {/* Infographic Section */}
        <div className="flex justify-center mb-12">
          <img
            src="/assets/images/NI-info-2.webp"
            alt={t('travelInsurance.imageAlt', 'Travel Insurance Infographic')}
            className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </div>

        {/* Call-to-Action Section */}
        <div className="bg-white p-8 lg:p-12 rounded-xl shadow-lg border border-gray-200 mb-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-blue-800 text-center mb-6">
            {t('travelInsurance.ctaTitle', 'Get Covered Today!')}
          </h3>
          <p className="text-center text-gray-600 text-lg lg:text-xl mb-6">
            {t('travelInsurance.ctaDescription', 'Sign up now and enjoy worry-free travels with comprehensive coverage.')}
          </p>
          <div className="flex justify-center">
            <a
              href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
              target="_self"
              rel="noopener noreferrer"
              className="px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5 bg-blue-600 font-secondary text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition duration-300 text-lg lg:text-xl xl:text-2xl"
              aria-label={t('travelInsurance.ctaAriaLabel', 'Sign up for travel insurance')}
            >
              {t('travelInsurance.ctaButton', 'Get Started')}
            </a>
          </div>
        </div>

        {/* Description Section */}
        <div className="text-center text-gray-700">
          <p className="mb-6 text-base lg:text-lg xl:text-xl font-secondary sm:text-lg leading-relaxed">
            {t('travelInsurance.description1', 'Travel insurance provides financial protection and peace of mind during your trips.')}
          </p>
          <p className="text-base lg:text-lg xl:text-xl font-secondary sm:text-lg leading-relaxed">
            {t('travelInsurance.description2', 'Whether it’s medical emergencies, trip cancellations, or lost luggage, we’ve got you covered.')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TravelInsurance;