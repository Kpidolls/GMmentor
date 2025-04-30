import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import products from '../data/products.json'; // Import the JSON file

const Store: React.FC = () => {
  const { t } = useTranslation();
  const [visibleProducts, setVisibleProducts] = useState(8);

  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  return (
    <div id="store" className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-extrabold font-secondary-primary text-gray-900 sm:text-4xl text-center">
          {t('store.title')}
        </h2>
        <p className="mt-4 text-lg text-gray-600 font-secondary text-center">
          {t('store.subtitle')}
        </p>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.slice(0, visibleProducts).map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Product Image */}
              <a
                href={product.link}
                target="_self"
                rel="noopener noreferrer"
                aria-label={t('store.learnMore', { name: t(product.name) })}
                className="block"
              >
                <img
                  src={product.image}
                  alt={t('store.imageAlt', { name: t(product.name) })}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </a>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-semibold font-primary text-gray-800 mb-2 sm:mb-4 leading-tight min-h-[48px] sm:min-h-[56px]">
                  {t(product.name)}
                </h3>
                <p className="text-gray-600 font-secondary text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {t(product.description)}
                </p>
                <a
                  href={product.link}
                  target="_self"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block px-4 py-2 bg-[#0878fe] text-white font-medium rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                  aria-label={t('store.learnMore', { name: t(product.name) })}
                >
                  {t('store.products.learnMoreButton')}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {visibleProducts < products.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleViewMore}
              className="px-6 py-3 bg-primary text-white font-secondary font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
              aria-label={t('store.viewMore')}
            >
              {t('store.products.viewMoreButton')}
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500 font-secondary text-center">
          {t('store.products.footerNote')}
        </p>
      </div>
    </div>
  );
};

export default Store;