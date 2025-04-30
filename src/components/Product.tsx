import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import mapOptions from '../data/mapOptions.json'; // Import the JSON file

const Product = () => {
  const { t } = useTranslation();
  const [visibleOptions, setVisibleOptions] = useState(12);

  const handleViewMore = () => {
    setVisibleOptions(mapOptions.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      <h1 className="text-4xl font-primary font-bold text-[#001c28] mb-8 text-center">
        {t('product.title')}
      </h1>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {mapOptions.slice(0, visibleOptions).map((option, index) => (
          <div
            key={index}
            id={option.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={option.img}
              alt={t('product.imageAlt', { title: t(option.title) })}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold font-primary text-gray-800 mb-2 h-8 sm:h-14 overflow-hidden">
                {t(option.title)}
              </h3>
              <p className="text-gray-600 font-secondary text-sm mb-2 sm:mb-4 h-12 sm:h-20 overflow-hidden">
                {t(option.description)}
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a
                  href={option.link}
                  target={option.target}
                  rel={option.rel}
                  className="flex-1 inline-block px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                  aria-label={t('product.explore', { title: t(option.title) })}
                >
                  {t('product.exploreButton')}
                </a>
                <button
                  onClick={() => {
                    const shareText = t('product.shareText', { title: t(option.title) });
                    if (navigator.share) {
                      navigator.share({
                        title: t(option.title),
                        text: shareText,
                        url: option.link,
                      });
                    } else {
                      alert(t('product.shareNotSupported'));
                    }
                  }}
                  className="flex-1 inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
                  aria-label={t('product.share', { title: t(option.title) })}
                >
                  {t('product.shareButton')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center font-secondary text-gray-500 text-sm">
        {t('product.attribution')}
      </div>
      {visibleOptions < mapOptions.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="px-6 py-3 bg-primary font-secondary text-white font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
            aria-label={t('product.viewMore')}
          >
            {t('product.viewMoreButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Product;