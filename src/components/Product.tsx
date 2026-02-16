import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import mapOptions from '../data/mapOptions.json';

const Product = () => {
  const { t } = useTranslation();
  const [visibleOptions, setVisibleOptions] = useState(12);

  const handleViewMore = () => {
    setVisibleOptions(mapOptions.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
        {t('product.title')}
      </h1> */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-stretch">
        {mapOptions.slice(0, visibleOptions).map((option, index) => (
          <div
            key={index}
            id={option.id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
          >
            <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={option.img}
                alt={t('product.imageAlt', { title: t(option.title) })}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                width={400}
                height={400}
                style={{ aspectRatio: '1 / 1', maxHeight: '100%' }}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-xl font-semibold font-primary text-gray-800 mb-2 h-8 sm:h-14 overflow-hidden text-center group-hover:text-[#0878fe] transition-colors duration-300">
                {t(option.title)}
              </h3>
              <p className="text-gray-600 font-secondary text-sm mb-2 sm:mb-4 min-h-[3.5em] sm:min-h-[5em] text-center">
                {t(option.description)}
              </p>
              <div className="flex flex-wrap gap-4 mt-auto justify-center">
                <a
                  href={option.link}
                  target={option.target}
                  rel={option.rel}
                  className="flex-1 min-w-[120px] inline-block px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
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
                  className="flex-1 min-w-[120px] inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
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
            className="px-6 py-3 bg-blue-600 font-secondary text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
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