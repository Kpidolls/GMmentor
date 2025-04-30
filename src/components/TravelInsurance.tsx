import React from 'react';
import { useTranslation } from 'react-i18next';

const TravelInsurance = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-16 lg:py-20 xl:py-24" id="travelinsurance">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-center text-gray-900 font-primary mb-6 lg:mb-8 xl:mb-10">
          {t('travelInsurance.title')}
        </h2>
        {/* Subtitle */}
        <p className="text-center text-lg lg:text-xl xl:text-2xl text-gray-600 font-secondary mb-6 lg:mb-8 xl:mb-10">
          {t('travelInsurance.subtitle')}
        </p>
        {/* Infographic */}
        <div className="flex justify-center mb-8 lg:mb-10 xl:mb-12">
          <img
            src="/assets/images/NI-info-2.png"
            alt={t('travelInsurance.imageAlt')} // Translated alt attribute
            className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg"
          />
        </div>
        {/* Call-to-Action Button */}
        <div className="flex justify-center mb-6 lg:mb-8 xl:mb-10">
          <a
            href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
            target="_self"
            rel="noopener noreferrer"
            className="px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5 bg-primary font-secondary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary transition duration-300 text-lg lg:text-xl xl:text-2xl"
            aria-label={t('travelInsurance.ctaAriaLabel')} // Translated aria-label
          >
            {t('travelInsurance.ctaButton')}
          </a>
        </div>
        {/* Description */}
        <div className="text-center text-gray-600">
          <p className="mb-4 lg:mb-6 xl:mb-8 text-base lg:text-lg xl:text-xl font-secondary sm:text-lg leading-relaxed">
            {t('travelInsurance.description1')}
          </p>
          <p className="text-base lg:text-lg xl:text-xl font-secondary sm:text-lg leading-relaxed">
            {t('travelInsurance.description2')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TravelInsurance;