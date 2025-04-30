import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-gray-100" id="aboutus">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-primary text-gray-900">
            {t('aboutUs.title')}
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-gray-600 font-secondary">
            {t('aboutUs.subtitle')}
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 lg:p-12">
          <p className="text-gray-700 font-secondary text-lg lg:text-xl leading-relaxed mb-6">
            {t('aboutUs.paragraph1')}
          </p>
          <p className="text-gray-700 font-secondary text-lg lg:text-xl leading-relaxed">
            {t('aboutUs.paragraph2')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;